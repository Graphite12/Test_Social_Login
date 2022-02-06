const db_config = require('../../config/db.mysql');
const conn = db_config.init();

db_config.connect(conn);
/* 작성된 글 화면 페이지 보여주기 */
let get_posts = (req, res) => {
  res.render('post_write.ejs');
};

/* 게시글 리스트 조회하기  */
let get_list = (req, res) => {
  const sql = 'SELECT * FROM Test';

  conn.query(sql, (err, rows, fields) => {
    if (err) {
      console.log('query가 멍청하게 작성됨' + err);
    } else {
      res.render('post_list.ejs', { lists: rows });
    }
  });
};

/* 글 입력 */
let post_write = (req, res) => {
  let { body } = req;

  const sql =
    'INSERT INTO Test (title, content, created_at, username) VALUES(?, ?, NOW(), ?)';
  let params = [body.title, body.content, body.username];

  console.log('타이틀:' + body.title);
  console.log('콘텐트:' + body.content);
  conn.query(sql, params, (err) => {
    if (err) {
      console.log('query가 멍청하게 작성됨' + err);
    } else {
      res.redirect('/post/list');
    }
  });
};

module.exports = {
  get_posts,
  get_list,
  post_write,
};
