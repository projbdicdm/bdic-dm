var r = require('rserve-client');
var await = require('await');

var calbacksProcessoR = await('resultadoDoR');

r.connect("85.25.92.122", 6311, function(err, client) {

	if(err){
		console.log(err);
		calbacksProcessoR.fail(err);
	}else{
		var codigo = 'resposta <- c(classificaHMM("a4a70900-24e1-11df-8924-001ff3591711",99), classificaBoxPlot("a4a70900-24e1-11df-8924-001ff3591711",99))';	
		client.evaluate(codigo, function(err, ans) {

			if(err){
				console.log("err:" + err);
				calbacksProcessoR.fail(err);
			}
console.log("resultadoDoR(HMM): "+ans);
			console.log("resultadoDoR(HMM): "+ans[0]);
			console.log("resultadoDoR(BoxPlot): "+ans[1]);
			client.end();
			calbacksProcessoR.keep('resultadoDoR', ans);
		});
}});

	calbacksProcessoR.then(function(got){
		console.log(got.resultadoDoR[0] && got.resultadoDoR[1]);	
	},function(err){
		console.log(err);
		//res.statusCode = 500;
		//return res.json({status: "Error 500", message: err});
	});