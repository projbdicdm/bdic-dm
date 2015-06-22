<?php
  try{
    $responseSelect = $connection->querySync('SELECT usr_token,
                                                tra_lat,
                                                tra_lon
                                        FROM ' . $namespace .
                                        " WHERE tra_alt = 's' AND
                                        tra_id in($ids)");
  } catch (Cassandra\Exception $e){
    echo 'Caught exception: ',  $e->getMessage(), "\n";
    exit;
  }

  $rowsSelect = $responseSelect->fetchAll();
