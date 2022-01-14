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

let corsOption = {
  Credential: true,
};
//
app.use(cors(corsOption));
app.get('/', (req, res) => {
  // res.send("Root")
  res.render('index.ejs');
});

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
  }
  let testKkoTk = token.data.access_token;
  console.log(token.data.access_token);
  store.set('testKkoTk', testKkoTk);

  console.log(testKkoTk);

  let user;
  try {
    user = await axios({
      method: 'GET',
      url: 'https://kapi.kakao.com/v2/user/me',
      headers: {
        Authorization: `Bearer ${token.data.access_token}`,
      },
    });
    console.log(user.data);
  } catch (error) {
    console.log(error.message);
  }
});
/* 카카오 프로필 */
app.get();

/* 카카오 로그아웃 */
app.get();

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

  res.status(302).redirect('/');
});

//Openssl을 이용한 인증서
const sslOption = {
  key: fs.readFileSync('./lh.key'),
  cert: fs.readFileSync('./lh.crt'),
};

https.createServer(sslOption, app).listen(port);
// app.listen(port);
