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
var query_login = 'SELECT "usr_password", "usr_token" FROM "USER" WHERE "usr_login" = ? ';
var query_login_by_token = 'SELECT "usr_login" FROM "USER" WHERE "usr_token" = ?';
var query_update_token = 'UPDATE "USER" SET "usr_token" = ? WHERE "usr_login" = ?';
var query_add_buy = 'INSERT INTO "TRANSACTION" (tra_id, usr_token, car_id, loc_id, tra_date, tra_value, tra_lat, tra_lon, tra_confirmationcode, tra_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
var query_transaction = 'SELECT tra_confirmationcode FROM "TRANSACTION" where usr_token = ? AND tra_id = ?'; 
var query_confirm_transaction = 'UPDATE "TRANSACTION" SET tra_status = ? WHERE usr_token = ? AND tra_id = ?'
var Uuid = require('cassandra-driver').types.Uuid;

var segments = ['VAREJO', 'E-COMMERCE-VAREJO', 'E-COMMERCE-GAMES', 'E-COMMERCE-DURABLE-GOODS'];
var segmentsWithGEO = ['VAREJO'];

app.post('/api/transaction/buy', jsonParser, function(req, res){
	if(!req.body.hasOwnProperty('token')|| 
	   !req.body.hasOwnProperty('creditcardNumber')|| 
	   !req.body.hasOwnProperty('value')|| 
	   !req.body.hasOwnProperty('date')|| 
	   !req.body.hasOwnProperty('geo') ||
	   !req.body.hasOwnProperty('segment')) {
    
		res.statusCode = 400;
		return res.send('Error 400: use of buy with bad data (missing properties).');
	}
	var seguimentoEncontrado = false;
	
	for(var i = 0; i < segments.length; i++){
		if (segments[i] == req.body.segment){
			seguimentoEncontrado = true;
		}
	}
	
	if(seguimentoEncontrado){
		res.statusCode = 400;
		return res.send('Error 400: use of buy with bad data (invalid segment).');	
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
		
		//antes de registrar a transacao devemos
		//verificar se é uma fraude assim
		//mudamos o status dela na base
		
		//se ultrapassa o limite de crédito: nega a transação
		//se segmento que tem GEO aplica GEO (distancia > 50km em um dia de diferenca) = FRAUDE
		//senão aplica HMM, se for fraude
		//aplica BoxPlot
		//HMM(Erro) + BoxPlot(Fora) = Fraude
		
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
