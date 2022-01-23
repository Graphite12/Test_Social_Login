const express = require('express');
const router = express.Router();
const { authentication } = require('../middleware/authenfication');
const {
  kakao_check,
  kakao_login,
  kakao_logout,
  kakao_profile,
  kakao_unlink,
  google_login,
  google_check,
  google_profile,
  google_logout,
  accounts_info,
} = require('../controllers/Oauth.social.login');

/* 카카오 라우터 */
router.get('/kakao', kakao_check);
router.get('/kakao/login', kakao_login);
router.get('/kakao/account_info', authentication, kakao_profile);
router.get('/kakao/logout', authentication, kakao_logout);
router.get('/kakao/unlink', authentication, kakao_unlink);

/* 구글 라우터 */
router.get('/google', google_check);
router.get('/google/login', google_login);
router.get('/google/account_info', authentication, google_profile);
router.get('/google/logout', authentication, google_logout);

/* 공통, 소셜 로그인 유저 정보 불러오기 */
router.get('/login/user_info', authentication, accounts_info);
module.exports = router;
