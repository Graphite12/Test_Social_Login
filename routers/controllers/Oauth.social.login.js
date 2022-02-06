const { default: axios } = require('axios');
const qs = require('qs');
const { OAuth2Client } = require('google-auth-library');
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

/* 구글 기본 정보 */
const google_info = {
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLEINT_SECRET,
  redirect_url: `https://localhost:3333/oauth/google/login`,
};

/* 카카오 인증토큰  발급 */

/* 카카오 인증 확인 */
let kakao_check = (req, res) => {
  const kakao_url = `https://kauth.kakao.com/oauth/authorize?client_id=${kakao_info.clientID}&redirect_uri=${kakao_info.redirect_url}&response_type=code&scope=profile_nickname,profile_image,account_email&state=textalive`;
  res.status(302).redirect(kakao_url);
};

//카카오 리디렉트 주소를 설정 후, get으로 인증 주소를 가져온다.
let kakao_login = async (req, res) => {
  let token;
  const { code } = req.query;
  console.log(code);
  try {
    //axios를 쓰면 Promise보다 편리해짐.
    token = await axios({
      method: 'POST', //메소드
      url: 'https://kauth.kakao.com/oauth/token', //url
      headers: {
        //요청헤더
        'content-type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-store',
        Pragma: 'no-cache',
      },
      data: qs.stringify({
        //req.data에 queryString으로 데이터를 보냄
        grant_type: 'authorization_code',
        client_id: kakao_info.clientID,
        client_secret: kakao_info.client_secret,
        redirect_uri: kakao_info.redirect_url,
        code: code,
      }),
    });
  } catch (error) {
    console.log(error.message);
    res.json(error);
  }
  console.log(token.data);

  req.session.auth_token = { ['kakao_acc_tkn']: token.data.access_token };
  // console.log(req.session.auth_token.kakao_acc_tkn);
  //로컬 스토리지 비슷한 기능을 store라이브러리를 통해 사용가능
  // store.set('testKkoTk', testKkoTk);

  //토큰을 발급 받고 바로 사용자 정보 가져오기
  let user;
  // let usertkn = store.get('testKkoTk');
  try {
    const acctkn = req.session.auth_token.kakao_acc_tkn;
    user = await axios({
      method: 'GET',
      url: 'https://kapi.kakao.com/v2/user/me',
      headers: {
        Authorization: `Bearer ${acctkn}`,
      },
    });

    console.log(user.data);

    //유저 데이터를 임시로 저장(세션으로저장)
    req.session.auth_data = { ['kakaos']: user.data };
  } catch (error) {
    console.log(error.message);
    res.json(error);
  }

  res.status(302).redirect('/');
};

/* 카카오 프로필 */
let kakao_profile = (req, res) => {
  let { nickname, profile_image } = req.session.auth_data.kakaos.properties;

  console.log(nickname, profile_image);
  res.render('account_profile', {
    nickname,
    profile_image,
  });
};

/* 카카오 로그아웃 */
let kakao_logout = async (req, res) => {
  const { kakao_acc_tkn } = req.session.auth_token;
  console.log(kakao_acc_tkn);
  try {
    await axios({
      method: 'POST',
      url: `https://kapi.kakao.com/v1/user/logout`,
      headers: {
        Authorization: `Bearer ${kakao_acc_tkn}`,
      },
    });
  } catch (error) {
    res.json(error);
  }

  if (kakao_acc_tkn) {
    //delete req.session.acc_tkn;
    req.session.destroy(() => {
      res.redirect('/');
    });
  } else {
    res.json('로그아웃');
  }
};

/* 카카오 인증 연결 끊기 */
let kakao_unlink = async (req, res) => {
  const { kakao_acc_tkn } = req.session.auth_token;
  const { kakaos } = req.session.auth_data;
  //카카오 API에게 삭제 요청 결과를 담아준다.
  console.log(kakaos);
  let del_id;

  try {
    del_id = await axios({
      method: 'POST',
      url: `https://kapi.kakao.com/v1/user/unlink`,
      headers: {
        Authorization: `Bearer ${kakao_acc_tkn}`,
      },
    });
  } catch (error) {
    res.json(error);
  }

  const { id } = del_id.data;
  console.log(id);

  //현재 페이지와 응답받은 사용자의 id가 일치한다면..
  if (kakaos.id === id) {
    //해당 세션을 지워버림
    // delete req.session.auth_data;
    // delete req.session.auth_token;
    req.session.destroy(() => {
      res.redirect('/');
    });
  }
};

