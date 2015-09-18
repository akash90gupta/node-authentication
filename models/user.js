var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

//Making a connection to our nodeauth db using mongoose
mongoose.connect('mongodb://localhost/nodeauth');

var db = mongoose.connection;

/*People often ask: What is the difference between mongodb and mongoose?*/

/*
MongoDB is a NoSQL database system which stores data in the form of BSON documents. In terms of Node.js, mongodb is the native driver for interacting with a mongodb instance and mongoose and an Object modeling tool for MongoDB.
Mongoose is built upon the MongoDB driver to provide programmers with a way to model their data.

Some advantages and disadvantages of using both approaches.

Using Mongoose, a user can define the schema for the documents in a particular collection. It provides a lot of convenience in the creation and management of data in MongoDB. On the downside, learning mongoose can take some time, and has some limitations in handling schemas that are quite complex.

However, if your collection schema is unpredictable, or you want a Mongo-shell like experience inside Node.js, then go ahead and use the MongoDB driver. It is the simplest to pick up. The downside here is that you will have to write larger amounts of code for validating the data, and the risk of errors is higher.
*/

//Creating the schema using mongoose inside mongodb to model our data
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	password: {
		type: String,
		required: true,
		bcrypt: true
	},
	email: {
		type: String
	},
	name: {
		type: String
	},
	profileimage: {
		type: String
	}
});

var User = module.exports = mongoose.model('User', UserSchema);

//Creating comparePassword model in this module which we export ot the users.js file 
module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch){
		if(err) return callback(err);
		callback(null, isMatch);
	});
}

//Creating getUserById model in this module which we export ot the users.js file 
module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

//Creating getUserByUsername model in this module which we export ot the users.js file 
module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

//Creating createUser model in this module which we export ot the users.js file 
module.exports.createUser = function(newUser, callback){
		//Intercepting the object with bcrypt to hash the password
		bcrypt.hash(newUser.password, 10, function(err, hash){
			if(err) throw err;
			//Set hashed password
			newUser.password = hash;
			//Create user
			newUser.save(callback);
		});
}