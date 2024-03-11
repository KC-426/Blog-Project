const express = require('express')
const blogController = require('../controllers/blog')
const multer = require("multer");
const userAuth = require("../middleware/auth")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const router = express.Router()

router.post('/create_blog', upload.single('file'), userAuth, blogController.createBlog)
router.post("/like_blog/:id", blogController.likeBlog)
router.post("/share_blog/:id", blogController.shareBlog)
router.post("/comment_on_blog/:id", blogController.commentOnBlog)
router.post("/reply_on_comment/:id/:commentId", blogController.addReplyOnComment)
router.get('/retrieve_blog',userAuth, blogController.retrieveBlog)
router.get("/get_blog/:id",userAuth, blogController.getBlogById)
router.delete('/delete_blog/:id',userAuth, blogController.deleteBlog)

module.exports = router