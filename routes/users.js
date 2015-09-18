var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
//Including our model for mongoose - models are usually uppercase and singular
var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET REGISTER */
//Since we are in the users.js route we do not need to put /users/register in the route
router.get('/register', function(req, res, next) {
  res.render('register', {
  	'title': 'Register'
  });
});

/* GET LOGIN */
//Since we are in the users.js route we do not need to put /users/register in the route
router.get('/login', function(req, res, next) {
  res.render('login', {
  	'title': 'Login'
  });
});

router.post('/register', function(req, res, next){
	//Get Form Values or Request Parameters
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	//We will use multer for the file upload

	//Check for image field
	//This is being done using Multer which we is one of the node modules we have required
	if(req.files){
		console.log('Uploading file...');

	//File information
		var profileImageOriginalName 		= req.files.profileimage.originalname;
		var profileImageName 				= req.files.profileimage.name;
		var profileImageMime 				= req.files.profileimage.mimetype;
		var profileImagePath 				= req.files.profileimage.path;
		var profileImageExt 				= req.files.profileimage.extension;
		var profileImageSize 				= req.files.profileimage.size;
		} else {
			//Set default Image
			var profileImageName = 'noimage.png';
		}

		//Form Validation -- We use the express validator
		req.checkBody('name', 'Name is required').notEmpty();
		req.checkBody('email', 'Email is required').notEmpty();
		req.checkBody('email', 'Please enter a valid email address').isEmail();
		req.checkBody('username', 'Username is required').notEmpty();
		req.checkBody('password', 'Password is required').notEmpty();
		req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

		//Check for errors
		var errors = req.validationErrors();

		if(errors){
			res.render('register', {
				errors: errors,
				//We are passing the following parameters to make sure that the fields do not clear after the user has entered the information and if there is a mismatch
				name: name,
				email: email,
				username: username,
				password: password,
				password2: password2
			});
		}else{
			var newUser = new User({
				name: name,
				email: email,
				username: username,
				password: password,
				profileimage: profileImageName
			});

			//We will send this to the model for the create user function

			//Create User
			User.createUser(newUser, function(err, user){
				if(err) throw err;
				console.log(user);
			});

			//Creating a flash message
			req.flash('success', 'You are now registered and may log in!');

			res.location('/');
			res.redirect('/');
		}
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});

//Using passport and localstrategy to interact with the user model that we set up above
//Each of these functions inside have a model that we have called.
passport.use(new LocalStrategy(
	function(username, password, done){
		User.getUserByUsername(username, function(err, user){
			if(err) throw err;
			if(!user){
				console.log('Unknown User');
				return done(null, false,{message: 'Unknown User'});
			}

			User.comparePassword(password, user.password, function(err, isMatch){
				if(err) throw err;
				if(isMatch){
					return done(null, user);
				} else {
					console.log('Invalid password');
					return done(null, false, {message: 'Invalid password'});
				}
			});
		});
	}
));

router.post('/login', passport.authenticate('local', {failureRedirect:'/users/login', failureFlash: 'Invalid username or password'}), function(req, res){
	console.log('Authentication successful!');
	req.flash('success', 'You are logged in');
	res.redirect('/');
});

router.get('/logout', function(req, res){
	req.logout();
	req.flash('success', 'You have logged out successfully');
	res.redirect('/users/login');
});

module.exports = router;
