<!DOCTYPE html>
<html>
  <head>
    <title>Instituto Tecnológico da Aeronáutica - RobotBench BDIC-DM - #TS02 - Cassandra</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Bootstrap -->
    <!--<script src="js/jquery.js"></script>-->
    <script src="js/bootstrap.min.js"></script>
    <link href="css/bootstrap.min.css" rel="stylesheet" media="screen">

    <script>
    /*$(document).ready(function(){
      $( "#enviar" ).click(function(){
        $.getJSON( "php-cassandra/cassandraJSON.php", { registros: $("#qtd").val() } )
          .done(function( json ) {
            console.log( "JSON Data: " + json );
          })
          .fail(function( jqxhr, textStatus, error ) {
            var err = textStatus + ", " + error;
            console.log( "Request Failed: " + err );
          });
        });
    });*/
    </script>
  </head>

  <?php require "lib/appconfig.php"; ?>

  <body>
    <div class="container-fluid">
      <div class="navbar">

        <div class="navbar-inner">
          <a class="brand" href="<?php echo $path?>robotbench/">
            <img src="img/logo-ita.png" class="img-rounded" width="50"> RobotBench BDIC-DM - #TS02 - ITA
          </a>
          <ul class="nav">
            <li class="active"><a href="<?php echo $path?>robotbench/">Benchmarking Tool</a></li>
            <li><a href="<?php echo $path?>robotbench/datashuffle.php">Data Shuffle GEO</a></li>
            <li><a href="<?php echo $path?>robotbench/transreport.php">Transactions Report</a></li>
            <li><a href="<?php echo $path?>robotbench/fraudreport.php">Fraud Report</a></li>
          </ul>
        </div>
      </div>
      <h3>Benchmarking Tool - Transações X Tempo</h3>

      <?php if ((!$_POST) || ($_POST["registros"] < 1 || $_POST["tempo"] < 1 )): ?>

        <h4>Selecione parâmetros para métrica de transações: </h4>

        <div class="input-append">

          <form method="post" name="formulario" action="">
            <input class="input-xlarge" type="text" placeholder="Quantidade de Registros" name="registros">
            <input class="input-xlarge" type="text" placeholder="Tempo de Execução (seg)" name="tempo">
            <input type="hidden" value="1" name="php-benchmark-test">
            <input type="hidden" value="1" name="display-data">

            <!--<button class="btn" type="button" id="enviar">Go!</button>-->
            <input type="submit" name="enviar" value="Go!"
              onclick="document.getElementById('progress').style.display=''" class="btn btn-primary">
        </div>

        <div id="progress" style="display:none;">
          <h5 style="text-align:center;">Inserindo Registros - Aguarde um momento</h5>
          <div class="progress progress-striped active">
            <div class="bar" style="width: 100%;"></div>
          </div>
        </div>

      <?php else: require "lib/RobotBench/benchmarkingTool.php"; endif; ?>
    </div>
  </body>
</html>
