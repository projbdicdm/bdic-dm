<!DOCTYPE html>
<html>
  <head>
    <title>Instituto Tecnológico da Aeronáutica - RobotBench BDIC-DM - #TS02 - Cassandra</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap -->
    <script src="js/jquery.js"></script>
    <link href="css/bootstrap.min.css" rel="stylesheet" media="screen">
    <link href="css/bootstrap.min.css" rel="stylesheet" media="print">

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
            <li><a href="<?php echo $path?>robotbench/">Benchmarking Tool</a></li>
            <li><a href="<?php echo $path?>robotbench/datashuffle.php">Data Shuffle GEO</a></li>
            <li class="active"><a href="<?php echo $path?>robotbench/transreport.php">Transactions Report</a></li>
            <li><a href="<?php echo $path?>robotbench/fraudreport.php">Fraud Report</a></li>
          </ul>
        </div>
      </div>
      <h3>Transactions Report - Relatório de Volume de Transações</h3>

      <?php if (!$_POST): ?>

        <h4>Status da Transação: </h4>

        <div class="input-append">
          <form method="post" name="formulario" action="">
            <select name="status">
              <?php
                require       'lib/PHPCassandra/php-cassandra.php';
                require       'lib/RobotBench/connection.php';
                require       'lib/RobotBench/selectStatus.php';

                foreach ($status as $item){
                  echo '<option value="' . $item . '">' . $item . '</option>';
                }
              ?>
            </select>
            <br /><br />
            <h4>Quantidade de Registros a serem exibidos: </h4>
            <select name="exibe">
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="250">250</option>
              <option value="500">500</option>
              <option value="1000">1000</option>
            </select>
            <!--<button class="btn" type="button" id="enviar">Go!</button>-->
            <input type="submit" name="enviar" value="Gerar Relatório"
            onclick="document.getElementById('progress').style.display=''" class="btn btn-primary">
          </form>
        </div>

        <div id="progress" style="display:none;">
          <h5 style="text-align:center;">Gerando - Aguarde um momento..</h5>
          <div class="progress progress-striped active">
            <div class="bar" style="width: 100%;"></div>
          </div>
        </div>

    <?php else: require "lib/RobotBench/transReport.php"; endif; ?>
  </div>
  </body>
</html>
