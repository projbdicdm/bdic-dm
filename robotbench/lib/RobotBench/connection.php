<?php
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

?>
