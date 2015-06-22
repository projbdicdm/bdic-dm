<?php
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
                                                tra_value FROM ' . $namespace . ' LIMIT 10');

    //$response2 = $connection->querySync('select count(*) from "BDI"."TRANSACTION" limit 1000000;');

    $rows = $response->fetchAll();
    //$rows2 = $response2->fetchAll();

  } catch (Cassandra\Exception $e){
    //echo 'Caught exception: ',  $e->getMessage(), "\n";
    //exit;
  }
