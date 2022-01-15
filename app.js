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
require('dotenv').config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//html을 렌더링하기 위한 부품, pug, ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//view engine대신 fs.readFileSync으로 html 을 불러오는 방법
/**
 * fs.readFile("./views/index.html", "utf8", function (err,buf) {
        res.end(buf);
    })
 * app.use(express.static(__dirname + "/views"));
 */

let corsOption = {
  Credential: true,
};
//
app.use(cors(corsOption));

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
  let token;

  try {
    token = await axios({
      method: 'POST',
      url: 'https://kauth.kakao.com/oauth/token',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: qs.stringify({
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
  let testKkoTk = token.data.access_token;
  console.log(token.data.access_token);

  //로컬 스토리지 비슷한 기능을 store라이브러리를 통해 사용가능
  store.set('testKkoTk', testKkoTk);

  console.log(testKkoTk);

  let user;
  // let usertkn = store.get('testKkoTk');
  try {
    user = await axios({
      method: 'GET',
      url: 'https://kapi.kakao.com/v2/user/me',
      headers: {
        Authorization: `Bearer ${testKkoTk}`,
      },
    });
    console.log(user.data);

    //유저 데이터를 임시로 저장
    store.set('kakao_data', user.data);

    // res.status(200).json(user.data);
  } catch (error) {
    console.log(error.message);
    res.json(error);
  }

  res.status(302).redirect('/');
});

/* 카카오 프로필 */
app.get('/oauth/kakao/account_info', async (req, res) => {
  let { nickname, profile_image } = store.get('kakao_data').properties;
  console.log(nickname, profile_image);
  res.render('account_profile', {
    nickname,
    profile_image,
  });
});

/* 카카오 로그아웃 */
app.get('/oauth/kakao/logout', async (req, res) => {
  const targetTk = store.get('testKkoTk');
  try {
    await axios({
      method: 'POST',
      url: `https://kapi.kakao.com/v1/user/logout`,
      headers: {
        Authorization: `Bearer ${targetTk}`,
      },
    });
  } catch (error) {
    res.json(error);
  }

  // res.status(302).redirect('/');
});

/* 카카오 인증 연결 끊기 */
app.get(`/oauth/kakao/unlink`, async (req, res) => {
  const targetTk = store.get('testKkoTk');
  await axios({
    method: 'POST',
    url: `https://kapi.kakao.com/v1/user/unlink`,
    headers: {
      Authorization: `Bearer ${targetTk}`,
    },
  });

  console.log(targetTk);

  // res.status(302).redirect('/');
});

/* Router */
//app.get('/oauth/kakao/unlink')
app.get('/', (req, res) => {
  // res.send("Root")
  res.render('index');
});

//Openssl을 이용한 인증서
const sslOption = {
  key: fs.readFileSync('./lh.key'),
  cert: fs.readFileSync('./lh.crt'),
};

https.createServer(sslOption, app).listen(port);
// app.listen(port);
