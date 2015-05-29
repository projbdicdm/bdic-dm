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
 
//adicionando o driver npm install Node JDBC
var jdbc = new ( require('jdbc') );

var config = {
  libpath: '/usr/local/hive/lib/hive-jdbc-1.1.0-standalone.jar',
  libs: ['/usr/local/hadoop/common/hadoop-common-2.6.0.jar', '/usr/local/hadoop/share/hadoop/common/hadoop-common-2.6.0.jar'],
  drivername: 'org.apache.hive.jdbc.HiveDriver',
  url: 'jdbc:hive2://localhost:10000/projeto?connectTimeout=60000&socketTimeout=60000',
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
