const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');

const app = express();

// Map global promise -- get rid of warning
mongoose.Promise = global.Promise;

// Connect to mongoose
mongoose.connect('mongodb://localhost/vidjot-dev', {
    useMongoClient: true
})
.then(() => { console.log('MongoDB connected') })
.catch((err) => { console.log(err) });

// Load Idea model
require('./models/Idea');
const Idea = mongoose.model('ideas');

// Handlebars middleware
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// method-override middleware
app.use(methodOverride('_method'));

// Express session middleware
app.use(session({
    secret: 'supersecret',
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

//Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Home page
app.get('/', (req, res) => {
    const title = 'David';
    res.render('index', {
        title
    });
    console.log('At home route');
});

// About page
app.get('/about', (req, res) => {
    res.render('about');
});

// Add idea form
app.get('/ideas/add', (req, res) => {
    res.render('ideas/add');
});

app.post('/ideas', (req, res) => {
    let errors = [];
    
    if(!req.body.title) {
        errors.push({ text: 'Please add a title' });
    }
    if(!req.body.details) {
        errors.push({ text: 'Please add in the details' });
    }
    if(errors.length > 0) {
        res.render('ideas/add', {
            errors,
            title: req.body.title,
            details: req.body.details
        })
    } else {
        const newUser= {
            title: req.body.title,
            details: req.body.details
        };

       new Idea(newUser).save().then((idea) => {
            req.flash('success_msg', 'Video idea added!');
            res.redirect('/ideas');
       });
    }
});

// Edit idea form
app.get('/ideas/edit/:id', (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
    .then((idea) => {
        console.log(idea)
        res.render('ideas/edit', {
            idea
        });
    });
});

// Edit form process
app.put('/ideas/:id', (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
    .then((idea) => {
        idea.title = req.body.title;
        idea.details = req.body.details;

        idea.save().then((idea) => {
            req.flash('success_msg', 'Video idea updated!');
            res.redirect('/ideas');
        })
    });
});

// Idea delete
app.delete('/ideas/:id', (req, res) => {
    Idea.remove({ _id: req.params.id })
    .then(() => {
        req.flash('success_msg', 'Video idea removed!');
        res.redirect('/ideas');
    });
});

// Idea index page
app.get('/ideas', (req, res)=> {
    Idea.find({})
        .sort({date: 'desc'})
        .then((ideas) => {
            res.render('ideas/index', {
                ideas
        });
    });
});

// Set port to env variable if set or use 5000 locally
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`App is running on ${PORT}`);
});