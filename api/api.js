//criamos o obj que renderiza HTML na saida
var jade = require('jade');

//criamos uma sintancia do Express
var express = require('express');

//criamos a instancia do App
var app = express();

//usamos o await para esperar os callbacks no BUY
var await = require('await');

//lib para conectar no R
var r = require('rserve-client');

var ordenaArrayDeDatas = function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        return x - y;
    });
};

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
var client = new cassandra.Client({ contactPoints: ['192.168.56.101'], keyspace: 'BDICDM'});
var query_login = 'SELECT "usr_password", "usr_token" FROM "USER" WHERE "usr_login" = ? ';
var query_login_by_token = 'SELECT "usr_login" FROM "USER" WHERE "usr_token" = ?';
var query_update_token = 'UPDATE "USER" SET "usr_token" = ? WHERE "usr_login" = ?';
var query_add_buy = 'INSERT INTO "TRANSACTION" (tra_id, usr_token, car_id, loc_id, tra_date, tra_value, tra_lat, tra_lon, tra_confirmationcode, tra_status, tra_segment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
var query_transaction = 'SELECT tra_confirmationcode FROM "TRANSACTION" where usr_token = ? AND tra_id = ?'; 
var query_last_geo_transaction = 'select unixTimestampOf(tra_id) as date, tra_lat, tra_lon, tra_status from "TRANSACTION" where usr_token = ? AND tra_segment = ?;';
var query_confirm_transaction = 'UPDATE "TRANSACTION" SET tra_status = ? WHERE usr_token = ? AND tra_id = ?'
var Uuid = require('cassandra-driver').types.Uuid;
var TimeUuid = require('cassandra-driver').types.TimeUuid;

var segments = ['VAREJO', 'E-COMMERCE-VAREJO', 'E-COMMERCE-GAMES', 'E-COMMERCE-DURABLE-GOODS'];
var segmentsWithGEO = ['VAREJO'];

var CREDIT_LIMIT = 2500.00; //TODO: alterar modelagem para incluir no cassndra o Limite de crédito (Sprint #03)
var THRESHOLD_GEO = 5000; //TODO: parametrizar isso via sistema (distancia em metros!)


