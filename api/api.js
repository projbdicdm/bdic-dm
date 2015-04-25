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

//precisamos depois mudar a constante para uma gerada ao logar!
var tokenFake = "ASKDJHQWOEY98172354123";

//adicionando o driver cassandra
var cassandra = require('cassandra-driver');
var client = new cassandra.Client({ contactPoints: ['192.168.56.101'], keyspace: 'BDI'});
var query_login = 'SELECT "usr_password" FROM "USER" WHERE "usr_login" = ? ';
var query_login_by_token = 'SELECT "usr_login" FROM "USER" WHERE "usr_token" = ?';
var query_update_token = 'UPDATE "USER" SET "usr_token" = ? WHERE "usr_login" = ?';
var query_add_buy = 'INSERT INTO "TRANSACTION" (tra_id, usr_token, car_id, loc_id, tra_date, tra_value, tra_lat, tra_lon, tra_confirmationcode, tra_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
var query_transaction = 'SELECT tra_confirmationcode FROM "TRANSACTION" where usr_token = ? AND tra_id = ?'; 
var query_confirm_transaction = 'UPDATE "TRANSACTION" SET tra_status = ? WHERE usr_token = ? AND tra_id = ?'
var Uuid = require('cassandra-driver').types.Uuid;

//adicionando o driver Node-Hive
var hive = require('node-hive').for({server:"192.168.56.101:9000", timeout:10000});


app.get('/api/custntrans', jsonParser, function(req, res){
var statusFlag;
	hive.fetch("SELECT * FROM testAlecdsil", function(err, data) {
  		if(data){
			statusFlag='connected';
			return res.json(statusFlag);
  		}else{
			statusFlag='Not connected';
		}
	});
});	

app.get('/api/conexaotest', jsonParser, function(req, res){
return res.json({status: 'Error 0000000: use of login with bad data.'});
	
});	
 

app.post('/api/user/login', jsonParser, function(req, res){
	if(!req.body.hasOwnProperty('login') || 
	   !req.body.hasOwnProperty('password')) {
    
		res.statusCode = 400;
		return res.json({status: 'Error 400: use of login with bad data.'});
	} 
	
	client.execute(query_login, [req.body.login], function(err, result) {
		if(err){
			res.statusCode = 500;
			return res.json({status: "query_login Failed"});
		}else{
			if(result.rows.length == 1){
				//precisamos verificar a senha 1o
				if(result.rows[0].usr_password != req.body.password){
					res.statusCode = 403;
					return res.json({status: "Auth failed"});
				} //senha OK, continua (menus um else...)
			//o ususario ja tem token?
			if(result.rows[0].usr_token == null){
				//o usuario logou a 1a vez e nao tem token
				//cria o token, atualiza o usuario
				var id = Uuid.random().toString();
				client.execute(query_update_token, [id, req.body.login], {prepare: true}, function(err, result) {
					if(err){
						res.statusCode = 500;
						return res.json({status: "Erro no query_update_token" + err});
					}else{
						return res.json({token: id});
					}
				});
				//retorna o token
			}else{
				return res.json({token: result.rows[0].usr_token});
			}
		}else{
			res.statusCode = 400;
			return res.json({status: "Auth failed"});
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

	var usr_login = '';
	
	client.execute(query_login_by_token, [req.body.token], {prepare: true}, function(err, result) {
		if(err){
			res.statusCode = 500;
			return res.json({status: "Error on query_login: " + err});
		}
	
		if(result.rows.length != 1){
			res.statusCode = 400;
			return res.json({status: "Buy with bad token"});
		}
		
		usr_login = result.rows[0].usr_login;
		
		var confirmationCode = Math.round(Math.random() * 10000);
	
		
		var transID = Uuid.random().toString();
		var paramns = [transID,
		req.body.token, 
		-1, 
		-1, 
		moment().unix(), 
		req.body.value,
		req.body.geo.lat,
		req.body.geo.long,
		confirmationCode.toString(),
		'PENDING'
		]
		client.execute(query_add_buy, paramns, {prepare: true}, function(err, result) {
			if(err){
				res.statusCode = 500;
				return res.json({status: "Buy internal error: " + err});
			}

			//enviamos o email com o código de confirmação para o usuário
			var message = {
				text:    "Your confirmation code is: " + confirmationCode.toString() + "\nTransactionID: "+ transID, 
				from:    "projbdic32@gmail.com",
				to:      usr_login,
				subject: "Confirmation code"
			};
			server.send(message, function(err, message) { 
				if(err){
					console.log("Error: " + err);
				};
				console.log(message);
				return res.json({status: "ok", transactionid: transID, token: req.body.token});
			});

		});
	});	
});

app.post('/api/transaction/confirm', jsonParser, function(req, res){
	if(!req.body.hasOwnProperty('token')|| 
	   !req.body.hasOwnProperty('id') ||
	   !req.body.hasOwnProperty('confirmationCode')) {    
		res.statusCode = 400;
		return res.send('Error 400: use of buy with confirm data.');
	}

	var usr_login = '';
	
	client.execute(query_login_by_token, [req.body.token], {prepare: true}, function(err, result) {
		if(err){
			res.statusCode = 500;
			return res.json({status: "Error on query_login: " + err});
		}
	
		if(result.rows.length == 0){
			res.statusCode = 400;
			return res.json({status: "Confirm with bad token"});
		}
		usr_login = result.rows[0].usr_login;
		
		//vamos procurar a transacao agora
		client.execute(query_transaction, [req.body.token, req.body.id], {prepare: true}, function(err, result) {
			if(err){
				res.statusCode = 500;
				return res.json({status: "Error on query_transaction: " + err});			
			}
			
			if(result.rows.length != 1){
				res.statusCode = 400;
				return res.json({status: "Transaction not found!"});						
			}
			
			if(req.body.confirmationCode == result.rows[0].tra_confirmationcode){
			
				client.execute(query_confirm_transaction, ['CONFIRMED', req.body.token, req.body.id], {prepare: true}, function(err, result) {
					if(err){
						res.statusCode = 500;
						return res.json({status: "Error on query_confirm_transaction: " + err});			
					}
				});
				//enviamos o email com o código de confirmação para o usuário
				var message = {
					text:    "Your transaction id: [" + req.body.id + "] was sucessfull confirmed!", 
					from:    "projbdic32@gmail.com",
					to:      usr_login,
					subject: "Transaction confirmed"
				};
				server.send(message, function(err, message) { 
					if(err){
						console.log("Error: " + err);
					};
				});				
				
				return res.json({status: "ok"});
			}else{
				res.statusCode = 400;
				return res.json({status: "Invalid confirmation code!"});
			}
						
		});
		
	});

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
