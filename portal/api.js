//criamos o obj que renderiza HTML na saida
var jade = require('jade');

//criamos uma sintancia do Express
var express = require('express');

//criamos a instancia do App
var app = express();

//criamos a instancia do conector ao mysql
var mysql = require("mysql");

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

// redireciona acesso aos arquivos para a pasta 'site'
app.use("/", express.static(__dirname + '/site'));


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
                        return res.json({token:id, userType:result.rows[0].usr_type, userName:result.rows[0].usr_name});
                    }
                });
                //retorna o token
            }else{
                return res.json({token:result.rows[0].usr_token, userType:result.rows[0].usr_type, userName:result.rows[0].usr_name});
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

app.post('/api/transaction/buy', jsonParser, function(req, res){
 	if(!req.body.hasOwnProperty('token')) {
	
		res.statusCode = 400;
		//return res.send('Error 400: use of register with bad data.');
		return res.send(req.body.hasOwnProperty('token'));
	} 
	
	return res.json({status: "ok"});
});

app.get('/api/products', jsonParser, function(req, res){

	//objeto de retorno
	retorno = [];

	try {

	}
	catch(e){
		// erro na conexão ou query mysql
		res.statusCode = 400;
		return res.json({status: "Conexão falhou." + e});
	}
});

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
	retorno = [];

	try {
		
		switch(queryId) {
			case "01":
				retorno.push({
					trans_cli_id : 1, 
					cli_firstname : 'Pedro', 
					cli_lastname : 'Santos', 
					cnt : 1000
				});
                retorno.push({
					trans_cli_id : 2, 
					cli_firstname : 'João', 
					cli_lastname : 'Silva', 
					cnt : 500
				});
                retorno.push({
					trans_cli_id : 3, 
					cli_firstname : 'Maria', 
					cli_lastname : 'Almeida', 
					cnt : 800
				});
				break;
			case "02":
				retorno.push({
					trans_cli_id : 1, 
					trans_value : 1000
				});
                retorno.push({
					trans_cli_id : 2, 
					trans_value : 800
				});
				break;
			case "03":
				retorno.push({
					cli_firstname : 'Pedro', 
					cli_lastname : 'Santos', 
					dados_transacao : []
				});
				break;
			case "04":
				retorno.push({
					cli_firstname : 'Pedro', 
					cli_lastname : 'Santos', 
					trans_date : '',
					trans_value : '',
					trans_loc_id : 1
				});
                retorno.push({
					cli_firstname : 'João', 
					cli_lastname : 'Silva', 
					trans_date : '',
					trans_value : '',
					trans_loc_id : 2
				});
				break;
			case "05":
				retorno.push({
					cli_firstname : 'Pedro',
					cli_lastname : 'Santos',
					trans_date : '',
					trans_value: 1000
				});
				break;
			case "06":
				retorno.push({
					cli_firstname : 'Pedro',
					cli_lastname : 'Santos',
					trans_date : '',
					trans_value : '',
					trans_loc_id : 1
				});
				break;
			case "07":
				retorno.push({
					cli_firstname : 'Pedro',
					cli_lastname : 'Santos',
					trans_date : '', 
					trans_loc_id : 1, 
					loc_city : 'Campinas', 
					loc_region : 'SP', 
					loc_country : 'Brasil',
					trans_value : 1000
				});
				break;
			case "08":
				retorno.push({
					trans_cli_id : 1, 
					cli_firstname : 'Pedro', 
					cli_lastname : 'Santos', 
					loc_city : 'Campinas', 
					loc_country : 'Brasil',
					trans_total : 2000
				});
				break;
			case "09":
				retorno.push({
					trans_cli_id : 1, 
					cli_firstname : 'Pedro', 
					cli_lastname : 'Santos', 
					loc_city : 'Campinas', 
					loc_country : 'Brasil',
					trans_total : 3000
				});
				break;
			case "10":
				retorno.push({
					trans_cli_id : 1, 
					cli_firstname : 'Pedro', 
					cli_lastname : 'Santos', 
					month: 5, 
					total_month : 1000
				});
				break;
			case "11":
				retorno.push({
					trans_loc_id : 1, 
					loc_country : 'Brasil', 
					month: 5, 
					total_month : 3000
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

	//objeto de retorno
	retorno = [];

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
	retorno = [];

	try {
		
		switch(queryId) {
			case "01":
				retorno.push({
					prd_name : 'Produto 1' , 
					count : 1000
				});
                retorno.push({
					prd_name : 'Produto 2' , 
					count : 500
				});
                retorno.push({
					prd_name : 'Produto 3' , 
					count : 750
				});
                retorno.push({
					prd_name : 'Produto 4' , 
					count : 1200
				});
				break;
			case "02":
				retorno.push({
					prd_name : 'Produto 1', 
					sales_total : 10000
				});
				break;
			case "03":
				retorno.push({
					prd_name : 'Produto 1', 
					count: 4000
				});
				break;
			case "04":
				retorno.push({
					prd_category_id : 1, 
					cat_name : 'Informática', 
					count : 1000
				});
				break;
			case "05":
				retorno.push({
					prd_name : 'Produto 1', 
					sales_total : 5000
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
	retorno = [];

	try {
		
		switch(queryId) {
			case "01":
				retorno.push({
					cli_id : 1, 
					cat_name : 'Informática', 
					cli_lastname : 'Pereira', 
					total_sale: 1000
				});
                retorno.push({
					cli_id : 2, 
					cat_name : 'House', 
					cli_lastname : 'Computadores', 
					total_sale: 2300
				});
                retorno.push({
					cli_id : 3, 
					cat_name : 'Magazine', 
					cli_lastname : 'da Informática', 
					total_sale: 1125
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

app.listen(process.env.PORT || 8898, '0.0.0.0');
console.log("Running API portal");
console.log("Access http://localhost:8898");

