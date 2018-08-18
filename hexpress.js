
"use strict";

var http = require('http');
var queryString = require('querystring');
var fs = require('fs');
var Handlebars = require('handlebars');

module.exports = function () {
  var getRoutes = [];
  var getCallbacks = [];
  var postRoutes = [];
  var postCallbacks = [];
  return {
    get: function(route, callback) {
        getRoutes.push(route);
        getCallbacks.push(callback);
    },
    post: function(route, callback){
      postRoutes.push(route);
      postCallbacks.push(callback);
    },
    use: function(routePrefix, callback){
      getRoutes.push({route: routePrefix, use: true});
      postRoutes.push({route: routePrefix, use: true});
      getCallbacks.push(callback);
      postCallbacks.push(callback);
    },
    listen: function(port){
      var self = this;
      var server=http.createServer(function(req,res){
        res.send = function(string){
          res.writeHead(200, {
          'Content-Type': 'text/plain'});
          res.end(string);
        }
        res.json = function(obj){
          res.writeHead(200, {
          'Content-Type': 'application/json'});
          res.end(JSON.stringify(obj));
        }
        res.render = function(name, options){
          fs.readFile('./views/' + name, 'utf8', function(err, contents){
            var template = Handlebars.compile(contents);
            res.end(template(options))
          })
        }

        if(req.method === 'GET') {
          for(var i = 0; i < getRoutes.length; i++){
            var query = queryString.parse(req.url);
            if(getRoutes[i].use){
              if(getRoutes[i].route.split('/')[1] === req.url.split('/')[1]){
                req.query = query;
                getCallbacks[i](req, res);
              }
            } else{
              req.params = {};
              var individualPaths = getRoutes[i].split('/');
              var hasParams = false;
              for(var j = 0; j < individualPaths.length; j++){
                if(individualPaths[j][0] === ':'){
                  req.params[individualPaths[j].slice(1)] = req.url.split('/')[j];
                  hasParams = true;
                }
              }
              if(hasParams){
                if(getRoutes[i].split('/').length === req.url.split('/').length){
                  req.query = query;
                  getCallbacks[i](req, res);
                  break;
                }
              } else {
                if(getRoutes[i] === req.url.split('?')[0]){
                  req.query = query;
                  getCallbacks[i](req, res);
                  break;
                }
              }

            }

          }
        }
        if(req.method ==='POST') {
          var body = '';
          req.on('readable', function() {
              var chunk = req.read();
              if (chunk) body += chunk;
          });
          req.on('end', function() {
              req.body = queryString.parse(body);
              for(var i = 0; i < postRoutes.length; i++){
                if(postRoutes[i].use){
                  if(postRoutes[i].route.split('/')[1] === req.url.split('/')[1]){
                    req.body = JSON.parse(body);
                    postCallbacks[i](req, res);
                    break;
                  }
                } else{
                  if(postRoutes[i] === req.url){
                    req.body = JSON.parse(body);
                    postCallbacks[i](req, res);
                    break;
                  }
                }

              }

          });

        }
      });
    server.listen(port);
    }
  };
};
