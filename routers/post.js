const express = require('express');
const { get_list, get_posts, post_write } = require('./controllers/post.write');
const router = express.Router();

/* 글 쓰기 */
router.get('/list', get_list);
router.get('/write', get_posts);
router.post('/write_post', post_write);

module.exports = router;
