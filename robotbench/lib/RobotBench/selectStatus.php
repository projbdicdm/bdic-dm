<?php
  try{
    $responseSelect = $connection->querySync('SELECT tra_status
                                        FROM ' . $namespace . ' LIMIT 100');
  } catch (Cassandra\Exception $e){
    echo 'Caught exception: ',  $e->getMessage(), "\n";
    exit;
  }

  $rowsSelect = $responseSelect->fetchAll();

  foreach($rowsSelect as $row){
    $status[] = $row["tra_status"];
  }

  $status = array_unique($status);
