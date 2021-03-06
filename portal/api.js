//url da api principal
// var MAIN_API = "http://localhost:8899/api/";
var MAIN_API = "http://orion2412.startdedicated.net:8899/api/";

//criamos o obj que renderiza HTML na saida
var jade = require('jade');

//criamos uma sintancia do Express
var express = require('express');

//criamos a instancia do App
var app = express();

//criamos a instancia do conector ao mysql
var mysql = require("mysql");

//instancia do http request
var requestify = require('requestify'); 

//util nodejs
var util = require('util');

var connection = mysql.createConnection({
	host: "orion2412.startdedicated.net",
	user: "root",
	password: "12root34",
	database: "BDIC-DM"
});

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

// variaveis 'mock'
var tokenForResetPassword = "23530ddb-a566-485d-bc8f-237305b0bc3b";

// querys mysql
var query_categorias = 'SELECT cat_id, cat_nm FROM categoria;';
var query_lista_produtos = 'SELECT pro_id as id, pro_img as imagem, pro_nm as descricao, pro_vl as valor, pro_ds as observacao FROM produto';
var query_detalhes_produto_by_id = 'SELECT pro_id as id, pro_img as imagem, pro_nm as descricao, pro_vl as valor, pro_ds as observacao FROM produto WHERE pro_id = ?';
var query_cartoes_cliente = 'SELECT * FROM cartao WHERE car_cli_cod=?';
var query_buscar_id_cliente = 'SELECT * FROM cliente where cli_mail = ? Limit 1';

// redireciona acesso aos arquivos para a pasta 'site'
app.use("/", express.static(__dirname + '/site'));

//buscar id de cliente por email mysql
app.get('/api/user/getIDClient/:email', jsonParser, function(req, res){
	objRetorno = [];
	try{
		connection.query(query_buscar_id_cliente, [req.params.email], function(error, rows, fields){
			
			if(error)
				console.log('Erro:'+error);
			else if(rows != null)
				objRetorno = {'list':rows};
				
			res.json(objRetorno);
		});
	}
	catch(e){
		// erro na conexão ou query mysql
		res.statusCode = 400;
		return res.json({status: "Conexão falhou." + e});
	}
});

//lista os cartoes por cliente
app.get('/api/card/client/:id', jsonParser, function(req, res){
	objRetorno = [];
	try{
		connection.query(query_cartoes_cliente, [req.params.id], function(error, rows, fields){
			
			if(error)
				console.log('Erro:'+error);
			else if(rows != null)
				objRetorno = {'list':rows};
				
			res.json(objRetorno);
		});
	}
	catch(e){
		// erro na conexão ou query mysql
		res.statusCode = 400;
		return res.json({status: "Conexão falhou." + e});
	}
});

app.get('/api/categories', jsonParser, function(req, res){
	
	//objeto de retorno
	retorno = [];
	
	try {
		
		//MySQL
		connection.query(query_categorias, function (error, rows, fields) {
			if (error) {
				console.log('Erro:' + error);
			}
			else if (rows != null) {
				retorno = {"list":rows};
			}

			res.json(retorno);
		});

	}
	catch(e){
		// erro na conexão ou query mysql
		res.statusCode = 400;
		return res.json({status: "Conexão falhou." + e});
	}
});

app.get('/api/products/details/:id', jsonParser, function(req, res){
	
	//objeto de retorno
	retorno = [];
	
	try {
		
		
		//MySQL
		connection.query(query_detalhes_produto_by_id, [req.params.id], function (error, rows, fields) {
			if (error) {
				console.log('Erro:' + error);
			}
			else if (rows != null) {
				retorno = rows[0];
			}
			res.json(retorno);
		});
	}
	catch(e){
		// erro na conexão ou query mysql
		res.statusCode = 400;
		return res.json({status: "Conexão falhou." + e});
	}
});

