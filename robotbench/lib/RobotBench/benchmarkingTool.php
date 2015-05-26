<?php

  ini_set('memory_limit', '-1');
  set_time_limit(0);
  //header('Content-Type: application/json');

  require       'lib/PHP-Benchmark/init.php';
  require_once  'lib/Faker/autoload.php';
  require       'lib/php-cassandra/php-cassandra.php';
  require       'lib/RobotBench/connection.php';
  require       'lib/RobotBench/insertBenchmarking.php';
  require       'lib/RobotBench/selectBenchmarking.php';
  require       'lib/RobotBench/listaBenckmarking.php';
