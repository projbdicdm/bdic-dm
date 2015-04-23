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
	ssl: false, 
	tls: true, 
    port : 587 
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
var clientEmail = "cliente@email.com.br";
var clientPass = "123456";
var tokenForResetPassword = "23530ddb-a566-485d-bc8f-237305b0bc3b";

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

app.post('/api/user/resetpassword', jsonParser, function(req, res){
    
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    
	if(!req.body.hasOwnProperty('login')) {
		res.statusCode = 400;
		return res.send('Error 400: use of resetpassword with bad data.');
	}
    
    // na versao final da api (integracao com o Cassandra), api deve procurar se o email existe na base
    
    // depois enviamos um email ao usuario com o token temporario para redefinicao de senha
    var message = {
        text:    "Recuperação de senha\n\nVocê solicitou alteração da sua senha.\nClique no link abaixo para redefini-la.\n" + fullUrl + "/" + tokenForResetPassword + "\n\nCaso não tenha solicitado essa alteração, ignore este email.", 
        from:    "projbdic32@gmail.com",
        to:      [req.body.login],
        subject: "BDIC-DM - Recuperação de Senha"
    };
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    server.send(message, function(err, message) { 
        if(err){
            console.log("Error on send email");
            console.log(err);
            return res.json({status: "error", error: err, message: message});
        } else {
            console.log("Email sended with success!");
            return res.json({status: "ok"});
        }
    });
});

app.get('/api/user/resetpassword/:token', jsonParser, function(req, res){
    
	if(req.params.token !== tokenForResetPassword) {
		res.statusCode = 400;
		return res.send('Error 400: use of resetpassword with bad data.');
	}
    
    // na versao final da api (integracao com o Cassandra), api deve procurar se o email existe na base
    
    // se token for encontrado na base, redireciona o usuario para a pagina de redefinicao de senha
    res.redirect("/userresetpassword.html");
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






