var CASSANDRA_IP = "orion2412.startdedicated.net"; //192.168.56.101
var RSERVE_IP = "orion2412.startdedicated.net";
var ACTIVEMQ_IP = "orion2412.startdedicated.net";
var HIVE_IP = "orion2412.startdedicated.net";
var HIVE_PORT = "10000";

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

//criamos instancia do servidor MQTT para enviar as notificacoes
var mqtt    = require('mqtt');
var clientMQTT  = mqtt.connect('mqtt://' + ACTIVEMQ_IP);
clientMQTT.on('connect', function () {
  //console.log("Conectado no MQTT");
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
var client = new cassandra.Client({ contactPoints: [CASSANDRA_IP], keyspace: 'BDICDM'});
var query_login = 'SELECT "usr_password", "usr_token" FROM "USER" WHERE "usr_login" = ? ';
var query_login_by_token = 'SELECT "usr_login", "usr_token" FROM "USER" WHERE "usr_token" = ?';
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
		r.connect(RSERVE_IP, 6311, function(err, RClient) {
			
			if(err){
				res.statusCode = 500;
				return res.json({status: "Error on RServe connection", message: err});
			}else{
				var codigoR = 'resposta <- c(classificaHMM("'+req.body.token+'",'+req.body.value+'), classificaBoxPlot("'+req.body.token+'",'+req.body.value+'))';	
				
				RClient.evaluate(codigoR, function(err, ans) {
					if(err){
						res.statusCode = 500;
						return res.json({status: "Error on RServe evaluation", message: err});
					}

					RClient.end();
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
							status: "ok",
							tra_confirmationcode:    confirmationCode.toString(),
							tra_id: transID, 
							usr_token: req.body.token,
							tra_value: req.body.value
						};
						
						clientMQTT.publish(req.body.token, JSON.stringify(message), function(err){
							if(err){
								return res.json({status: "error", message: err, transactionid: transID, token: req.body.token});
							}else{
								return res.json({status: "ok", transactionid: transID, token: req.body.token});
							}
						});
						
					}else{
						
						var message = {
							status: "denied",
							reason: trans_status,
							tra_id: transID, 
							usr_token: req.body.token
						};

						clientMQTT.publish(req.body.token, JSON.stringify(message), function(err){
							if(err){
								res.statusCode = 500;
								return res.json({status: "error", message: err, transactionid: transID, token: req.body.token, reason: trans_status});
							}else{
								return res.json({status: "denied", reason: trans_status, transactionid: transID, token: req.body.token});
							}
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
					
					var message = {
						status: "ok",
						tra_id: req.body.id, 
						usr_token: req.body.token,
						confirmed: true
					};
					
					clientMQTT.publish(req.body.token, JSON.stringify(message), function(err){
						if(err){
							return res.json({status: "error", message: err});
						}else{
							return res.json({status: "ok"});
						}
					});
				});
				
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
  url: 'jdbc:hive2://' + HIVE_IP + ':' + HIVE_PORT + '/project_bdi?connectTimeout=60000&socketTimeout=60000',
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
var categories = [];
var flag = false;

// definição de funcao e chamada do Hive
switch(hiveQueryId) {
	case "01":{
			hqlHive = "SELECT clients.cli_usr_login as login, clients.cli_first as nome, clients.cli_last as sobrenome, COUNT( trans_user_token ) as contagem FROM transactions JOIN clients ON (trans_user_token = usr_token ) GROUP BY cli_first, cli_last, cli_usr_login ORDER BY contagem DESC LIMIT 250";
		break;
	}
	case "02":{
			hqlHive = "SELECT clients.cli_id as id, clients.cli_first as nome,clients.cli_last as sobrenome, trans_value as value FROM transactions JOIN clients ON (trans_user_token = usr_token ) ORDER BY trans_value DESC LIMIT 250";
		break;
	}
	case "03":{
			hqlHive = "SELECT clients.cli_first as nome,clients.cli_last as sobrenome,transactions.* as all FROM transactions JOIN clients ON (trans_user_token = usr_token)";
		break;
	}
	case "04":
		hqlHive = "SELECT clients.cli_first as nome,clients.cli_last as sobrenome,transactions.trans_date as date,transactions.trans_value as value,transactions.trans_loc_id as IdLocal FROM transactions JOIN clients ON (trans_user_token = usr_token) ORDER BY trans_value DESC LIMIT 250";
		break;
	case "05":
		hqlHive = "SELECT clients.cli_first as nome, clients.cli_last as sobrenome, transactions.trans_date as date, transactions.trans_value as value FROM transactions JOIN clients ON (trans_user_token = usr_token) ORDER BY clients.cli_first";
	break;
	case "06":
		hqlHive = "SELECT clients.cli_first as nome,clients.cli_last as sobrenome,transactions.trans_date as date,transactions.trans_value as value,transactions.trans_loc_id as IdLocal FROM transactions JOIN clients ON (trans_user_token = usr_token) ORDER BY trans_date DESC LIMIT 250";
		break;
	case "07":
		hqlHive = "SELECT clients.cli_first as nome, clients.cli_last as sobrenome, transactions.trans_date as date, transactions.trans_value as value, transactions.trans_loc_id as IdLocal, locations.city_name as city, locations.state_name as state, locations.country_name as country FROM transactions JOIN clients ON (trans_user_token = usr_token) JOIN locations ON (trans_loc_id = loc_id) ORDER BY locations.city_name as city LIMIT 250";
		break;
	case "08":
		hqlHive = "SELECT transactions.trans_user_token, clients.cli_first as nome, clients.cli_last as sobrenome, locations.city_name as city, country_name, SUM(transactions.trans_value as value) as trans_total FROM transactions JOIN clients ON (trans_user_token = usr_token) JOIN locations ON (cli_loc_id = loc_id AND trans_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()), 7)) GROUP BY cli_first, cli_last, trans_user_token, city_name , country_name, trans_date ORDER BY trans_total LIMIT 250";
		break;
	case "09":
	hqlHive = "SELECT transactions.trans_user_token, clients.cli_first as nome, clients.cli_last as sobrenome, locations.city_name as city, country_name as country, SUM(transactions.trans_value as value) as trans_total FROM transactions JOIN clients ON (trans_user_token = usr_token) JOIN locations ON (cli_loc_id = loc_id AND trans_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()), 30)) GROUP BY cli_first, cli_last, trans_user_token, city_name , country_name, trans_date ORDER BY trans_total LIMIT 250";
		break;
	case "10":
	hqlHive = "SELECT transactions.trans_user_token, clients.cli_first as nome, cli_last as sobrenome, MONTH(trans_date) as month, COUNT(MONTH(trans_date)) as age FROM transactions JOIN clients ON (trans_user_token = usr_token AND trans_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()),365)) GROUP BY cli_first, cli_last, trans_user_token, MONTH(trans_date) LIMIT 250";
	break;
	case "11":
	hqlHive = "SELECT trans_loc_id as IdLocal, country_name as country, MONTH(trans_date) as month, COUNT(MONTH(trans_date)) as age FROM transactions JOIN locations ON (trans_loc_id = loc_id AND trans_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()),365)) GROUP BY trans_loc_id, country_name, MONTH(trans_date) LIMIT 250";
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
//objeto de retorno
    retorno = { titulo: 'Clientes ou Transações', dados: [] };
switch(hiveQueryId) {
			case "01":{
                retorno.subtitulo = '01 - Classificar clientes que mais compraram em ordem decrescente';
                retorno.descricao = '[ Descrição detalhada aqui ]';
				
				for (counter=0;counter<=categories.length;counter++){
				retorno.dados.push(categories[counter]);
				}
                
				break;
			}
			case "02":{
                retorno.subtitulo = '02 - Classificar, em ordem decrescente, os clientes por valor das transacoes';
                retorno.descricao = '[ Descrição detalhada aqui ]';
				for (counter=0;counter<=categories.length;counter++){
				retorno.dados.push(categories[counter]);
				}
				break;
			}
			case "03":{
                retorno.subtitulo = '03 - Selecionar todos os campos de Transacoes e nome do cliente';
                retorno.descricao = '[ Descrição detalhada aqui ]';
				for (counter=0;counter<=categories.length;counter++){
				retorno.dados.push(categories[counter]);
				}
				break;
			}
			case "04":{
                retorno.subtitulo = '04 - Ordenar as transacoes em ordem decrescente por valor';
                retorno.descricao = '[ Descrição detalhada aqui ]';
				for (counter=0;counter<=categories.length;counter++){
				retorno.dados.push(categories[counter]);
				}
               		break;
			}
			case "05":{
                retorno.subtitulo = '05 - Ordenar todos os clientes que realizaram compras por ordem alfabetica';
                retorno.descricao = '[ Descrição detalhada aqui ]';
				for (counter=0;counter<=categories.length;counter++){
				retorno.dados.push(categories[counter]);
				}
				break;
				}
			case "06":{
                retorno.subtitulo = '06 - Classificar as transacoes por data (decrescente), exibindo tambem o nome do cliente e valor';
                retorno.descricao = '[ Descrição detalhada aqui ]';
				for (counter=0;counter<=categories.length;counter++){
				retorno.dados.push(categories[counter]);
				}
				break;
			}
			case "07":{
                retorno.subtitulo = '07 - Classificar transacoes por local em ordem alfabetica, exibindo campos como nome, valor, regiao, pais, etc';
                retorno.descricao = '[ Descrição detalhada aqui ]';
				for (counter=0;counter<=categories.length;counter++){
				retorno.dados.push(categories[counter]);
				}
				break;
			}
			case "08":{
                retorno.subtitulo = '08 - Classificar transacoes por data (crescente) a cada 7 dias, exibindo o nome do cliente, local e valor';
                retorno.descricao = '[ Descrição detalhada aqui ]';
				for (counter=0;counter<=categories.length;counter++){
				retorno.dados.push(categories[counter]);
				}
				break;
			}
			case "09":{
                retorno.subtitulo = '09 - Classificar transacoes por data (crescente) a cada 30 dias, exibindo o nome do cliente, local (IP) e valor';
                retorno.descricao = '[ Descrição detalhada aqui ]';
				for (counter=0;counter<=categories.length;counter++){
				retorno.dados.push(categories[counter]);
				}
				break;
				}
			case "10":{
                retorno.subtitulo = '10 - Classificar clientes por quantidade de transações mensais no último ano em ordem decrescente';
                retorno.descricao = '[ Descrição detalhada aqui ]';
				for (counter=0;counter<=categories.length;counter++){
				retorno.dados.push(categories[counter]);
				}
				break;
			}
			case "11":{
                retorno.subtitulo = '11 - Classificar a quantidade de transações por país no último ano, agrupadas em meses';
                retorno.descricao = '[ Descrição detalhada aqui ]';
				for (counter=0;counter<=categories.length;counter++){
				retorno.dados.push(categories[counter]);
				}
				break;
			}
			default:{
				break;
		}
	}
return	response.json(retorno);
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
			hqlHive = "SELECT products.prd_name as product, COUNT(sales.salepr_prod_id) as count FROM products JOIN sales ON (salepr_prod_id = prd_id AND sale_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()),365)) GROUP BY prd_name ORDER BY count DESC LIMIT 250";
		break;
	}
	case "02":{
			hqlHive = "SELECT products.prd_name as product, SUM(sales.salepr_value) as sales_total FROM products JOIN sales ON (salepr_pro_cod = prd_id AND sale_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()),365)) GROUP BY prd_name ORDER BY sales_total DESC LIMIT 250";
		break;
	}
	case "03":{
			hqlHive = "SELECT products.prd_name as products, COUNT(sales.salepr_prod_id) as count FROM products JOIN sales ON (salepr_pro_cod = prd_id AND sale_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()),7)) GROUP BY prd_name ORDER BY count DESC LIMIT 250";
		break;
	}
	case "04":
		hqlHive = "SELECT prd_category_id as id, cat_name as categorie, COUNT(sales.salepr_pro_cod) as count FROM products JOIN sales ON (salepr_pro_cod = prd_id AND sale_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()),365)) JOIN categories ON (prd_category_id = cat_id) GROUP BY prd_category_id, cat_name ORDER BY count DESC LIMIT 250";
		break;
	case "05":
		hqlHive = "SELECT prd_category_id as id, cat_name as categories, COUNT(sales.salepr_pro_cod) as count FROM products JOIN sales ON (salepr_pro_cod = prd_id AND sale_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()),365)) JOIN categories ON (prd_category_id = cat_id) GROUP BY prd_category_id, cat_name ORDER BY count DESC LIMIT 250";
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
//objeto de retorno
    retorno = { titulo: 'Produtos ou Categorias', dados: [] };
switch(hiveQueryId) {
			case "01":{
                retorno.subtitulo = '01 - Classificar os produtos mais vendidos no último ano por quantidade';
                retorno.descricao = '[ Descrição detalhada aqui ]';
				
				for (counter=0;counter<=categories.length;counter++){
				retorno.dados.push(categories[counter]);
				}
                
				break;
			}
			case "02":{
                retorno.subtitulo = '02 - Classificar os total de vendas por produto no último ano';
                retorno.descricao = '[ Descrição detalhada aqui ]';
				for (counter=0;counter<=categories.length;counter++){
				retorno.dados.push(categories[counter]);
				}
				break;
			}
			case "03":{
                retorno.subtitulo = '03 - Selecionar todos os campos de Transacoes e nome do cliente';
                retorno.descricao = '[ Descrição detalhada aqui ]';
				for (counter=0;counter<=categories.length;counter++){
				retorno.dados.push(categories[counter]);
				}
				break;
			}
			case "04":{
                retorno.subtitulo = '04 - Classificar as categorias mais vendidas nos últimos 365 dias';
                retorno.descricao = '[ Descrição detalhada aqui ]';
				for (counter=0;counter<=categories.length;counter++){
				retorno.dados.push(categories[counter]);
				}
               		break;
			}
			case "05":{
                retorno.subtitulo = '05 - Classificar os produtos mais vendidos nos em um intervalo com data inicial e data final';
                retorno.descricao = '[ Descrição detalhada aqui ]';
				for (counter=0;counter<=categories.length;counter++){
				retorno.dados.push(categories[counter]);
				}
				break;
				}
			default:{
				break;
		}
	}
return	response.json(retorno);

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
		hqlHive = "SELECT c.cat_name as categories, cli.cli_id as id, cli.cli_last as sobrenome, count(sale_id) contagem FROM clients cli, sales s, products p, categories c WHERE cli.cli_id=s.sale_cli_cod and s.salepr_pro_cod=p.prd_id and p.prd_category_id=c.cat_id GROUP BY c.cat_name, cli.cli_id, cli.cli_last";
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
//objeto de retorno
    retorno = { titulo: 'Clientes e produtos', dados: [] };
switch(hiveQueryId) {
			case "01":{
                retorno.subtitulo = '01 - Classifica os clientes por grupo de tipo de compra agrupando por categoria';
                retorno.descricao = '[ Descrição detalhada aqui ]';
				
				for (counter=0;counter<=categories.length;counter++){
				retorno.dados.push(categories[counter]);
				}
                
				break;
			}
			default:{
				break;
		}
	}
return	response.json(retorno);
					});
							});

						}
					});
				}
});

});

app.listen(process.env.PORT || 8899, '0.0.0.0');
