/* 소셜 로그인 체크하는 미들웨어 */
const authentication = (req, res, next) => {
  const { session } = req;
  if (session.auth_data === undefined) {
    res.status(302).redirect('/?msg=유효하지 않은 사용자');
  } else {
    console.log('로그인 성공');
    next();
  }
};

module.exports = { authentication };
