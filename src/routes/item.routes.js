const { Router } = require('express');
const { authenticate } = require('../middlewares/authenticator.js');
const { createItem, listUserItems, getItemPage, updateItem, unlistItem, relistItem } = require('../controllers/itemController.js');
const router = Router();

router.post('/', authenticate, createItem);
router.post('/createItem', authenticate, createItem);
router.get('/my-listings', authenticate, listUserItems);
router.get('/myListings', authenticate, listUserItems);
router.get('/:itemId', getItemPage);
router.get('/:itemId/details', getItemPage);
router.patch('/:itemId', authenticate, updateItem);
router.patch('/:itemId/unlist', authenticate, unlistItem);
router.patch('/:itemId/relist', authenticate, relistItem);

module.exports = router;
