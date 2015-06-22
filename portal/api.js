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

//adicionando o driver cassandra
var cassandra = require('cassandra-driver');
var client = new cassandra.Client({ contactPoints: ['orion2412.startdedicated.net'], keyspace: 'BDICDM'}); //Cassandra no servidor do André Lamas

// querys cassandra
var query_login = 'SELECT * FROM "USER" WHERE "usr_login" = ? ';
var query_login_by_token = 'SELECT "usr_login" FROM "USER" WHERE "usr_token" = ?';
var query_update_token = 'UPDATE "USER" SET "usr_token" = ? WHERE "usr_login" = ?';
var Uuid = require('cassandra-driver').types.Uuid;

// querys mysql
var query_categorias = 'SELECT cat_id, cat_nm FROM categoria;'
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
	

	/*
		//codigo para realizar chamada na api principal TODO
		var options = {
		  host: 'endereco_api_principal',
		  path: '/rotas/?parametros='
		};

		http.request(options, function(response) {
			var str = '';

			
			response.on('data', function (chunk) {
				str += chunk;
			});

			
			response.on('end', function () {
				console.log(str);
			});
		}).end();
		*/

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
				client.execute(query_update_token, [id, req.body.login], {prepare: true}, function(err, result_update) {
					if(err){
						res.statusCode = 500;
						return res.json({status: "Erro no query_update_token" + err});
					}else{
						return res.json({token:id, userType:result.rows[0].usr_type, userName:result.rows[0].usr_name, userEmail: result.rows[0].usr_login});
					}
				});
				//retorna o token
			}else{
				return res.json({token:result.rows[0].usr_token, userType:result.rows[0].usr_type, userName:result.rows[0].usr_name, userEmail: result.rows[0].usr_login});
			}
		}else{
			res.statusCode = 400;
			return res.json({status: "Auth failed"});
		}
	}
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


app.post('/api/transaction/buy_test', jsonParser, function(req, res){
	res.json({status:'ok', body:req.body});
});

app.post('/api/transaction/buy', jsonParser, function(req, res){
	
	if(!req.body.hasOwnProperty('token')|| 
	   !req.body.hasOwnProperty('cod_cliente')|| 
	   !req.body.hasOwnProperty('creditcardNumber')||
	   !req.body.hasOwnProperty('cod_credit_card')||
	   !req.body.hasOwnProperty('products')|| 
	   !req.body.hasOwnProperty('value')|| 
	   !req.body.hasOwnProperty('geo') ||
	   !req.body.hasOwnProperty('segment')) {

		res.statusCode = 400;
		return res.json({status: 'Error 400', message: 'Use of buy with bad data (missing properties).', parametros: req.body});
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

		//httprequest mode: post
		requestify.request('http://orion2412.startdedicated.net:8899/api/transaction/buy', {
		    method: 'POST',
		    body: parametros_cassandra,
		    dataType: 'json',
		    headers: {
		        'Content-Type': 'application/json'
		    }
		 })
		.then(function(response) {

			var body = response.getBody();

			console.log(body);

			var status = body.status;
			var token_transaction = body.transID;


			if (body.status == 'error'){
				res.statusCode = 400;
				res.json({status: body.status});

			} else { // status: ok ou denied
				//codigo mysql tabela status [3: fraude, 1: aguardando pagamento]
				var cod_status = (body.status == 'denied' ? 3: 1);

				// atualização no mysql
				var params_mysql = {
					cod_cli: req.body.cod_cliente,
					data_venda: moment().format("YYYY-MM-DD HH:mm:SS"),
					cod_tipo_venda: 1, // à vista (estático)
					cod_cartao: req.body.cod_credit_card, // dado view
					cod_transacao: req.body.token, //api buy cassandra
					cod_status_venda: cod_status, //api buy cassandra
					cod_credit_card: req.body.cod_credit_card, //dado view
					products: req.body.products // dado view
				};

				inserir_venda(params_mysql, function(data){

					if (data.error != null){
						res.statusCode = 400;
						res.json({status: "n_ok", msg: data.error});
					} else {
						res.json({status: 'ok'});
					}
					
				});
			}
		});

	}
	catch(e){
		console.log(e);
		res.statusCode = 400;
		res.json({status: "Conexão falhou. " + e});
	}
});

