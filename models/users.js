var mongoose = require("mongoose");

var usersSchema = mongoose.Schema({
        oauthID: Number,
	name: String,
        contextId: String,
        name: String,
        email: String,
        access_token: String,
        access_token_secret: String,
        created: Date
});

module.exports.usersSchema = usersSchema;