app.post('/api/transaction/buy', jsonParser, function(req, res){
	if(!req.body.hasOwnProperty('token')|| 
	   !req.body.hasOwnProperty('creditcardNumber')|| 
	   !req.body.hasOwnProperty('value')|| 
	   !req.body.hasOwnProperty('date')|| 
	   !req.body.hasOwnProperty('geo') ||
	   !req.body.hasOwnProperty('segment')) {

		res.statusCode = 400;
		return res.json({status: 'Error 400', message: 'Use of buy with bad data (missing properties).'});
	}
	var seguimentoEncontrado = false;
	var segmentUsesGEO = false;
	var trans_status = 'PENDING';
	
	for(var i = 0; i < segments.length; i++){
		if (segments[i] == req.body.segment){
			seguimentoEncontrado = true;
		}
	}
	
	for(var i = 0; i < segmentsWithGEO.length; i++){
		if (segmentsWithGEO[i] == req.body.segment){
			segmentUsesGEO = true;
		}
	}
	
	if(!seguimentoEncontrado){
		res.statusCode = 400;
		return res.json({status: 'Error 400', message: 'Use of buy with bad data (invalid segment).'});
	}

	//antes de registrar a transacao devemos
	//verificar se é uma fraude assim
	//mudamos o status dela na base
	var GEOFraud = false;
	var HMMFraud = false;
	var BoxPlotFraud = false;
	
	var usr_login = '';

	var calbacks = await('login', 'geo');
	var calbacksProcessoR = await('resultadoDoR');
	
	client.execute(query_login_by_token, [req.body.token], {prepare: true}, function(err, result) {
		if(err){
			res.statusCode = 500;
			calbacks.fail(err);
			return res.json({status: "Error on query_login", message: err});
		}
	
		if(result.rows.length != 1){
			res.statusCode = 400;
			return res.json({status: "Buy with bad token"});
		}
		calbacks.keep('login', result);
	});	
	
	if(req.body.value > CREDIT_LIMIT){
		trans_status = 'DENIED_DUE_TO_CREDIT_LIMIT_EXCEEDED';
	}
	
	//se ultrapassa o limite de crédito: nega a transação
	if(segmentUsesGEO && trans_status == 'PENDING'){

		//se houver mais de um segmento com GEO, precisa atualizar isso aqui
		client.execute(query_last_geo_transaction, 
						[req.body.token, segmentsWithGEO[0]], 
						{prepare: true}, 
			function(err, result) {
				if(err){
					res.statusCode = 500;
					calbacks.fail(err);
					return res.json({status: "Error on query_last_geo_transaction", message: err});
				}
				if(result.rows.length == 0){
					//não dá pra fazer nenhuma verificacao
					//se nao temos outra transacao para
					//comparar...
					GEOFraud = false;
					calbacks.keep('geo');
				}else{
					result.rows = ordenaArrayDeDatas(result.rows, 'date');
					calbacks.keep('geo', result.rows);
				}
			}
		);
	}else{
		calbacks.keep('geo');
	}
	
	// todos os callbacks voltaram
	calbacks.then(function(got){
	
		usr_login = got.login.rows[0].usr_login;
		
			
		if(got.geo != null){
		
			var transacao;
			
			for(var i = 0; i < got.geo.length; i++){
				if(got.geo[i].tra_status == 'PENDING' ||
				   got.geo[i].tra_status == 'CONFIRMED'){
					transacao = got.geo[i];
					break;
				}
			}
			
			if(transacao){		
				var dLat = Math.sqrt(Math.pow((req.body.geo.lat - transacao.tra_lat), 2));
				var dLon = Math.sqrt(Math.pow((req.body.geo.lon - transacao.tra_lon), 2))
				var hipo = Math.sqrt(Math.pow(dLat, 2) + Math.pow(dLon, 2));
				var distanciaEmMN = hipo * 60;
				var distanciaEmKm = distanciaEmMN * 1.852;
				var distanciaEmM = distanciaEmKm * 1000;

				if(distanciaEmM > THRESHOLD_GEO){
					GEOFraud = true;
					trans_status = 'DENIED_DUE_TO_GEO_FRAUD';
				}
			}
		}
	
		if(trans_status == 'PENDING'){ //se não teve fraude no GEO (ou se segmento não usa)
		
		//connecta no Rserve
		r.connect("192.168.56.101", 6311, function(err, client) {
			if(err){
				calbacksProcessoR.fail(err);
			}else{
				var codigoR = 'resposta <- c(classificaHMM("'+req.body.token+'",'+req.body.value+'), classificaBoxPlot("'+req.body.token+'",'+req.body.value+'))';	
				client.evaluate(codigoR, function(err, ans) {

					if(err){
						console.log("err:" + err);
						calbacksProcessoR.fail(err);
					}

					client.end();
					calbacksProcessoR.keep('resultadoDoR', ans);
				});
		}})
	}else{
		calbacksProcessoR.keep('resultadoDoR');
	}
	
	
	//HMM(Erro) + BoxPlot(Fora) = Fraude
	calbacksProcessoR.then(function(got){
	
		if(got.resultadoDoR){
			if(!got.resultadoDoR[0] && !got.resultadoDoR[1]){
				trans_status = 'DENIED_DUE_TO_FRAUD';
			}
		}
			var confirmationCode = Math.round(Math.random() * 10000);
			var transID = TimeUuid.now();
			var paramns = [transID,
				req.body.token, 
				-1, 
				-1, 
				moment().unix(), 
				req.body.value,
				req.body.geo.lat,
				req.body.geo.lon,
				confirmationCode.toString(),
				trans_status,
				req.body.segment];
				
				client.execute(query_add_buy, paramns, {prepare: true}, function(err, result) {
					if(err){
						res.statusCode = 500;
						return res.json({status: "Buy internal error", message: err});
					}

					if(trans_status == 'PENDING'){
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
							return res.json({status: "OK", transactionid: transID, token: req.body.token});
						});
					}else{
						var message = {
							text:    "Your TransactionID: "+ transID + "\n was denied with status: " + trans_status, 
							from:    "projbdic32@gmail.com",
							to:      usr_login,
							subject: "Transaction denied"
						};
						server.send(message, function(err, message) { 
							if(err){
								console.log("Error: " + err);
							};
							return res.json({status: trans_status, transactionid: transID, token: req.body.token});
						});
					}
				});
	},function(err){
		res.statusCode = 500;
		return res.json({status: "Error 500", message: err});
	});	

	
	
	},function(err){
		res.statusCode = 500;
		return res.json({status: "Error 500", message: err});
	});

});

