const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

const app = express();

// Load routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');

// Passport config
require('./config/passport')(passport);

// Map global promise -- get rid of warning
mongoose.Promise = global.Promise;

// Connect to mongoose
const keys = require('./config/keys');
mongoose.connect(keys.mongoURI, {
    useMongoClient: true
})
.then(() => { console.log('MongoDB connected') })
.catch((err) => { console.log(err) });

// Load Idea model
require('./models/Idea');


// Handlebars middleware
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// method-override middleware
app.use(methodOverride('_method'));

// Express session middleware
app.use(session({
    secret: 'supersecret',
    resave: false,
    saveUninitialized: true
}));

// Passport sessions MUST BE AFTER EXPRESS SESSION MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Home page
app.get('/', (req, res) => {
    const title = 'Welcome';
    res.render('index', {
        title
    });
    console.log('At home route');
})
// About page
app.get('/about', (req, res) => {
    res.render('about');
});

app.use('/ideas', ideas);
app.use('/users', users);

// Set port to env variable if set or use 5000 locally
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`App is running on ${PORT}`);
});