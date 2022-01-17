/* 소셜 로그인 체크하는 미들웨어 */

const authMiddleware = (req, res, next) => {
  const { session } = req;
  if (session.auth_data === undefined) {
    res.redirect('/');
  } else {
    next();
  }
};

module.exports = { authMiddleware };