app.post('/api/transaction/confirm', jsonParser, function(req, res){
	if(!req.body.hasOwnProperty('token')|| 
	   !req.body.hasOwnProperty('id') ||
	   !req.body.hasOwnProperty('confirmationCode')) {    
		res.statusCode = 400;
		return res.json({status: 'Error 400', message: 'Use of buy with confirm data.'});
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
				return res.json({status: "Error on query_transaction", message: err});			
			}
			
			if(result.rows.length != 1){
				res.statusCode = 400;
				return res.json({status: "Transaction not found!"});						
			}
			
			if(req.body.confirmationCode == result.rows[0].tra_confirmationcode){
			
				client.execute(query_confirm_transaction, ['CONFIRMED', req.body.token, req.body.id], {prepare: true}, function(err, result) {
					if(err){
						res.statusCode = 500;
						return res.json({status: "Error on query_confirm_transaction", message: err});			
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

//TS03 - Conexão com Hive
//adicionando o driver Hive npm install Node JDBC
var jdbc = new ( require('jdbc') );

var config = {
  libpath: '/usr/local/hive/lib/hive-jdbc-1.1.0-standalone.jar',
  libs: ['/usr/local/hadoop/common/hadoop-common-2.6.0.jar', '/usr/local/hadoop/share/hadoop/common/hadoop-common-2.6.0.jar'],
  drivername: 'org.apache.hive.jdbc.HiveDriver',
  url: 'jdbc:hive2://localhost:10000/project_bdi?connectTimeout=60000&socketTimeout=60000',
  // optionally
  user: 'hduser',
  password: 'hduser',
};

//Generic JDBC connection
var genericQueryHandler = function(err, results) {
  if (err) {
    console.log(err);
  } else if (results) {
    console.log(results);
  }

  jdbc.close(function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("Connection closed successfully!");
    }
  });
};

//API para a US04 do TS03
app.post('/api/custntrans', jsonParser, function(request, response){

//Variavel que recebe o Parametro de entrada
var hiveQueryId = request.body.queryId;  

//Variavel de retorno do banco
var hqlHive = "";
var fromHive = "";
var categories = null;
var flag = false;

// definição de funcao e chamada do Hive
switch(hiveQueryId) {
	case "01":{
			hqlHive = "SELECT trans_cli_id, clients.cli_firstname, clients.cli_lastname, COUNT(trans_cli_id) as cnt FROM transactions JOIN clients ON (trans_cli_id = cli_id) GROUP BY cli_firstname, cli_lastname, trans_cli_id ORDER BY cnt DESC LIMIT 250";
		break;
	}
	case "02":{
			hqlHive = "SELECT cli_id,trans_value FROM transactions ORDER BY trans_value DESC";
		break;
	}
	case "03":{
			hqlHive = "SELECT clients.cli_firstname,clients.cli_lastname,transactions.* FROM transactions JOIN clients ON (trans_cli_id = cli_id)";
		break;
	}
	case "04":
		hqlHive = "SELECT clients.cli_firstname,clients.cli_lastname,transactions.trans_date,transactions.trans_value,transactions.trans_loc_id FROM transactions JOIN clients ON (trans_cli_id = cli_id) ORDER BY trans_value DESC LIMIT 250";
		break;
	case "05":
		hqlHive = "SELECT clients.cli_firstname,clients.cli_lastname,transactions.trans_date,transactions.trans_value FROM transactions JOIN clients ON (trans_cli_id = cli_id) ORDER BY clients.cli_firstname";
	break;
	case "06":
		hqlHive = "SELECT clients.cli_firstname,clients.cli_lastname,transactions.trans_date,transactions.trans_value,transactions.trans_loc_id FROM transactions JOIN clients ON (trans_cli_id = cli_id) ORDER BY trans_date DESC LIMIT 250";
		break;
	case "07":
		hqlHive = "SELECT clients.cli_firstname, clients.cli_lastname, transactions.trans_date, transactions.trans_value, transactions.trans_loc_id, locations.loc_city, locations.loc_region, locations.loc_country FROM transactions JOIN clients ON (trans_cli_id = cli_id) JOIN locations ON (trans_loc_id = loc_id) ORDER BY locations.loc_city LIMIT 250";
		break;
	case "08":
		hqlHive = "SELECT transactions.trans_cli_id, clients.cli_firstname, cli_lastname, locations.loc_city, loc_country, SUM(transactions.trans_value) as trans_total FROM transactions JOIN clients ON (trans_cli_id = cli_id) JOIN locations ON (cli_loc_id = loc_id AND trans_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()), 7)) GROUP BY cli_firstname, cli_lastname, trans_cli_id, loc_city , loc_country, trans_date ORDER BY trans_total LIMIT 250";
		break;
	case "09":
	hqlHive = "SELECT transactions.trans_cli_id, clients.cli_firstname, cli_lastname, locations.loc_city, loc_country, SUM(transactions.trans_value) as trans_total FROM transactions JOIN clients ON (trans_cli_id = cli_id) JOIN locations ON (cli_loc_id = loc_id AND trans_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()), 30)) GROUP BY cli_firstname, cli_lastname, trans_cli_id, loc_city , loc_country, trans_date ORDER BY trans_total LIMIT 250";
		break;
	case "10":
	hqlHive = "SELECT transactions.trans_cli_id, clients.cli_firstname, cli_lastname, MONTH(trans_date), COUNT(MONTH(trans_date)) as month FROM transactions JOIN clients ON (trans_cli_id = cli_id AND trans_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()),365)) GROUP BY cli_firstname, cli_lastname, trans_cli_id, MONTH(trans_date) LIMIT 250";
	break;
	case "11":
	hqlHive = "SELECT trans_loc_id, locations.loc_country, MONTH(trans_date), COUNT(MONTH(trans_date)) as month FROM transactions JOIN locations ON (trans_loc_id = loc_id AND trans_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()),365)) GROUP BY trans_loc_id, loc_country, MONTH(trans_date) LIMIT 250";
	break;
}   

// Execute call
jdbc.initialize(config, function(err, res) {
	if (err) {
		console.log(err);
	}else{
		jdbc.open(function(err, conn){
			if(err){
				console.log(err);
			}else{
				 jdbc.executeQuery(hqlHive,function(err, results){
				if (err) {
					console.log(err);
					categories = err;
				} else if (results) {
					console.log(results);
					categories = results;
					
	 
						}
					jdbc.close(function(err) {
						if(err) {
							console.log(err);
						} else {
							console.log("Connection closed successfully!");
							}
//Retornando as respostas
return response.json(
	{Value: hqlHive,
	 Received: hiveQueryId,
	 Input: request.body.queryId,
	 Resto: categories
	}
);
					});
							});

						}
					});
				}
});

});

app.post('/api/prodncate', jsonParser, function(request, response){

//Variavel que recebe o Parametro de entrada
var hiveQueryId = request.body.queryId;  

//Variavel de retorno do banco
var hqlHive = "";
var fromHive = "";
var categories = null;
var flag = false;

// definição de funcao e chamada do Hive
switch(hiveQueryId) {
	case "01":{
			hqlHive = "SELECT products.prd_name , COUNT(sales.sale_prod_id) as count FROM products JOIN sales ON (sale_prod_id = prd_id AND sale_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()),365)) GROUP BY prd_name ORDER BY count DESC LIMIT 250";
		break;
	}
	case "02":{
			hqlHive = "SELECT products.prd_name , SUM(sales.sale_value) as sales_total FROM products JOIN sales ON (sale_prod_id = prd_id AND sale_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()),365)) GROUP BY prd_name ORDER BY sales_total DESC LIMIT 250";
		break;
	}
	case "03":{
			hqlHive = "SELECT products.prd_name , COUNT(sales.sale_prod_id) as count FROM products JOIN sales ON (sale_prod_id = prd_id AND sale_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()),7)) GROUP BY prd_name ORDER BY count DESC LIMIT 250";
		break;
	}
	case "04":
		hqlHive = "SELECT  prd_category_id, cat_name, COUNT(sales.sale_prod_id) as count FROM products JOIN sales ON (sale_prod_id = prd_id AND sale_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()),365)) JOIN categories ON (prd_category_id = cat_id) GROUP BY prd_category_id, cat_name ORDER BY count DESC";
		break;
	case "05":
		hqlHive = "SELECT products.prd_name , SUM(sales.sale_value) as sales_total FROM products JOIN sales ON (sale_prod_id = prd_id AND sale_date < 2015-04-04 AND sale_date > 2012-01-01) GROUP BY prd_name ORDER BY sales_total DESC LIMIT 250";
	break;
}   

// Execute call
jdbc.initialize(config, function(err, res) {
	if (err) {
		console.log(err);
	}else{
		jdbc.open(function(err, conn){
			if(err){
				console.log(err);
			}else{
				 jdbc.executeQuery(hqlHive,function(err, results){
				if (err) {
					console.log(err);
					categories = err;
				} else if (results) {
					console.log(results);
					categories = results;
					
	 
						}
					jdbc.close(function(err) {
						if(err) {
							console.log(err);
						} else {
							console.log("Connection closed successfully!");
							}
//Retornando as respostas
return response.json(
	{Value: hqlHive,
	 Received: hiveQueryId,
	 Input: request.body.queryId,
	 Resto: categories
	}
);
					});
							});

						}
					});
				}
});

});

app.post('/api/clinprod', jsonParser, function(request, response){

//Variavel que recebe o Parametro de entrada
var hiveQueryId = request.body.queryId;  

//Variavel de retorno do banco
var hqlHive = "";
var fromHive = "";
var categories = null;
var flag = false;

// definição de funcao e chamada do Hive
switch(hiveQueryId) {
	case "01":{
		hqlHive = "SELECT c.cat_name, cli.cli_id, cli.cli_lastname, count(sale_id) FROM clients cli, sales s, products p, categories c WHERE cli.cli_id=s.sale_cli_id and s.sale_prod_id=p.prd_id and p.prd_category_id=c.cat_id and c.cat_id in (1) GROUP BY c.cat_name, cli.cli_id, cli.cli_lastname";
		break;
}
}   

// Execute call
jdbc.initialize(config, function(err, res) {
	if (err) {
		console.log(err);
	}else{
		jdbc.open(function(err, conn){
			if(err){
				console.log(err);
			}else{
				 jdbc.executeQuery(hqlHive,function(err, results){
				if (err) {
					console.log(err);
					categories = err;
				} else if (results) {
					console.log(results);
					categories = results;
					
	 
						}
					jdbc.close(function(err) {
						if(err) {
							console.log(err);
						} else {
							console.log("Connection closed successfully!");
							}
//Retornando as respostas
return response.json(
	{Value: hqlHive,
	 Received: hiveQueryId,
	 Input: request.body.queryId,
	 Resto: categories
	}
);
					});
							});

						}
					});
				}
});

});


app.listen(process.env.PORT || 8899, '0.0.0.0');
