const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();

router.post('/user_signup',authController.userSignup);
router.get('/user_login', authController.userLogin);
router.post('/user_logout/:userId', authController.logoutUser)
router.get("/get_all_users", authController.getAllUsers)
router.get("/get_user/:id", authController.getUserById)
router.delete("/delete_user/:id", authController.deleteUserById)

module.exports = router;