app.post('/api/transaction/buy/confirm', jsonParser, function(req, res){
	
	if(!req.body.hasOwnProperty('token') || 
	   !req.body.hasOwnProperty('status')) {

		res.statusCode = 400;
		return res.json({status: 'Error 400', message: 'Use of buy with bad data (missing properties).', parametros: req.body});
	}

	var status = (req.body.status == 'ok' ? 2 : 4);
	var query  = util.format("UPDATE venda SET ven_sta_cod = %d WHERE ven_tra_cod = '%s'", status, req.body.token);

	// MySQL
	connection.query(query, function (error, result) {

		if (error != null){
			res.statusCode = 400;
			res.json({status: "n_ok", msg: data.error});
		} else {
			res.json({status: 'ok'});
		}
	});
	
});
//Finalização da venda

//Integração time03
app.get('/api/adtf/custntrans/:queryId', jsonParser, function(req, res){


	var queryId = req.params.queryId;

	//validação do parametro
	if (queryId == 'undefined'){
		res.json({
			status: 'Identificador nao encontrado'
		});
		return;
	}

	//objeto de retorno
	retorno = { titulo: 'Clientes ou Transações', dados: [] };

	try {
		
		switch(queryId) {
			case "01":
				retorno.subtitulo = '01 - Classificar clientes que mais compraram em ordem decrescente';
				retorno.descricao = '[ Descrição detalhada aqui ]';
				retorno.dados.push({
					"ID da Transação" : 1, 
					"Nome" : 'Pedro', 
					"Sobrenome" : 'Santos', 
					"Contagem" : 1000
				});
				retorno.dados.push({
					"ID da Transação" : 2, 
					"Nome" : 'João', 
					"Sobrenome" : 'Silva', 
					"Contagem" : 500
				});
				retorno.dados.push({
					"ID da Transação" : 3, 
					"Nome" : 'Maria', 
					"Sobrenome" : 'Almeida', 
					"Contagem" : 800
				});
				break;
			case "02":
				retorno.subtitulo = '02 - Classificar, em ordem decrescente, os clientes por valor das transacoes';
				retorno.descricao = '[ Descrição detalhada aqui ]';
				retorno.dados.push({
					"ID da Transação" : 1, 
					"Valor da Transação" : 1000
				});
				retorno.dados.push({
					"ID da Transação" : 2, 
					"Valor da Transação" : 800
				});
				break;
			case "03":
				retorno.subtitulo = '03 - Selecionar todos os campos de Transacoes e nome do cliente';
				retorno.descricao = '[ Descrição detalhada aqui ]';
				retorno.dados.push({
					"Nome" : 'Pedro', 
					"Sobrenome" : 'Santos', 
					"Dados da Transação" : []
				});
				break;
			case "04":
				retorno.subtitulo = '04 - Ordenar as transacoes em ordem decrescente por valor';
				retorno.descricao = '[ Descrição detalhada aqui ]';
				retorno.dados.push({
					"Nome" : 'Pedro', 
					"Sobrenome" : 'Santos', 
					"Data da Transação" : '',
					"Valor da Transação" : '',
					"ID da Transação" : 1
				});
				retorno.dados.push({
					"Nome" : 'João', 
					"Sobrenome" : 'Silva', 
					"Data da Transação" : '',
					"Valor da Transação" : '',
					"ID da Transação" : 2
				});
				break;
			case "05":
				retorno.subtitulo = '05 - Ordenar todos os clientes que realizaram compras por ordem alfabetica';
				retorno.descricao = '[ Descrição detalhada aqui ]';
				retorno.dados.push({
					"Nome" : 'Pedro',
					"Sobrenome" : 'Santos',
					"Data da Transação" : '',
					"Valor da Transação": 1000
				});
				break;
			case "06":
				retorno.subtitulo = '06 - Classificar as transacoes por data (decrescente), exibindo tambem o nome do cliente e valor';
				retorno.descricao = '[ Descrição detalhada aqui ]';
				retorno.dados.push({
					"Nome" : 'Pedro',
					"Sobrenome" : 'Santos',
					"Data da Transação" : '',
					"Valor da Transação" : '',
					"ID da Transação" : 1
				});
				break;
			case "07":
				retorno.subtitulo = '07 - Classificar transacoes por local em ordem alfabetica, exibindo campos como nome, valor, regiao, pais, etc';
				retorno.descricao = '[ Descrição detalhada aqui ]';
				retorno.dados.push({
					"Nome" : 'Pedro',
					"Sobrenome" : 'Santos',
					"Data da Transação" : '', 
					"ID da Transação" : 1, 
					"Cidade" : 'Campinas', 
					"Região" : 'SP', 
					"País" : 'Brasil',
					"Valor da Transação" : 1000
				});
				break;
			case "08":
				retorno.subtitulo = '08 - Classificar transacoes por data (crescente) a cada 7 dias, exibindo o nome do cliente, local e valor';
				retorno.descricao = '[ Descrição detalhada aqui ]';
				retorno.dados.push({
					"ID da Transação" : 1, 
					"Nome" : 'Pedro', 
					"Sobrenome" : 'Santos', 
					"Cidade" : 'Campinas', 
					"País" : 'Brasil',
					"Valor" : 2000
				});
				break;
			case "09":
				retorno.subtitulo = '09 - Classificar transacoes por data (crescente) a cada 30 dias, exibindo o nome do cliente, local (IP) e valor';
				retorno.descricao = '[ Descrição detalhada aqui ]';
				retorno.dados.push({
					"ID da Transação" : 1, 
					"Nome" : 'Pedro', 
					"Sobrenome" : 'Santos', 
					"Cidade" : 'Campinas', 
					"País" : 'Brasil',
					"Valor" : 3000
				});
				break;
			case "10":
				retorno.subtitulo = '10 - Classificar clientes por quantidade de transações mensais no último ano em ordem decrescente';
				retorno.descricao = '[ Descrição detalhada aqui ]';
				retorno.dados.push({
					"ID da Transação" : 1, 
					"Nome" : 'Pedro', 
					"Sobrenome" : 'Santos', 
					"Mês": 5, 
					"Total do Mês" : 1000
				});
				break;
			case "11":
				retorno.subtitulo = '11 - Classificar a quantidade de transações por país no último ano, agrupadas em meses';
				retorno.descricao = '[ Descrição detalhada aqui ]';
				retorno.dados.push({
					"ID da Transação" : 1, 
					"País" : 'Brasil', 
					"Mês": 5, 
					"Total do Mês" : 3000
				});
				break;
			default:
				break;
		}

		res.json(retorno);


		/*
		//codigo para realizar chamada na api principal TODO
		var options = {
		  host: 'endereco_api_principal',
		  path: '/rotas/?parametros='
		};

		http.request(options, function(response) {
			var str = '';

			
			response.on('data', function (chunk) {
				str += chunk;
			});

			
			response.on('end', function () {
				console.log(str);
			});
		}).end();
		*/

	}
	catch(e){
		// erro na conexão ou query mysql
		res.statusCode = 400;
		return res.json({status: "Conexão falhou." + e});
	}
});

