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

var path = require('path');

var Uuid = require('cassandra-driver').types.Uuid;

// variaveis 'mock'
var adminEmail = "admin@email.com.br";
var adminPass = "123456";
var clientEmail = "client@email.com.br";
var clientPass = "123456";

// redireciona acesso aos arquivos para a pasta 'site'
app.use("/", express.static(__dirname + '/site'));

app.post('/api/user/login', jsonParser, function(req, res){
    
	if(!req.body.hasOwnProperty('login') || 
	   !req.body.hasOwnProperty('password')) {
    
		res.statusCode = 400;
		return res.json({status: 'Error 400: use of login with bad data.'});
	}
    
    //cria o token, atualiza o usuario
    var id = Uuid.random().toString();

    // mock da autenticacao de administrador
    if([req.body.login] == adminEmail && adminPass == [req.body.password]){
        return res.json({token: id, userType: "admin"});
    }
    
    // mock da autenticacao de cliente / comprador
    if([req.body.login] == clientEmail && clientPass == [req.body.password]){
        return res.json({token: id, userType: "client"});
    }
    
    // mock do erro na autenticacao
    res.statusCode = 400;
    return res.json({status: "Auth failed"});
});

app.put('/api/user/resetpassword', jsonParser, function(req, res){
    
	if(!req.body.hasOwnProperty('login')) {
    
		res.statusCode = 400;
		return res.send('Error 400: use of resetpassword with bad data.');
	}
    
	
	return res.json({status: "ok"});
});

app.get('/api/user/redefinepassword/{token}', jsonParser, function(req, res){
    
	if(!req.body.hasOwnProperty('login')) {
    
		res.statusCode = 400;
		return res.send('Error 400: use of resetpassword with bad data.');
	}
    
    // Get token
	
	return res.json({status: "ok"});
});

app.post('/api/user/register', jsonParser, function(req, res){
	if(!req.body.hasOwnProperty('name') || 
	   !req.body.hasOwnProperty('login')|| 
	   !req.body.hasOwnProperty('email')|| 
	   !req.body.hasOwnProperty('password')) {
    
		res.statusCode = 400;
		return res.send('Error 400: use of register with bad data.');
	} 
	
	return res.json({status: "ok"});
});

app.listen(process.env.PORT || 8899, '0.0.0.0');
console.log("Running API mock and portal web");
console.log("Access http://localhost:8899");






