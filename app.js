const epxress = require("express");
const app = epxress();
const port = 3000;

app.get("/", (req, res) => {
    res.send("Root")
})

app.get("/login", (req, res) => {
    res.send("로그인 페이지")
})

app.listen(port, function() {
    console.log(`서버 시작 Port:${port}`)
})
