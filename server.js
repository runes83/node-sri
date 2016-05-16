// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var cors=require('cors');
var httpreq = require('httpreq');
var crypto = require('crypto');
var hash256 = crypto.createHash('sha256');
var hash384 = crypto.createHash('sha384');
var hash512 = crypto.createHash('sha512');

app.use(cors({
  "origin": "*",
  "methods": "GET,HEAD,PUT,POST,DELETE",
  "preflightContinue": true,
  "allowedHeaders":"*"
})); // include before other routes

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var html='<html><body><h1>SRI Hash service</h1>'
    +'<h2>Request:</h2><pre>Post: {url:"http://urlto.genereate.hash"}</pre>'
    +'<h2>Response:</h2><pre>{'
  +'"sha256": "LwlAQF+epNvOlXr+SMS+x50Z1SL1dYLFMyJjnA1x1K0=",<br/>'
  +'"sha384": "Z54We2feRF2RTsvc9Y9vOfW610TFQNomeo7AQBYDFcvn59q/eyPhP3SSeZdvBtdm",<br/>'
  +'"sha512": "TBL+NrQTfOq5YS9Bk8s4J7dEzDV8ppnWr0eUIy74t99jEhRRESIHQZU0y2iLHX3Ag9Yduoyz6Dm0Iy5NSV7xXA==",<br/>'
  +'"script": "&lt;script src=\"https://signerejs.azureedge.net/0525834d21324ca4bba7a60701523728.js\" integrity=\"sha256-LwlAQF+epNvOlXr+SMS+x50Z1SL1dYLFMyJjnA1x1K0= sha384-Z54We2feRF2RTsvc9Y9vOfW610TFQNomeo7AQBYDFcvn59q/eyPhP3SSeZdvBtdm sha512-TBL+<br/>'+'NrQTfOq5YS9Bk8s4J7dEzDV8ppnWr0eUIy74t99jEhRRESIHQZU0y2iLHX3Ag9Yduoyz6Dm0Iy5NSV7xXA==\" crossorigin=\"anonymous\"&gt;&lt;/script&gt;"<br/>'
  +'}</pre>'
    +'</body></html>';
  res.end(html);
});
router.post('/',function(req,response){
   console.log(req.body.url);
   if(!req.body.url){
       BadRequeset(response);
   }else{
   httpreq.get(req.body.url,{binary: true}, function (err, res){
    if (err){
      BadRequeset(response);
    } else{
        hash256.update(res.body,'binary');
        hash384.update(res.body,'binary');
        hash512.update(res.body,'binary');

        var sha256Value=hash256.digest('base64');
        var sha384Value=hash384.digest('base64');
        var sha512Value=hash512.digest('base64');

        response.json({ 
            sha256:sha256Value,
            sha384:sha384Value,
            sha512:sha512Value,
            script:'<script src="'+req.body.url+'" integrity="sha256-'+sha256Value+' sha384-'+sha384Value
                +' sha512-'+sha512Value+'" crossorigin="anonymous"></script>'
        });   
    }

    });
   }
});

function BadRequeset(res){
    res.writeHead(400, {"Content-Type": "text/plain"});
    res.write('400 Not valid request. Valid is json {url:"http://urlto.genereate.hash"}');
    res.end();
}

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);