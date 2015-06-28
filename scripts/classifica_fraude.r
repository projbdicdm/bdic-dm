library(RJDBC)
library(HMM)

prob <- function (x) {x / sum (x)}


categoriza <- function(value){
	valor = as.numeric(value)
	if(valor < 100){
		return("low")
	}else if (value < 200){
		return("medium")
	}else{
		return("high")
	}
}

pegaOMaior <- function(coluna){ 
	return (names(which.max(coluna)))
}


obtemTransacoes <- function(uuid){
	cassdrv <- JDBC("org.apache.cassandra.cql.jdbc.CassandraDriver", list.files("/root/cassandra-jdbc",pattern="jar$",full.names=T))
	casscon <- dbConnect(cassdrv, "jdbc:cassandra://orion2412.startdedicated.net:9160/BDICDM")
	res <- dbGetQuery(casscon, "select tra_value, tra_status from \"TRANSACTION\" where usr_token = ? LIMIT 10", uuid)
	dbDisconnect(casscon)
	return(res)
}

classificaBoxPlot <- function (uuid, valorNovo){
	res <- obtemTransacoes(uuid)
	
	if(length(res[,1]) < 10){
		return(TRUE)
	}
	
	value_summary <- summary(res$tra_value)
	mean_value <- as.numeric(value_summary [ "Mean" ])
	first_quartile <- as.numeric(value_summary [ "1st Qu." ])
	median_value <- as.numeric(value_summary [ "Median" ])
	third_quartile <- as.numeric(value_summary [ "3rd Qu." ])
	upper_limit <- third_quartile + 0.1 * ( third_quartile - first_quartile )
	return (valorNovo <= as.numeric(upper_limit))
}

classificaHMM <- function (uuid, valorNovo){

	res <- obtemTransacoes(uuid)
	res2 <- res[res$tra_status %in% c('PENDING','CONFIRMED'),]
	
	if(length(res2[,1]) < 10){
		return(TRUE)
	}
	
	
	res2$c <- tapply(res2$tra_value,1:length(res2$tra_value), categoriza)

	states <- c("low","medium","high")
	symbols <- c("low","medium","high")
        hmm <- initHMM (states, symbols)
	vit <- viterbiTraining(hmm, res2$c, pseudoCount=3)
	novaTransacao <- categoriza(valorNovo)

	totalLinhas <- length(res2[,1])

	fp <- forward(vit$hmm, c(res2$c, novaTransacao))
	provavelEstado <- pegaOMaior (exp(fp[,totalLinhas]))

	return (provavelEstado == novaTransacao)
}
