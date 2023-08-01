const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    title: {type: String, required: true},
    author: {type: String, required: true},
    imageUrl: {type: String, required: true},
    date: {type: Number, required: true},
    type: {type: Number, required: true}
});

module.exports = mongoose.model('Book', bookSchema);