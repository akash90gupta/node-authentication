var express = require('express');
var router = express.Router();

/* GET home page or Members Page */
router.get('/', ensureAuthenticated, function(req, res, next) {
  res.render('index', { title: 'Members' });
});

//this function deals with the passport authentication API
function ensureAuthenticated(req,res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/users/login');
}

module.exports = router;
