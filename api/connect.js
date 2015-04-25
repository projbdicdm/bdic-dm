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

app.post('/api/custntrans', jsonParser, function(req, res){
// Query Definition
var hiveQueryId = req.body.queryId; 
var definedQuery = "";
var hiveQueryID01 = "SELECT trans_cli_id, clients.cli_firstname, clients.cli_lastname, COUNT(trans_cli_id) as cnt FROM transactions JOIN clients ON (trans_cli_id = cli_id) GROUP BY cli_firstname, cli_lastname, trans_cli_id ORDER BY cnt DESC LIMIT 250;";
var hiveQueryID02 = "SELECT cli_id,trans_value FROM transactions ORDER BY trans_value DESC;";
var hiveQueryID03 = "SELECT clients.cli_firstname,clients.cli_lastname,transactions.* FROM transactions JOIN clients ON (trans_cli_id = cli_id);";
var hiveQueryID04 = "SELECT clients.cli_firstname,clients.cli_lastname,transactions.trans_date,transactions.trans_value,transactions.trans_loc_id FROM transactions JOIN clients ON (trans_cli_id = cli_id) ORDER BY trans_value DESC LIMIT 250;";
var hiveQueryID05 = "SELECT clients.cli_firstname,clients.cli_lastname,transactions.trans_date,transactions.trans_value FROM transactions JOIN clients ON (trans_cli_id = cli_id) ORDER BY clients.cli_firstname;";
var hiveQueryID06 = "SELECT clients.cli_firstname,clients.cli_lastname,transactions.trans_date,transactions.trans_value,transactions.trans_loc_id FROM transactions JOIN clients ON (trans_cli_id = cli_id) ORDER BY trans_date DESC LIMIT 250;";
var hiveQueryID07 = "SELECT clients.cli_firstname, clients.cli_lastname, transactions.trans_date, transactions.trans_value, transactions.trans_loc_id, locations.loc_city, locations.loc_region, locations.loc_country FROM transactions JOIN clients ON (trans_cli_id = cli_id) JOIN locations ON (trans_loc_id = loc_id) ORDER BY locations.loc_city LIMIT 250;";
var hiveQueryID08 = "SELECT transactions.trans_cli_id, clients.cli_firstname, cli_lastname, locations.loc_city, loc_country, SUM(transactions.trans_value) as trans_total FROM transactions JOIN clients ON (trans_cli_id = cli_id) JOIN locations ON (cli_loc_id = loc_id AND trans_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()), 7)) GROUP BY cli_firstname, cli_lastname, trans_cli_id, loc_city , loc_country, trans_date ORDER BY trans_total LIMIT 250;";
var hiveQueryID09 = "SELECT transactions.trans_cli_id, clients.cli_firstname, cli_lastname, locations.loc_city, loc_country, SUM(transactions.trans_value) as trans_total FROM transactions JOIN clients ON (trans_cli_id = cli_id) JOIN locations ON (cli_loc_id = loc_id AND trans_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()), 30)) GROUP BY cli_firstname, cli_lastname, trans_cli_id, loc_city , loc_country, trans_date ORDER BY trans_total LIMIT 250;";
var hiveQueryID10 = "SELECT transactions.trans_cli_id, clients.cli_firstname, cli_lastname, MONTH(trans_date), COUNT(MONTH(trans_date)) as month FROM transactions JOIN clients ON (trans_cli_id = cli_id AND trans_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()),365)) GROUP BY cli_firstname, cli_lastname, trans_cli_id, MONTH(trans_date) LIMIT 250;";
var hiveQueryID11 = "SELECT trans_loc_id, locations.loc_country, MONTH(trans_date), COUNT(MONTH(trans_date)) as month FROM transactions JOIN locations ON (trans_loc_id = loc_id AND trans_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()),365)) GROUP BY trans_loc_id, loc_country, MONTH(trans_date) LIMIT 250;";

switch(hiveQueryId) {
case "01":
        definedQuery = hiveQueryID01;
        break;
case "02":
        definedQuery = hiveQueryID02;
        break;
case "03":
        definedQuery = hiveQueryID03;
        break;
case "04":
        definedQuery = hiveQueryID04;
        break;
case "05":
        definedQuery = hiveQueryID05;
        break;
case "06":
        definedQuery = hiveQueryID06;
        break;
case "07":
        definedQuery = hiveQueryID07;
        break;
case "08":
        definedQuery = hiveQueryID08;
        break;
case "09":
        definedQuery = hiveQueryID09;
        break;
case "10":
        definedQuery = hiveQueryID10;
        break;
case "11":
        definedQuery = hiveQueryID11;
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
            jdbc.executeQuery(definedQuery,genericQueryHandler);
        }
     });
  }
});	    

	var letra = 'ok';		
	return res.json({Value: testeIdiota[1]});
});

