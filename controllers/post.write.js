const conn = require('../config/db.mysql').init();
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
      res.render('list.ejs', { list: rows });
    }
  });
};

/* 작성된 글 보기 */
let post_write = (req, res) => {
  let { body } = req;

  const sql = 'INSERT INTO Test VALUES(?, ?, ?, NOW())';
  let params = [body.username, body.title, body.content];

  conn.query(sql, params, (err) => {
    if (err) {
      console.log('query가 멍청하게 작성됨' + err);
    } else {
      res.redirect('/list');
    }
  });
};

module.exports = {
  get_posts,
  get_list,
  post_write,
};
