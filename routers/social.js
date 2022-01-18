const express = require('express');
const router = express.Router();
const { authentication } = require('../middleware/authenfication');
const {
  kakao_check,
  kakao_login,
  kakao_logout,
  kakao_profile,
  kakao_unlink,
} = require('./controllers/Oauth.social.login');

/* 카카오 라우터 */
router.get('/kakao', kakao_check);
router.get('/kakao/login', kakao_login);
router.get('/kakao/account_info', authentication, kakao_profile);
router.get('/kakao/logout', authentication, kakao_logout);
router.get('/kakao/unlink', authentication, kakao_unlink);

module.exports = router;
