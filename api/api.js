//criamos o obj que renderiza HTML na saida
var jade = require('jade');

//criamos uma sintancia do Express
var express = require('express');

//criamos a instancia do App
var app = express();

//criamos instancia do body-parser, usado nos handlers
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

//criamos instancia do moment para tratar datas
var moment = require('moment');

//precisamos depois mudar a constante para uma gerada ao logar!
var tokenFake = "ASKDJHQWOEY98172354123";

//adicionando o driver cassandra
var cassandra = require('cassandra-driver');
var client = new cassandra.Client({ contactPoints: ['192.168.56.101'], keyspace: 'BDI'});
var query_login = 'SELECT * FROM usuarios WHERE "login" = ? AND "password" = ? ';
var query_login_by_token = 'SELECT * FROM usuarios WHERE "token" = ?';
var query_update_token = 'UPDATE usuarios SET "usr_token" = ? WHERE "login" = ? AND "password" = ?;';
var Uuid = require('cassandra-driver').types.Uuid;

app.post('/api/user/login', jsonParser, function(req, res){
	if(!req.body.hasOwnProperty('login') || 
	   !req.body.hasOwnProperty('password')) {
    
		res.statusCode = 400;
		return res.send('Error 400: use of login with bad data.');
	} 
	
	client.execute(query_login, [req.body.login, req.body.password], function(err, result) {
    if(err){
       console.log("Erron no query_login" + err);
    }else{
	
		if(result.rows.length == 1){
			//o ususario ja tem token?
			
			if(result.rows[0].usr_token == null){
				//o usuario logou a 1a vez e nao tem token
				//cria o token, atualiza o usuario
				var id = Uuid.random().toString();
				id = "T" + id;
				client.execute(query_update_token, [id, req.body.login, req.body.password], function(err, result) {
					if(err){
						console.log("Erro no query_update_token" + err);
					}else{
						res.json({token: id});
					}
				});
				//retorna o bendito
			}else{
				res.json({token: result.rows[0].usr_token});
			}
		}else{
			res.statusCode = 400;
			res.json({status: "falhou...."});
		}
    }
	});

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
	
	var retorno = { 
				list:[{transID: "trans1", 
						userID: "user1", 
						value: 21.0, 
						geo: {lat:"-23", long: "-43"}, 
						status:""},
						{transID: "trans2", 
						userID: "user1", 
						value: 20.0, 
						geo: {lat:"-23", long: "-43"}, 
						status:""}], 
				totalPages: 1, 
				currentPage: 0
				}


	return res.json(retorno);
	
});

app.get('/api/transaction/query/:token/:dateStart/:dateEnd/:page', jsonParser, function(req, res){
	if(req.params.token !== tokenFake) {
		res.statusCode = 400;
		return res.send('Error 400: use of query with bad token.');
	}
	
	if(!moment(req.params.dateStart).isValid() ||
	   !moment(req.params.dateEnd).isValid()){
		res.statusCode = 400;
		return res.send('Error 400: invalid date parameters.');	   
	}
	
	var retorno = { 
				list:[{transID: "trans1", 
						userID: "user1", 
						value: 21.0, 
						geo: {lat:"-23", long: "-43"}, 
						status:""},
						{transID: "trans2", 
						userID: "user1", 
						value: 20.0, 
						geo: {lat:"-23", long: "-43"}, 
						status:""}], 
				totalPages: 1, 
				currentPage: 0,
				startDate: req.params.dateStart,
				endDate: req.params.dateEnd
				}


	return res.json(retorno);
	
});




app.listen(process.env.PORT || 8899, '0.0.0.0');