app.get('/api/adtf/prodncate/:queryId', jsonParser, function(req, res){


	var queryId = req.body.queryId;

	try {
		var queryId = req.params.queryId;

	//validação do parametro
	if (queryId == 'undefined'){
		res.json({
			status: 'Identificador nao encontrado'
		});
		return;
	}

	//objeto de retorno
	retorno = { titulo: 'Produtos ou Categorias', dados: [] };

	try {
		
		switch(queryId) {
			case "01":
				retorno.subtitulo = '01 - Classificar os produtos mais vendidos no último ano por quantidade';
				retorno.descricao = '[ Descrição detalhada aqui ]';
				retorno.dados.push({
					"Nome do Produto" : 'Produto 1' , 
					"Quantidade" : 1000
				});
				retorno.dados.push({
					"Nome do Produto" : 'Produto 2' , 
					"Quantidade" : 500
				});
				retorno.dados.push({
					"Nome do Produto" : 'Produto 3' , 
					"Quantidade" : 750
				});
				retorno.dados.push({
					"Nome do Produto" : 'Produto 4' , 
					"Quantidade" : 1200
				});
				break;
			case "02":
				retorno.subtitulo = '02 - Classificar os total de vendas por produto no último ano';
				retorno.descricao = '[ Descrição detalhada aqui ]';
				retorno.dados.push({
					"Nome do Produto" : 'Produto 1', 
					"Total por Vendas" : 10000
				});
				break;
			case "03":
				retorno.subtitulo = '03 - Classificar os produtos mais vendidos nos últimos 7 dias';
				retorno.descricao = '[ Descrição detalhada aqui ]';
				retorno.dados.push({
					"Nome do Produto" : 'Produto 1', 
					"Quantidade": 4000
				});
				break;
			case "04":
				retorno.subtitulo = '04 - Classificar as categorias mais vendidas nos últimos 365 dias';
				retorno.descricao = '[ Descrição detalhada aqui ]';
				retorno.dados.push({
					"ID da Categoria" : 1, 
					"Nome da Categoria" : 'Informática', 
					"Quantidade" : 1000
				});
				break;
			case "05":
				retorno.subtitulo = '05 - Classificar os produtos mais vendidos nos em um intervalo com data inicial e data final';
				retorno.descricao = '[ Descrição detalhada aqui ]';
				retorno.dados.push({
					"Nome do Produto" : 'Produto 1', 
					"Total por Vendas" : 5000
				});
				break;
			case "06":
				retorno.subtitulo = '06 - Total de venda por produtos em dias específicos da semana';
				retorno.descricao = '[ Descrição detalhada aqui ]';
				retorno.dados.push({
					"Nome do Produto" : 'Produto 1', 
					"Total por Vendas" : 5000
				});
				break;
			case "07":
				retorno.subtitulo = '07 - Total de venda por produtos e categorias em dias específicos';
				retorno.descricao = '[ Descrição detalhada aqui ]';
				retorno.dados.push({
					"Nome do Produto" : 'Produto 1', 
					"Total por Vendas" : 5000
				});
				break;
			default:
				break;
		}

		res.json(retorno);


		/*
		//codigo para realizar chamada na api principal TODO
		var options = {
		  host: 'endereco_api_principal',
		  path: '/rotas/?parametros='
		};

		http.request(options, function(response) {
			var str = '';

			
			response.on('data', function (chunk) {
				str += chunk;
			});

			
			response.on('end', function () {
				console.log(str);
			});
		}).end();
		*/

	}
	catch(e){
		// erro na conexão ou query mysql
		res.statusCode = 400;
		return res.json({status: "Conexão falhou." + e});
	}
	}
	catch(e){
		// erro na conexão ou query mysql
		res.statusCode = 400;
		return res.json({status: "Conexão falhou." + e});
	}
});

