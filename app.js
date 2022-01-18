const epxress = require('express');
const app = epxress();
const https = require('https');
const http = require('http');
const port = 3333 ?? 443;
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const session = require('express-session');
const express = require('express');
const social = require('./routers/social');
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
    httpOnly: true,
    //필수 옵션이며 String, Array형태로 사용. Array는 첫번째 인자만 비밀키로 사용
    secret: 'ananymous',
    //resave는 세션이 변경이 있을 때만 세션을 저장한다. 보통은 불필요한 저장을 막기 위해 false로 한다.
    resave: false,
    //세션이 생성되어도 데이터가 추가되거나 변경되지않은 상태를 Uninitialized라고 한다. true는 이 상태의 세션도 저장한다.
    saveUninitialized: true,
    //세션을 어디에 저장할지 결정하는 옵션이다, default는 MemoryStore
  }),
);

/* Router */
//app.get('/oauth/kakao/unlink')
app.get('/', (req, res) => {
  // res.send("Root")
  console.log(req.session);
  res.render('index');
});

app.use('/oauth/', social);

/* 소셜로그인 구현 */
// switch (key) {
//   case value:

//     break;

//   default:
//     break;
// }

//Openssl을 이용한 인증서
const sslOption = {
  key: fs.readFileSync('./lh.key'),
  cert: fs.readFileSync('./lh.crt'),
};

https.createServer(sslOption, app).listen(port);
// app.listen(port);
