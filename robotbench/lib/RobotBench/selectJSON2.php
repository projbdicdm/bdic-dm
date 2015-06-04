<?php
require 'php-cassandra.php';
$nodes = [
          [               // advanced way, array including username, password and socket options
              'host'      => '192.168.56.101',
              'port'      => 9042, //default 9042
              'username'  => 'usuario',
              'password'  => 'usuario',
              //'socket'    => [SO_RCVTIMEO => ["sec" => 10, "usec" => 0]], //socket transport only
          ]
        ];

// Create a connection.
$connection = new Cassandra\Connection($nodes, '');

//Connect
try{
    $connection->connect();
} catch (Cassandra\Exception $e){
    echo 'Caught exception: ',  $e->getMessage(), "\n";
    exit;//if connect failed it may be good idea not to continue
}

try{
  $response = $connection->querySync('SELECT usr_token,
                                              tra_id,
                                              car_id,
                                              loc_id,
                                              tra_confirmationcode,
                                              tra_date,
                                              tra_lat,
                                              tra_lon,
                                              tra_status,
                                              tra_value FROM "BDI"."TRANSACTION"');
} catch (Cassandra\Exception $e){
  echo 'Caught exception: ',  $e->getMessage(), "\n";
  exit;
}

$rows = $response->fetchAll();

$rows = json_encode($rows, JSON_PRETTY_PRINT);

header('Content-Type: application/json');

echo $rows;
?>
