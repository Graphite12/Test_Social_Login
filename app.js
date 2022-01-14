const epxress = require('express');
const app = epxress();
const https = require('https');
const http = require('http');
const port = 3333 || 443;
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const qs = require('qs');
require('dotenv').config();

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//html을 렌더링하기 위한 부품, pug, ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// app.set('views', './views');

app.get('/', (req, res) => {
  // res.send("Root")
  res.render('index.ejs');
});

const kakao_info = {
  clientID: process.env.KAKAO_CLIENT_ID,
  client_secret: process.env.KAKAO_CLIENT_SECRET,
  redirect_url: 'https://localhost:3333/oauth/kakao/login',
};

/* 카카오 인증 확인 */
app.get('/oauth/kakao', (req, res) => {
  const kakao_url = `https://kauth.kakao.com/oauth/authorize?client_id=${kakao_info.clientID}&redirect_uri=${kakao_info.redirect_url}&response_type=code`;
  res.redirect(kakao_url);
});

/* 카카오 발급 */
//카카오 리디렉트 주소를 설정 후
// app.get('/oauth/kakao/login', async (req, res) => {
//   let token;
//   try {
//     token = await axios({
//       method: 'POST',
//       url: 'https://kauth.kakao.com/oauth/token',
//       headers: {
//         'content-type': 'application/x-www-form-urlencoded',
//       },
//       data: qs.stringify({
//         grant_type: 'authorization_code',
//         client_id: kakao_info.clientID,
//         client_secret: kakao_info.client_secret,
//         redirect_uri: kakao_info.redirect_url,
//         code: req.query.code,
//       }),
//     });
//   } catch (error) {
//     console.log(error.message);
//   }

//   console.log(token);
//   let user;
//   try {
//     user = await axios({
//       method: 'GET',
//       url: 'https://kapi.kakao.com/v2/user/me',
//       headers: {
//         Authorization: `Bearer ${token.data.access_token}`,
//       },
//     });
//     console.log(user);
//   } catch (error) {
//     console.log(error.message);
//   }
//   // res.status(200).send('Success');
// });

//Openssl을 이용한 인증서
const sslOption = {
  key: fs.readFileSync('./lh.key'),
  cert: fs.readFileSync('./lh.crt'),
};

https.createServer(sslOption, app).listen(port);
