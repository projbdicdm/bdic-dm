//criamos o obj que renderiza HTML na saida
var jade = require('jade');

//criamos uma sintancia do Express
var express = require('express');

//criamos a instancia do App
var app = express();

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

//precisamos depois mudar a constante para uma gerada ao logar!
var tokenFake = "ASKDJHQWOEY98172354123";


app.post('/api/user/login', jsonParser, function(req, res){
	if(!req.body.hasOwnProperty('login') || 
	   !req.body.hasOwnProperty('password')) {
    
		res.statusCode = 400;
		return res.send('Error 400: use of login with bad data.');
	} 
	
	if(req.body.login == 'usuario' && req.body.password == 'usuario'){
		return res.json({token: tokenFake});
	}else{
		res.statusCode = 400;
		return res.json({status: "auth error"});
	}
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


app.put('/api/user/resetpassword', jsonParser, function(req, res){
	if(!req.body.hasOwnProperty('login')) {
    
		res.statusCode = 400;
		return res.send('Error 400: use of resetpassword with bad data.');
	} 
	
	return res.json({status: "ok"});
});

app.post('/api/transaction/buy', jsonParser, function(req, res){
	if(!req.body.hasOwnProperty('token')|| 
	   !req.body.hasOwnProperty('creditcardNumber')|| 
	   !req.body.hasOwnProperty('value')|| 
	   !req.body.hasOwnProperty('date')|| 
	   !req.body.hasOwnProperty('geo')) {
    
		res.statusCode = 400;
		return res.send('Error 400: use of buy with bad data.');
	}

	if(res.body.token == tokenFake){
		return res.json({status: "ok"});
	}else{
		res.statusCode = 400;
		return res.send('Error 400: use of buy with bad token.');
	}
	
});

app.post('/api/transaction/confirm', jsonParser, function(req, res){
	if(!req.body.hasOwnProperty('token')|| 
	   !req.body.hasOwnProperty('confirmationCode')) {
    
		res.statusCode = 400;
		return res.send('Error 400: use of buy with confirm data.');
	}

	if(res.body.token == tokenFake && res.body.confirmationCode == "9999"){
		return res.json({status: "ok"});
	}else{
		res.statusCode = 400;
		return res.send('Error 400: use of buy with bad confirmationCode or token.');
	}
});


app.get('/api/transaction/boxPlot/:token/:page', jsonParser, function(req, res){
	if(req.params.token !== tokenFake) {
		res.statusCode = 400;
		return res.send('Error 400: use of boxPlot with bad token.');
	}


	return res.json({status: "ok"});
	
});

app.listen(process.env.PORT || 8899, '0.0.0.0');