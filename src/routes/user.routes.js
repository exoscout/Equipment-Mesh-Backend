const { authenticate } = require('../middlewares/authenticator.js');
const {registerUser, loginUser} = require('../controllers/authController');
const { listUserItems, getItemPage } = require('../controllers/itemController.js');

const express = require('express');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/myListings', authenticate, listUserItems);
router.get('/itemPage', getItemPage);

router.get('/me', authenticate, (req, res) => {
    res.status(200).json({ user: req.user });
});

module.exports = router;