app.get('/api/prodncate', jsonParser, function(req, res){
// Query Definition
var definedQuery = "";
var hiveQueryID01 = "SELECT products.prd_name , COUNT(sales.sale_prod_id) as count FROM products JOIN sales ON (sale_prod_id = prd_id AND sale_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()),365)) GROUP BY prd_name ORDER BY count DESC LIMIT 250;";							
var hiveQueryID02 = "SELECT products.prd_name , SUM(sales.sale_value) as sales_total FROM products JOIN sales ON (sale_prod_id = prd_id AND sale_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()),365)) GROUP BY prd_name ORDER BY sales_total DESC LIMIT 250;";
var hiveQueryID03 = "SELECT products.prd_name , COUNT(sales.sale_prod_id) as count FROM products JOIN sales ON (sale_prod_id = prd_id AND sale_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()),7)) GROUP BY prd_name ORDER BY count DESC LIMIT 250;";			
var hiveQueryID04 = "SELECT  prd_category_id, cat_name, COUNT(sales.sale_prod_id) as count FROM products JOIN sales ON (sale_prod_id = prd_id AND sale_date > DATE_SUB(FROM_UNIXTIME(unix_timestamp()),365)) JOIN categories ON (prd_category_id = cat_id) GROUP BY prd_category_id, cat_name ORDER BY count DESC;";
var hiveQueryID05 = "SELECT products.prd_name , SUM(sales.sale_value) as sales_total FROM products JOIN sales ON (sale_prod_id = prd_id AND sale_date < 2015-04-04 AND sale_date > 2012-01-01) GROUP BY prd_name ORDER BY sales_total DESC LIMIT 250;";

switch(req.body.hasOwnProperty('QueryID')) {
case 01:
        definedQuery = hiveQueryID01;
        break;
case 02:
        definedQuery = hiveQueryID02;
        break;
case 03:
        definedQuery = hiveQueryID03;
        break;
case 04:
        definedQuery = hiveQueryID04;
        break;
case 05:
        definedQuery = hiveQueryID05;
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
            jdbc.executeQuery(definedQuery,genericQueryHandler);
        }
     });
  }
});
return res.json({Value: "1"});
});

app.post('/api/hive', jsonParser, function(req, response){

	// Query Definition
	var definedQuery = "";
	// Execute call
	jdbc.initialize(config, function(err, res) {
				if (err) {
					console.log(err);
				}else{
					jdbc.open(function(err, conn){
						if(err){
							console.log(err);
						}else{
							 jdbc.executeQuery("SELECT  * from categories",function(err, results){
	  if (err) {
	    console.log(err);
	  } else if (results) {
				console.log(results);
				var categories = results;









			}
			
			
		jdbc.close(function(err) {
				if(err) {
					console.log(err);
				} else {
					console.log("Connection closed successfully!");




					}
							});



							
							
							
							
							return response.json({Value: categories});
							});

						}
					});

				}


				});
});

  



app.post('/api/hive2', jsonParser, function(req, res){
var hiveQueryId = req.body.queryId; 
return res.json({Value: "OK manolo"});
});
app.listen(process.env.PORT || 8899, '0.0.0.0');