app.get('/api/adtf/clinprod/:queryId', jsonParser, function(req, res){
	
	var queryId = req.params.queryId;

	//validação do parametro
	if (queryId == 'undefined') {
		res.json({
			status: 'Identificador nao encontrado'
		});
		return;
	}

	//objeto de retorno
	retorno = { titulo: 'Clientes e produtos', dados: [] };

	try {
		
		switch(queryId) {
			case "01":
				retorno.subtitulo = '01 - Classifica os clientes por grupo de tipo de compra agrupando por categoria';
				retorno.descricao = '[ Descrição detalhada aqui ]';
				retorno.dados.push({
					"ID" : 1, 
					"Nome da Categoria" : 'Informática', 
					"Sobrenome" : 'Pereira', 
					"Total da Venda": 1000
				});
				retorno.dados.push({
					"ID" : 2, 
					"Nome da Categoria" : 'House', 
					"Sobrenome" : 'Computadores', 
					"Total da Venda": 2300
				});
				retorno.dados.push({
					"ID" : 3, 
					"Nome da Categoria" : 'Magazine', 
					"Sobrenome" : 'da Informática', 
					"Total da Venda": 1125
				});
				break;
			default:
				break;
		}

		res.json(retorno);

		/*
		//codigo para realizar chamada na api principal TODO
		var options = {
		  host: 'endereco_api_principal',
		  path: '/rotas/?parametros='
		};

		http.request(options, function(response) {
			var str = '';

			
			response.on('data', function (chunk) {
				str += chunk;
			});

			
			response.on('end', function () {
				console.log(str);
			});
		}).end();
		*/
	}
	catch(e){
		// erro na conexão ou query mysql
		res.statusCode = 400;
		return res.json({status: "Conexão falhou." + e});
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

