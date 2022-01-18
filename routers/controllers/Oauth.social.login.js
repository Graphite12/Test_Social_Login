const { default: axios } = require('axios');
const qs = require('qs');
require('dotenv').config();

/**
 *
 *                      카카오톡 소셜 로그인
 *
 */

/* 카카오 기본 정보 */
const kakao_info = {
  clientID: process.env.KAKAO_CLIENT_ID,
  client_secret: process.env.KAKAO_CLIENT_SECRET,
  client_admin: process.env.KAKAO_ADMIN_KEY,
  redirect_url: `https://localhost:3333/oauth/kakao/login`,
};
/* 카카오 인증토큰  발급 */
//카카오 리디렉트 주소를 설정 후, get으로 인증 주소를 가져온다.
let kakao_login = async (req, res) => {
  let token;

  try {
    //axios를 쓰면 Promise보다 편리해짐.
    token = await axios({
      method: 'POST', //메소드
      url: 'https://kauth.kakao.com/oauth/token', //url
      headers: {
        //요청헤더
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: qs.stringify({
        //req.data에 queryString으로 데이터를 보냄
        grant_type: 'authorization_code',
        client_id: kakao_info.clientID,
        client_secret: kakao_info.client_secret,
        redirect_uri: kakao_info.redirect_url,
        code: req.query.code,
      }),
    });
  } catch (error) {
    console.log(error.message);
    res.json(error);
  }

  req.session.auth_token = { ['acc_tkn']: token.data.access_token };
  console.log(req.session.auth_data);
  //로컬 스토리지 비슷한 기능을 store라이브러리를 통해 사용가능
  // store.set('testKkoTk', testKkoTk);

  //토큰을 발급 받고 바로 사용자 정보 가져오기
  let user;
  // let usertkn = store.get('testKkoTk');
  try {
    user = await axios({
      method: 'GET',
      url: 'https://kapi.kakao.com/v2/user/me',
      headers: {
        Authorization: `Bearer ${token.data.access_token}`,
      },
    });

    console.log(user.data);

    //유저 데이터를 임시로 저장(세션으로저장)
    req.session.auth_data = { ['kakaos']: user.data };
    // req.session.auth_login = user.data;
    // store.set('kakao_data', user.data);

    // res.status(200).json(user.data);
  } catch (error) {
    console.log(error.message);
    res.json(error);
  }

  res.status(302).redirect('/');
};

/* 카카오 프로필 */
let kakao_profile = (req, res) => {
  let { nickname, profile_image } = req.session.auth_data.kakaos.properties;
  //store.get('kakao_data').properties;
  console.log(nickname, profile_image);
  res.render('account_profile', {
    nickname,
    profile_image,
  });
};

/* 카카오 로그아웃 */
let kakao_logout = async (req, res) => {
  const { acc_tkn } = req.session.auth_token;
  console.log(req.session.auth_data);
  try {
    await axios({
      method: 'POST',
      url: `https://kapi.kakao.com/v1/user/logout`,
      headers: {
        Authorization: `Bearer ${acc_tkn}`,
      },
    });
  } catch (error) {
    res.json(error);
  }
};

/* 카카오 인증 연결 끊기 */
let kakao_unlink = async (req, res) => {
  const { acc_tkn } = req.session.auth_token;
  const { kakaos } = req.session.auth_data;
  //카카오 API에게 삭제 요청 결과를 담아준다.
  let del_id;

  try {
    del_id = await axios({
      method: 'POST',
      url: `https://kapi.kakao.com/v1/user/unlink`,
      headers: {
        Authorization: `Bearer ${acc_tkn}`,
      },
    });

    console.log(del_id);
  } catch (error) {
    res.json(error);
  }

  const { id } = del_id.data;
  console.log(id);

  //현재 페이지와 응답받은 사용자의 id가 일치한다면..
  if (kakaos.id === id) {
    //해당 세션을 지워버림
    delete req.session.auth_data;
    delete req.session.auth_token;
  }

  console.log('삭제', req.session);
  res.status(302).redirect('/');
};

/* 카카오 인증 확인 */
let kakao_check = (req, res) => {
  const kakao_url = `https://kauth.kakao.com/oauth/authorize?client_id=${kakao_info.clientID}&redirect_uri=${kakao_info.redirect_url}&response_type=code&scope=profile_nickname,profile_image,account_email`;
  res.status(302).redirect(kakao_url);
};

module.exports = {
  kakao_login,
  kakao_logout,
  kakao_profile,
  kakao_unlink,
  kakao_check,
};
