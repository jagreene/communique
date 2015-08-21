var express = require("express");
var path = require("path");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
var exphbs  = require("express-handlebars");
var passport = require("passport");
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var ContextIO = require('contextio');
var ctxioClient = new ContextIO.Client({
    key: process.env.CONTEXT_KEY,
    secret: process.env.CONTEXT_SECRET
});

var mongoose = require('mongoose');

var mongoURI = process.env.MONGOURI || "mongodb://127.0.0.1:27017/test";
mongoose.connect(mongoURI);

var users = require('./models/users');
var Users = mongoose.model('Users', users.usersSchema);

var communique  = require("./routes/communique")(mongoose, ctxioClient);
var strategy = require("./auth", passport)(mongoose, ctxioClient);

var app = express();

var PORT = process.env.PORT || 3001

app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({ secret: 'my_precious',
                  resave: true,
                  saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

passport.use( new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'},
    strategy)
)

app.get("/", ensureAuthenticated, communique.getHome);
app.get("/login", communique.getLogin);
app.get("/people", communique.getPeople);
app.get("/messages", communique.getMessages);
app.get("/sentimentTime", communique.getSentimentTime);
app.get("/texttagsSentiment", communique.getTextTagsSentiment);

app.get('/auth/google',
    passport.authenticate('google',
                        {scope: ['email', 'https://mail.google.com'],
                        approvalPrompt: 'force', accessType: 'offline'})
);

app.get('/auth/google/callback',
passport.authenticate('google', { failureRedirect: '/login', successRedirect: '/'  }));

passport.serializeUser(function(user, done) {
        done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    Users.findById(id, function(err, user){
        if(!err) done(null, user);
            else done(err, null)
    })
});

app.listen(PORT, function() {
  console.log("App running on port:", PORT);
});

function ensureAuthenticated(req, res, next) {
if (req.isAuthenticated()) { return next();  }
    res.redirect('/login')
}
