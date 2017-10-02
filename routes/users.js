const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcryptjs');

// Load user model

require('../models/Users');
const User = mongoose.model('users');

// User login route
router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/ideas',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// User register route
router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', (req, res) => {
    let errors = [];
    if (req.body.password !== req.body.confirmPassword) {
        errors.push({ text: 'Passwords do not match' });
    }

    if (req.body.password.length < 8) {
        errors.push({ text: 'Password is not long enough' });
    }

    if (errors.length > 0) {
        res.render('users/register', {
            errors,
            name: req.body.name,
            email: req.body.email
        });

    } else {
        User.findOne({ email: req.body.email })
        .then((user) => {
            if (user) {
                req.flash('error_msg', 'User with that email already exists');
                res.redirect('/users/register');
            } else {
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then((user) => {
                                req.flash('success_msg', 'You are now registered!');
                                res.redirect('/users/login');
                            })
                            .catch((err) => {
                                console.log(err);
                                return;
                            });
                    });
                });
                console.log(newUser);
            }
        });
    }
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'Successfully logged out');
    res.redirect('/users/login');
});

module.exports = router;