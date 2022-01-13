const epxress = require("express");
const app = epxress();
const https = require('https');
const http = require('http')
const port = 3333 || 443;
const path = require('path')
const axios = require('axios');
const fs = require('fs')
require('dotenv').config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//html을 렌더링하기 위한 부품, pug, ejs
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));
// app.set('views', './views');


app.get("/", (req, res) => {
   // res.send("Root")
   res.render('index.ejs')
})

app.get("/login", (req, res) => {
    res.send("로그인 페이지")
})

/* 카카오 정보 */
const kakao_info = {
    clientID: process.env.KAKAO_CLIENT_ID,
    client_secret: process.env.KAKAO_CLIENT_SECRET,
    redirect_url: "http://localhost:3333/auth/kakao/login"
}

/* 카카오 인증 확인 */
app.get("/auth/kakao", (req, res) => {
    const kakao_url = `http://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${kakao_info.clientID}&redirect_uri=${kakao_info.redirect_url}&response_type=code&state=AlphaBrovo`;
    res.redirect(kakao_url)
})

/* 카카오 발급 */
//카카오 리디렉트 주소를 설정 후 
app.get("/auth/kakao/login", async (req,res)=> {
    try {
    //요청과 함께 전송되는 URL파라미터인 Params
    let token = await axios.post(kakao_info.redirect_url, {
        params: {
            grant_type: 'authorization_code',
            client_id: kakao_info.clientID,
            client_secret: kakao_info.client_secret,
           redirect_url: kakao_info.redirect_url,
           code:req.query.code
        }
    })
    console.log("나는토큰 그자체:",token)
} catch (error) {
    console.log(error.message)
}
    // let user = await axios.get("https://kapi.kakao.com/v2/user/me",{
    //     Headers: {
    //         Authorization: `Bearer ${token}`
    //     }
    // })
    // console.log(user)
})

//Openssl을 이용한 인증서
const sslOption = {
    key: fs.readFileSync('./lh.key'),
    cert: fs.readFileSync('./lh.crt'),
}

http.createServer(app).listen(port)