app.get('/api/products/:id_category*?', jsonParser, function(req, res){


	try {

		//parametro opcional
		var id_category = req.params.id_category; 

		//objeto de retorno
		retorno = [];

		 var condicao = '';
		 var limite = ' limit 9;'

		if (id_category != undefined){
			condicao = ' WHERE pro_cat_cod = ' + req.params.id_category;
			limite = ';';
		}

		var query = query_lista_produtos + condicao + limite;

		//console.log(query);

		// MySQL
		connection.query(query, function (error, rows, fields) {

			if (error) {
				console.log('Erro:' + error);
			}
			else if (rows != null) {
				retorno = {"list":rows,
					"totalPages": 1,
					"currentPage": 1
				};
			}

			res.json(retorno);
		});
		// MySQL

	}
	catch(e){
		console.log(e);
		// erro na conexão ou query mysql
		res.statusCode = 400;
		res.json({status: "Conexão falhou." + e});
	}
});

app.post('/api/user/login', jsonParser, function(req, res){
	
	if(!req.body.hasOwnProperty('login') || 
	   !req.body.hasOwnProperty('password')) {
	
		res.statusCode = 400;
		return res.json({status: 'Error 400: use of login with bad data.'});
	}

	var params_login = {
		login: req.body.login,
		password: req.body.password
	};

	//chama a API root para obter o token da transação
	requestify.post('http://orion2412.startdedicated.net:8899/api/user/login', params_login)
	.then(function(response) {

		var body = response.getBody();
		res.send(body);

	}, function(response) {

        console.log(response);
        res.statusCode = response.code;

        res.send(response.body);
	});
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

//var TimeUuid = require('cassandra-driver').types.TimeUuid;
app.post('/api/transaction/buy', jsonParser, function(req, res){

	if (!req.body.hasOwnProperty('token')|| 
	   !req.body.hasOwnProperty('cod_cliente')|| 
	   !req.body.hasOwnProperty('creditcardNumber')||
	   !req.body.hasOwnProperty('cod_credit_card')||
	   !req.body.hasOwnProperty('products')|| 
	   !req.body.hasOwnProperty('value')|| 
	   !req.body.hasOwnProperty('geo') ||
	   !req.body.hasOwnProperty('segment')) {

		res.statusCode = 400;
		return res.json({status: 'Error 400', message: 'Use of buy with bad data (missing properties)'});
	}

	try {

		var parametros_cassandra = { 
	        token: req.body.token,
	        date: moment().format(),
			creditcardNumber: req.body.creditcardNumber,
			value: req.body.value,
			geo: req.body.geo,
			segment: req.body.segment
		};

		//chama a API root para obter o token da transação
		requestify.post('http://orion2412.startdedicated.net:8899/api/transaction/buy', parametros_cassandra)
		.then(function(response) {

			var body = response.getBody();

			var status = body.status;
			var token_transaction = body.transactionid;

			if (body.status == 'error' || body.status == 'Buy with bad token'){
				res.statusCode = 400;
				res.json({status: body.status});

			} else { // status: ok ou denied
				//codigo mysql tabela status [3: fraude, 1: aguardando pagamento]
				var cod_status = (body.status === 'denied' ? 3 : 1);

				// atualização no mysql
				var params_mysql = {
					cod_cli: req.body.cod_cliente,
					data_venda: moment().format("YYYY-MM-DD HH:mm:SS"),
					cod_tipo_venda: 1, // à vista (estático)
					cod_cartao: req.body.cod_credit_card, // dado view
					cod_transacao: body.transactionid, //api buy cassandra
					cod_status_venda: cod_status, //api buy cassandra
					cod_credit_card: req.body.cod_credit_card, //dado view
					products: req.body.products // dado view
				};

				inserir_venda(params_mysql, function(data){

					if (data.error != null){
						res.statusCode = 400;
						res.json({status_venda: "n_ok", msg: data.error, status_tran: body.status, transactionid: body.transactionid});
					} else {
						res.json({status_venda: 'ok', status_tran: body.status, transactionid: body.transactionid });
					}
					
				});
			}
		},function(response) {

            console.log(response);
            
            res.statusCode = response.code;
            res.json({status: response.body});
		});

	}
	catch(e){
		console.log(e);
		res.statusCode = 400;
		res.json({status: "Conexão falhou. " + e});
	}
});

app.post('/api/transaction/buy/confirm', jsonParser, function(req, res){
	
	if(!req.body.hasOwnProperty('transaction_id') || 
	   !req.body.hasOwnProperty('status')) {

		res.statusCode = 400;
		return res.json({status: 'Error 400', message: 'Use of buy with bad data (missing properties).', parametros: req.body});
	}

	var status = (req.body.status == 'ok' ? 2 : 4);
	var query  = util.format("UPDATE venda SET ven_sta_cod = %d WHERE ven_tra_cod = '%s'", status, req.body.transaction_id);

	// MySQL
	connection.query(query, function (error, result) {

		if (error != null){
			res.statusCode = 400;
			res.json({status: "n_ok", msg: data.error});
		} else {

			if (result.affectedRows > 0){
				res.json({status: 'ok'});	
			} else{
				res.json({status: 'n_ok'});	
			}
		}
	});
	
});
//Finalização da venda

//Integração time03
app.get('/api/adtf/:category/:queryId', jsonParser, function(req, res){
	
	var category = req.params.category;
	var queryId = req.params.queryId;

	//validação do parametro
	if (category == 'undefined') {
		res.json({
			status: 'Categoria inválida'
		});
		return;
	}
	if (queryId == 'undefined') {
		res.json({
			status: 'Identificador nao encontrado'
		});
		return;
	}
    
    retorno = { };
    
    try {
        
		var parametros = { 
	        "queryId": queryId
		};
        
        console.log(category);
        console.log(parametros);
		
		var options = {
			timeout: 1200000
		}

		//httprequest mode: post
		requestify.post(MAIN_API + category, parametros, options)
		.then(function(response) {

			console.log("Success");
            console.log(response);
            
			var body = response.getBody();
			res.json(body);

		}, function(response) {

            console.log("Erro");
            console.log(response);
			
			res.statusCode = 400;
			
			if (response.hasOwnProperty('body'))
				return res.json({status: "Requisição falhou. Detalhes: " + response.body});
			else
				return res.json({status: "Requisição falhou. Detalhes: " + response});

		});
    
	}
	catch(e){
        
		res.statusCode = 400;
		return res.json({status: "Requisição falhou." + e});
        
	}
});
//Integração time03

function inserir_venda(params, callback){

	/*
	Parametros:
	cod_cli: codigo do cliente
	cod_tipo_venda: codigo do tipo da venda
	cod_cartao: codigo do cartão de crédito
	cod_transacao: codigo da transação enviado pelo endpoint buy
	cod_status_venda: codigo do status da venda
	*/

	try {

		//console.log(params);

		var post = {
			ven_cli_cod: params.cod_cli, 
			ven_dt: params.data_venda, 
			ven_tip_cod: params.cod_tipo_venda, 
			ven_car_cod: params.cod_cartao,
			ven_tra_cod: params.cod_transacao, 
			ven_sta_cod: params.cod_status_venda
		}

		var query = "INSERT INTO venda set ?";

		// MySQL
		connection.query(query, post, function (error, result) {

			if (error != null){
				callback(error);
				return;

			} else {

				if (params.products.length > 0){

					var parametros_vendaprodutos = {
						cod_venda: result.insertId,
						products: params.products
					};

					inserir_vendaprodutos(parametros_vendaprodutos, function(data){
						
						callback({
							error: data.error, 
							result: data.result
						});

					});

				} else {

					callback({
						error: data.error, 
						result: data.result
					});
				}
			}

		});
		// MySQL

	}
	catch(e){
		console.log(e);
		callback({status: "Conexão falhou." + e});
	}
}

function inserir_vendaprodutos(data, callback){
	

	try {

		var insert = 'INSERT INTO vendaproduto (vpr_ven_cod, vpr_pro_cod, vpr_vl, vpr_qt) VALUES ';
		var values = '';

		for	(index = 0; index < data.products.length; index++) {
			var product = data.products[index];
		    values += util.format("(%d,%d,%d,%d),",data.cod_venda, product.cod, product.value, product.qtd);
		}

		var query = util.format("%s %s;", insert, values.substring(0,values.length-1));

		//console.log(query);

		// MySQL
		connection.query(query, function (error, result) {

			callback({
				error: error, 
				result: result
			});
		});
		// MySQL

	}
	catch(e){
		console.log(e);
		callback({status: "Conexão falhou." + e});
	}
}

app.listen(process.env.PORT || 8898, '0.0.0.0');
console.log("Running API portal");
console.log("Access http://localhost:8898");

