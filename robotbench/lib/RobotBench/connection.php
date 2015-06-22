<?php
  $nodes = [
            [
                // advanced way, array including username, password and socket options
                //Local: 'host'      => '192.168.56.101',
                //'username'  => 'usuario',
                //'password'  => 'usuario',
                //'socket'    => [SO_RCVTIMEO => ["sec" => 10, "usec" => 0]], //socket transport only

                'host'      => 'orion2412.startdedicated.net'
                'port'      => 9042, //default 9042
            ]
          ];

  //Namespace connect
  //Local: $namespace = "BDI"."TRANSACTION";
  $namespace = '"BDICDM"."TRANSACTIONRB"';

  // Create a connection.
  $connection = new Cassandra\Connection($nodes, '');

  //Connect
  try{
      $connection->connect();
  } catch (Cassandra\Exception $e){
      echo 'Caught exception: ',  $e->getMessage(), "\n";
      exit;//if connect failed it may be good idea not to continue
  }

?>
