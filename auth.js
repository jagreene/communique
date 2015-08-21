var users = require('./models/users');


module.exports = function (mongoose, ctxioClient){
    var Users = mongoose.model('Users', users.usersSchema);
    return function(accessToken, refreshToken, profile, done) {
        Users.findOne({ oauthID: profile.id  }, function(err, user) {
            if(err) { console.log(err);  }
            if (!err && user != null) {
                done(null, user);
            } else {
                var email = profile.emails[0]['value']
                ctxioClient.accounts().post({first_name:profile.name.givenName, last_name:profile.name.familyName, email:email}, function (err, response, request){
                    if (err){
                        console.log(err);
                    } else {
                        var context_id = response.body.id
                        ctxioClient.discovery().get({source_type:'IMAP', email: email}, function (err, response, request){
                            if (err){
                                console.log(err)
                            } else {
                                console.log
                                var details = response.body.imap;
                                if (details.use_ssl === true) {
                                    details.use_ssl = 1;
                                }

                                ctxioClient.accounts(context_id).sources().post({
                                    email: email,
                                    server: details.server,
                                    username: email,
                                    use_ssl: details.use_ssl,
                                    port: details.port,
                                    type: 'IMAP',
                                    provider_refresh_token: refreshToken,
                                    provider_consumer_key: process.env.GOOGLE_CLIENT_ID
                                }, function (err, response, request){
                                    if (err){
                                        console.log(err)
                                    } else {
                                        var user = new Users({
                                            oauthID: profile.id,
                                            contextId: context_id,
                                            name: profile.displayName,
                                            email: email,
                                            access_token: response.body.access_token,
                                            access_token_secret: response.body.access_token_secret,
                                            created: Date.now()
                                        });
                                        user.save(function(err) {
                                            if(err) {
                                                console.log(err);
                                            } else {
                                                console.log("saving user ...");
                                                done(null, user);
                                            };
                                        });
                                    }
                                })
                            }
                        })
                    }
                })
            };
        });
    }
}
