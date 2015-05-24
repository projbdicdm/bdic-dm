	//Definindo a chamada do gráfico (chart)
	google.load('visualization', '1.0', {'packages':['corechart']});
    google.setOnLoadCallback(drawChart);
	
	//Inicializando o processo de criação do gráfico
    function drawChart() {
		
		//Criando o gráfico com valores fixos através da variável DATA
        var data = new google.visualization.DataTable();
            data.addColumn('string', 'Dias da Semana');
            data.addColumn('number', 'Produto 1');
            data.addColumn('number', 'Produto 2');
            data.addColumn('number', 'Produto 3');
            data.addColumn('number', 'Produto 4');
            data.addColumn('number', 'Meta de Vendas');
            data.addRows([
             ['Segunda-feira', 100, 85, 99, 66, 65],
             ['Terça-feira', 100, 78, 55, 72, 62],
             ['Quarta-feira', 100, 79, 85, 45, 88],
             ['Quinta-feira', 100, 69, 85, 42, 77],
             ['Sexta-feira', 100, 97, 93, 84, 74],
			 ['Sábado', 100, 77, 93, 94, 84],
			 ['Domingo', 100, 87, 85, 42, 74]
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