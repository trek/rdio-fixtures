var http = require('http'),
    rdioAuth = require('./index'),
    OAuth = require('oauth').OAuth,
    open  = require('open'),
    url = require('url');

var config = {
  rdioOauthRequestUrl: 'http://api.rdio.com/oauth/request_token',
  rdioOauthAccessUrl: 'http://api.rdio.com/oauth/access_token',
  rdioAuthUrl: 'https://www.rdio.com/oauth/authorize?oauth_token=',
  rdioApiKey: 'm7nqqu42yx7augqf5u6ekxjh',
  rdioApiSharedSecret: 'FRfXAsVExQ',
  host: 'localhost',
  port: '3000'
}

var oa = new OAuth(
  config.rdioOauthRequestUrl,
  config.rdioOauthAccessUrl, 
  config.rdioApiKey,
  config.rdioApiSharedSecret, 
  "1.0",
  "http://"+config.host+":"+config.port, "HMAC-SHA1"
);


oa.getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret){
  if (error) {
    console.log("error:", error);
  } else { 
    // redirect the authorize the token
    console.log("requesting token");
    open(config.rdioAuthUrl+oauthToken);

    // start a server to catch the redirect
    server = http.createServer(function (req, res) {
      var parsedUrl = url.parse(req.url, true);

      var handler = function(error, oauthAccessToken, oauthAccessTokenSecret, results){
            var body = ["var oauthAccessToken = '", oauthAccessToken, "';\n",
                        "var oauthAccessTokenSecret = '", oauthAccessTokenSecret, "';"].join('');
            res.end(body);           //close the response
            req.connection.end();    //close the socket
            req.connection.destroy;  //close it really
            server.close();          //close the server
          };

      oa.getOAuthAccessToken(
        parsedUrl.query.oauth_token,
        oauthTokenSecret, 
        parsedUrl.query.oauth_verifier,
        handler
      );
    })

    // pause while we authenticate
    console.log("opening your browser...");
    server.listen(config.port, config.host);
  }
});