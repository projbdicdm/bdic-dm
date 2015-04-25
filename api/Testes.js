//criamos o obj que renderiza HTML na saida
var jade = require('jade');

//criamos uma sintancia do Express
var express = require('express');

//criamos a instancia do App
var app = express();


//criamos instancia do servidor de email
var email   = require("emailjs");
var server  = email.server.connect({
	user:     "projbdic32@gmail.com", 
	password: "projbdic322015", 
	host:     "smtp.gmail.com",
	ssl: true
});

//criamos instancia do body-parser, usado nos handlers
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

//criamos instancia do moment para tratar datas
var moment = require('moment');
 

app.post('/api/custntrans', jsonParser, function(req, res){
var idQuery = req.body.queryId;
var definedQuery = "";

if(idQuery=="01") {
definedQuery = idQuery;
}
if(idQuery=="02") {
definedQuery = "Boa Manolo";
}
	var letra = 'ok';		
	return res.json({Value: definedQuery});
});



app.listen(process.env.PORT || 8899, '0.0.0.0');
