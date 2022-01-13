const epxress = require("express");
const app = epxress();
const http = require('http');
const port = 3333;
const path = require('path')
require('dotenv').config()


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

app.get("/auth/kakao", (req, res) => {
    const kakao_url = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${kakao_info.clientID}&redirect_uri=${kakao_info.redirect_url}`;
    res.redirect(kakao_url)
})

app.listen(port, function() {
    console.log(`서버 시작 Port:${port}`)
})
