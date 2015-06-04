<?php
  try{
    $responseSelect = $connection->querySync('SELECT usr_token,
                                                tra_date,
                                                tra_lat,
                                                tra_lon
                                        FROM "BDI"."TRANSACTION" ' .
                                        "WHERE tra_alt = 's' LIMIT " . $_REQUEST["registros"]);
  } catch (Cassandra\Exception $e){
    echo 'Caught exception: ',  $e->getMessage(), "\n";
    exit;
  }

  $rowsSelect = $responseSelect->fetchAll();
