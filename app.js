const epxress = require('express');
const app = epxress();
const https = require('https');
const http = require('http');
const port = 3333 ?? 443;
const path = require('path');
const axios = require('axios');
const store = require('store');
const cors = require('cors');
const fs = require('fs');
const qs = require('qs');
const session = require('express-session');
// const MemoryStore = require();

const express = require('express');

const { authentication } = require('./routers/middleware/authenfication');
require('dotenv').config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//html을 렌더링하기 위한 부품, pug, ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/pages'));

//view engine대신 fs.readFileSync으로 html 을 불러오는 방법
/**
 * fs.readFile("./views/index.html", "utf8", function (err,buf) {
        res.end(buf);
    })
 * app.use(express.static(__dirname + "/views"));
 */

/* Body Parser */
/**
 * express 문서에 따르면 어떤 미들웨어 없이 req.body에 접근 할 경우 undefined를 반환받는다.
 * 그 이유는 req.body는 Default로 Undefined로 설정되었기 때문이다.
 *
 * BodyParser와 Multer로 해결해주는데 Bodyparser경우 express에 내장되어 더이상 불필요해졌다.
 */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let corsOption = {
  Credential: true,
};
//
app.use(cors(corsOption));

/* 세션 사용 */
/**
 *  세션은 기본적으로 클라이언트나 서버상 메모리 저장소에 저장되기 때문에 껐다 키면 사라지는
 *
 *  사라지는 휘발성을 가지고있다.
 *
 *  아래처럼 작성해주면 쿠키가 생성되며 req.session의 값도 생성해준다. 어느 라우터든 존재한다.
 */
app.use(
  session({
    //필수 옵션이며 String, Array형태로 사용. Array는 첫번째 인자만 비밀키로 사용
    secret: 'ananymous',
    //resave는 세션이 변경이 있을 때만 세션을 저장한다. 보통은 불필요한 저장을 막기 위해 false로 한다.
    resave: false,
    //세션이 생성되어도 데이터가 추가되거나 변경되지않은 상태를 Uninitialized라고 한다. true는 이 상태의 세션도 저장한다.
    saveUninitialized: true,
    //세션을 어디에 저장할지 결정하는 옵션이다, default는 MemoryStore
  }),
);

const kakao_info = {
  clientID: process.env.KAKAO_CLIENT_ID,
  client_secret: process.env.KAKAO_CLIENT_SECRET,
  client_admin: process.env.KAKAO_ADMIN_KEY,
  redirect_url: `https://localhost:3333/oauth/kakao/login`,
};

/* 카카오 인증 확인 */
app.get('/oauth/kakao', (req, res) => {
  const kakao_url = `https://kauth.kakao.com/oauth/authorize?client_id=${kakao_info.clientID}&redirect_uri=${kakao_info.redirect_url}&response_type=code&scope=profile_nickname,profile_image,account_email`;
  res.status(302).redirect(kakao_url);
});

/* 카카오 발급 */
//카카오 리디렉트 주소를 설정 후, get으로 인증 주소를 가져온다.
app.get('/oauth/kakao/login', async (req, res) => {
  //토큰을 담아주기 위한 변수
  let token;

  try {
    //axios를 쓰면 Promise보다 편리해짐.
    token = await axios({
      method: 'POST', //메소드
      url: 'https://kauth.kakao.com/oauth/token', //url
      headers: {
        //요청헤더
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: qs.stringify({
        //req.data에 queryString으로 데이터를 보냄
        grant_type: 'authorization_code',
        client_id: kakao_info.clientID,
        client_secret: kakao_info.client_secret,
        redirect_uri: kakao_info.redirect_url,
        code: req.query.code,
      }),
    });
  } catch (error) {
    console.log(error.message);
    res.json(error);
  }

  req.session.auth_token = { ['acc_tkn']: token.data.access_token };
  console.log(req.session.auth_data);
  //로컬 스토리지 비슷한 기능을 store라이브러리를 통해 사용가능
  // store.set('testKkoTk', testKkoTk);

  //토큰을 발급 받고 바로 사용자 정보 가져오기
  let user;
  // let usertkn = store.get('testKkoTk');
  try {
    user = await axios({
      method: 'GET',
      url: 'https://kapi.kakao.com/v2/user/me',
      headers: {
        Authorization: `Bearer ${token.data.access_token}`,
      },
    });

    console.log(user.data);

    //유저 데이터를 임시로 저장(세션으로저장)
    req.session.auth_data = { ['kakaos']: user.data };
    // req.session.auth_login = user.data;
    // store.set('kakao_data', user.data);

    // res.status(200).json(user.data);
  } catch (error) {
    console.log(error.message);
    res.json(error);
  }

  res.status(302).redirect('/');
});

/* 카카오 프로필 */
app.get('/oauth/kakao/account_info', authentication, async (req, res) => {
  let { nickname, profile_image } = req.session.auth_data.kakaos.properties;
  //store.get('kakao_data').properties;
  console.log(nickname, profile_image);
  res.render('account_profile', {
    nickname,
    profile_image,
  });
});

/* 카카오 로그아웃 */
app.get('/oauth/kakao/logout', authentication, async (req, res) => {
  const { acc_tkn } = req.session.auth_token;
  console.log(req.session.auth_data);
  try {
    await axios({
      method: 'POST',
      url: `https://kapi.kakao.com/v1/user/logout`,
      headers: {
        Authorization: `Bearer ${acc_tkn}`,
      },
    });
  } catch (error) {
    res.json(error);
  }
});

/* 카카오 인증 연결 끊기 */
app.get(`/oauth/kakao/unlink`, authentication, async (req, res) => {
  const { acc_tkn } = req.session.auth_token;
  const { kakaos } = req.session.auth_data;
  //카카오 API에게 삭제 요청 결과를 담아준다.
  let del_id;

  try {
    del_id = await axios({
      method: 'POST',
      url: `https://kapi.kakao.com/v1/user/unlink`,
      headers: {
        Authorization: `Bearer ${acc_tkn}`,
      },
    });

    console.log(del_id);
  } catch (error) {
    res.json(error);
  }

  const { id } = del_id.data;
  console.log(id);

  //현재 페이지와 응답받은 사용자의 id가 일치한다면..
  if (kakaos.id === id) {
    //해당 세션을 지워버림
    delete req.session.auth_data;
    delete req.session.auth_token;
  }

  console.log('삭제', req.session);
  res.status(302).redirect('/');
});

/* Router */
//app.get('/oauth/kakao/unlink')
app.get('/', (req, res) => {
  // res.send("Root")
  console.log(req.session);
  res.render('index');
});

//Openssl을 이용한 인증서
const sslOption = {
  key: fs.readFileSync('./lh.key'),
  cert: fs.readFileSync('./lh.crt'),
};

https.createServer(sslOption, app).listen(port);
// app.listen(port);
