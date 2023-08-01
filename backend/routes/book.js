const express = require('express');

const router = express.Router();

const bookCtrl = require('../controllers/book')

router.post('/', bookCtrl.createBook);

router.get('/', bookCtrl.getAllBooks);

router.get('/:id', bookCtrl.getOneBook);

router.get('/bestrating', bookCtrl.getBestRating)

module.exports = router;