/**
 *
 *                 구글 로그인
 *
 */

// /* 구글 로그인 */
const oAuthClient = new OAuth2Client(
  google_info.client_id,
  google_info.client_secret,
  google_info.redirect_url,
);

const option = {
  access_type: 'offline',
  response_type: 'code',
  prompt: 'consent',
  include_granted_scopes: true,
  state: 'google-Oauth value',
  scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ],
};

// /* 구글 인증 */
let google_check = (req, res) => {
  const authorizeUrl = oAuthClient.generateAuthUrl(option);
  console.log(authorizeUrl);
  res.status(302).redirect(authorizeUrl);
};

/* 로그인 화면 불러오기 */
let google_login = async (req, res) => {
  const { code } = req.query;
  console.log('코드:' + code);
  let token;
  try {
    token = await axios({
      method: 'POST',
      url: `https://oauth2.googleapis.com/token`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      data: qs.stringify({
        grant_type: 'authorization_code',
        client_id: google_info.client_id,
        client_secret: google_info.client_secret,
        redirectUri: google_info.redirect_url,
        code: code,
      }),
    });
    console.log(`토큰:` + token);
    // console.log('구글토큰:' + token.data.access_token);

    req.session.auth_token = { ['google_acc_tkn']: token.data.access_token };
    console.log('세션:' + req.session.auth_token.google_acc_tkn);
  } catch (error) {
    res.json(error);
  }

  try {
    let user;
    const acctkn = req.session.auth_token.google_acc_tkn;
    user = await axios({
      method: 'GET',
      url: `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${acctkn}`,
    });

    //const { name, picture, email } = user.data;

    console.log(user.data);
    console.log(req.session);

    req.session.auth_data = { ['google']: user.data };
    console.log(req.session.auth_data);
    res.redirect('/');
  } catch (error) {
    res.json(error);
  }
};

/* 구글 프로필 */
let google_profile = (req, res) => {
  let { name, picture, email } = req.session.auth_data.google;
  //store.get('kakao_data').properties;
  console.log(nickname, profile_image);
  res.render('account_profile', {
    name,
    picture,
    email,
  });
};

//구글 로그아웃
let google_logout = async (req, res) => {
  const token = req.session.auth_token.google_acc_tkn;
  console.log('로그아웃 토큰' + token);
  const revoke = await axios({
    method: 'POST',
    url: `https://oauth2.googleapis.com/revoke?token=${token}`,
    headers: {
      'Content-type': 'application/x-www-form-urlencoded',
    },
  });
  console.log(revoke);
  req.session.destroy(() => {
    res.redirect('/');
  });
  console.log('내가누구' + req.session);
};

/**
 * 프로필 공통
 */

let accounts_info = (req, res) => {
  const { auth_data } = req.session;
  const userinfo = Object.keys(auth_data)[0];
  console.log(userinfo);
  console.log(auth_data[userinfo]);

  switch (userinfo) {
    case 'google':
      account_info = {
        picture: auth_data[userinfo].picture,
        name: auth_data[userinfo].name,
      };
      break;

    case 'kakaos':
      account_info = {
        picture: auth_data[userinfo].properties.profile_image,
        name: auth_data[userinfo].properties.nickname,
      };
      break;

    default:
      break;
  }

  res.render('account_profile', {
    sucess: account_info,
  });
};

/**
 * 로그아웃 공통
 */
let social_logout = (req, res) => {
  const { auth_data } = req.session;
  const userinfo = Object.keys(auth_data)[0];
  console.log(userinfo);
  console.log(auth_data[userinfo]);

  switch (userinfo) {
    case 'google':
      res.redirect('/oauth/google/logout');
      break;

    case 'kakaos':
      res.redirect('/oauth/kakao/unlink');
      break;

    default:
      break;
  }
};

module.exports = {
  kakao_login,
  kakao_logout,
  kakao_profile,
  kakao_unlink,
  kakao_check,
  google_login,
  google_check,
  google_profile,
  google_logout,
  accounts_info,
  social_logout,
};
