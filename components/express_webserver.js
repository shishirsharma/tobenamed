var express = require('express');
var bodyParser = require('body-parser');
var querystring = require('querystring');
var debug = require('debug')('botkit:webserver');
const Sentry = require('@sentry/node');


module.exports = function(controller) {


  if (!process.env.SENTRY_ENVIRONMENT) {
    process.env.SENTRY_ENVIRONMENT = 'development';
  }


  var webserver = express();


  if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN });

    // The request handler must be the first middleware on the app
    webserver.use(Sentry.Handlers.requestHandler());
  }

  // webserver.use(function(req, res, next) {
  //   req.rawBody = '';

  //   req.on('data', function(chunk) {
  //     req.rawBody += chunk;
  //   });

  //   next();
  // });
    webserver.use(bodyParser.json());
    webserver.use(bodyParser.urlencoded({ extended: true }));

    // import express middlewares that are present in /components/express_middleware
    var normalizedPath = require("path").join(__dirname, "express_middleware");
    require("fs").readdirSync(normalizedPath).forEach(function(file) {
        require("./express_middleware/" + file)(webserver, controller);
    });

    webserver.use(express.static('public'));

    webserver.listen(process.env.PORT || 3000, null, function() {

        debug('Express webserver configured and listening at http://localhost:' + process.env.PORT || 3000);

    });

    // import all the pre-defined routes that are present in /components/routes
    var normalizedPath = require("path").join(__dirname, "routes");
    require("fs").readdirSync(normalizedPath).forEach(function(file) {
      require("./routes/" + file)(webserver, controller);
    });

    controller.webserver = webserver;

    return webserver;

}
