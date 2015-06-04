<?php

  ini_set('memory_limit', '-1');
  set_time_limit(0);

  require       'lib/PHPCassandra/php-cassandra.php';
  require       'lib/RobotBench/connection.php';
  require       'lib/RobotBench/selectFraudReport.php';
  require       'lib/RobotBench/listaFraudReport.php';
