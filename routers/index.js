const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  // res.send("Root")
  const { msg } = req.query;
  res.render('index', {
    msg,
    userinfo: req.session.auth_data,
  });
});

module.exports = router;
