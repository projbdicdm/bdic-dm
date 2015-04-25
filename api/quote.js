//criamos o obj que renderiza HTML na saida
var jade = require('jade');

//criamos uma sintancia do Express
var express = require('express');

//criamos a instancia do App
var app = express();

//array com as citacoes
var quotes = [
  { author : 'Audrey Hepburn', text : "Nothing is impossible, the word itself says 'I'm possible'!"},
  { author : 'Walt Disney', text : "You may not realize it when it happens, but a kick in the teeth may be the best thing in the world for you"},
  { author : 'Unknown', text : "Even the greatest was once a beginner. Don't be afraid to take that first step."},
  { author : 'Neale Donald Walsch', text : "You are afraid to die, and you're afraid to live. What a way to exist."}
];

//quando um cliente der um GET no /quotes ele recebe um JSON com todas as citacos
app.get('/quotes', function(req, res) {
  res.json(quotes);
});

//se for um GET / mostramos uma saida HTML formatada com o Jade
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.get('/', function (req, res) {
  res.render('index', { title: 'Citações HTML', message: 'renderizado pelo Jade', quotes: quotes});
})

//devolve uma citacao aleatoria ao acessar /quote/random
app.get('/quote/random', function(req, res) {
  var id = Math.floor(Math.random() * quotes.length);
  var q = quotes[id];
  res.json(q);
});

//devolve uma citacao aleatoria ao acessar /quote/random
app.get('/quotes/length', function(req, res) {
  res.json(quotes.length);
});

//:id é um placeholder para um parametro na URL, quando for um GET /quote/{um id de citacao} retorna o JSON, ou um erro
app.get('/quote/:id', function(req, res) {
  if(quotes.length <= req.params.id || req.params.id < 0) {
    res.statusCode = 404;
    return res.send('Error 404: No quote found');
  }  
var q = quotes[req.params.id];
  res.json(q);
});

//para tratar os dados advindos de um POST usamos um recurso do Express: BodyParser
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

//aqui tratamos o POST em /quote com um JSON de citacao
//o JSON tem a estrutura:
/*
{author: "name", text: "quote here"}
*/
app.post('/quote', jsonParser, function(req, res) {
  if(!req.body.hasOwnProperty('author') || 
     !req.body.hasOwnProperty('text')) {
    res.statusCode = 400;
    return res.send('Error 400: Post syntax incorrect.');
  } 
 
var newQuote = {
    author : req.body.author,
    text : req.body.text
  }; 
 
quotes.push(newQuote);
  res.json(true);
});


//para apagar uma citacao
app.delete('/quote/:id', function(req, res) {
  if(quotes.length <= req.params.id) {
    res.statusCode = 404;
    return res.send('Error 404: No quote found');
  }  

quotes.splice(req.params.id, 1);
  res.json(true);
});

app.listen(process.env.PORT || 3412, '0.0.0.0');
