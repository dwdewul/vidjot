const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
// Load requireLogin middleware
const { requireLogin } = require('../helpers/auth');

require('../models/Idea');
const Idea = mongoose.model('ideas');

// Add idea form
router.get('/add', requireLogin, (req, res) => {
    res.render('ideas/add');
});

router.post('/', requireLogin, (req, res) => {
    let errors = [];

    if (!req.body.title) {
        errors.push({ text: 'Please add a title' });
    }
    if (!req.body.details) {
        errors.push({ text: 'Please add in the details' });
    }
    if (errors.length > 0) {
        res.render('/add', {
            errors,
            title: req.body.title,
            details: req.body.details,
        })
    } else {
        const newUser = {
            title: req.body.title,
            details: req.body.details,
            user: req.user.id
        };

        new Idea(newUser).save().then((idea) => {
            req.flash('success_msg', 'Video idea added!');
            res.redirect('/');
        });
    }
});

// Edit idea form
router.get('/edit/:id', requireLogin, (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
        .then((idea) => {
            if(idea.user != req.user.id) {
                req.flash('error_msg', 'Not authorized to edit this item')
                res.redirect('/ideas');
            } else {
                res.render('ideas/edit', {
                    idea
                });
            }
        });
});

// Edit form process
router.put('/:id', requireLogin, (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
        .then((idea) => {
            idea.title = req.body.title;
            idea.details = req.body.details;

            idea.save().then((idea) => {
                req.flash('success_msg', 'Video idea updated!');
                res.redirect('/');
            })
        });
});

// Idea delete
router.delete('/:id', requireLogin, (req, res) => {
    Idea.remove({ _id: req.params.id })
        .then(() => {
            req.flash('success_msg', 'Video idea removed!');
            res.redirect('/');
        });
});

// Idea index page
router.get('/', requireLogin, (req, res) => {
    Idea.find({ user: req.user.id })
        .sort({ date: 'desc' })
        .then((ideas) => {
            res.render('ideas/index', {
                ideas
            });
        });
});

module.exports = router;