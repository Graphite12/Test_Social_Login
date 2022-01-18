const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  // res.send("Root")
  console.log(req.session);
  res.render('index');
});

module.exports = router;
