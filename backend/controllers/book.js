const Book = require('../models/Book');
const fs = require('fs');

// get all books

exports.getAllBooks = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json( books ))
    .catch(error => res.status(400).json({ error }))
};

// get one book

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(400).json({ error }))
};

// post one book

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book)
    delete bookObject._id
    delete bookObject._userId

    const book = new Book({
        ...bookObject, 
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    book.save()
    .then(book => res.status(201).json({ book }))
    .catch(error => res.status(400).json({ error }))
};

// modify book

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.thing),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Objet modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
}

// delete book

exports.deleteBook = (req, res, next) => {

    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized' })
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        })
}

// post rating 

exports.postRate = async (req, res) => {
    const { userId, rating } = req.body;

    try {
        const book = await Book.findOne({ _id: req.params.id });

        if (!book) {
            return res.status(404).json({ message: "Livre non trouvé" });
        }

        const isRegisteredUser = book.ratings.find(rate => rate.userId === userId);
        if (isRegisteredUser) {
            return res.status(401).json({ message: "Vous avez déjà noté ce livre" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "La note doit être entre 1 et 5 étoiles" });
        }

        book.ratings.push({ userId, grade: rating });

        const averageRating = book.ratings.reduce((sum, rating) => sum + rating.grade, 0) / book.ratings.length;
        book.averageRating = Math.round(averageRating * 100) / 100;

        await book.save();

        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de la notation du livre" });
    }
};

// get bestRating

exports.getBestRatings = async (req, res) => {
    try {
        const books = await Book.find().sort({ averageRating: -1 }).limit(3);
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ error: "Une erreur est survenue lors de la récupération des livres" });
    }
};