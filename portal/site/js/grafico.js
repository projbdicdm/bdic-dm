	//Definindo a chamada do gráfico (chart)
	google.load('visualization', '1.0', {'packages':['corechart']});
    google.setOnLoadCallback(drawChart);
	
	//Vetor para armazenar os dados vindos de outra página JS
	function gerar_dados(){
		var vet_dados = new array();
		var tamanho = vet_dados.length;
		var contador;
		//Vetor dinâmico
		for (contador = 1; contador <= tamanho; contador++){
			vet_dados.push();
		}
	}
	
	//Inicializando o processo de criação do gráfico
    function drawChart() {
		
		//Criando o gráfico através da variável DATA
        var data = new google.visualization.DataTable();
            data.addColumn('string', 'Dias da Semana');
            data.addColumn('number', 'Produto 1');
            data.addColumn('number', 'Produto 2');
            data.addColumn('number', 'Produto 3');
            data.addColumn('number', 'Produto 4');
            data.addColumn('number', 'Meta de Vendas');
            data.addRows([
             ['Segunda-feira', gerar_dados()],
             ['Terça-feira', gerar_dados()],
             ['Quarta-feira', gerar_dados()],
             ['Quinta-feira', gerar_dados()],
             ['Sexta-feira', gerar_dados()],
			 ['Sábado', gerar_dados()],
			 ['Domingo', gerar_dados()]
          ]);
     
		//Customizando o gráfico através da variável OPTIONS
        var options = {
            'legend': 'right',
            'title' : 'Venda de Produtos',
            'is3D'  : true,
            'width' : 900,
            'height': 500,
            seriesType: "bars",
            series: {4: {type: "line"}}
          };
             
        //Instanciando o gráfico para ser visualizado na interface com o usuário - variável CHART_DIV
		var chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
        
		//Executando um draw no gráfico passando por parâmetro os valores das variáveis DATA e OPTIONS
		chart.draw(data, options);
      }