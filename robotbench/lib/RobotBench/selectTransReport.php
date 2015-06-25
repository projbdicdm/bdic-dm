<?php
  /*Exibição de dados*/
  try{
    $responseSelect = $connection->querySync('SELECT usr_token,
                                                tra_date,
                                                tra_lat,
                                                tra_lon
                                        FROM ' . $namespace .
                                        " WHERE tra_status = '" . $_REQUEST["status"] . "'" .
                                        " LIMIT " . $_REQUEST["exibe"]);
  } catch (Cassandra\Exception $e){
    echo 'Caught exception: ',  $e->getMessage(), "\n";
    exit;
  }

  /*Contagem de total*/
  try{
    $responseSelectCount = $connection->querySync('SELECT count(*)
                                                    FROM ' . $namespace .
                                                    " WHERE tra_status = '" . $_REQUEST["status"] . "'");
  } catch (Cassandra\Exception $e){
    echo 'Caught exception: ',  $e->getMessage(), "\n";
    exit;
  }

  $rowsSelect = $responseSelect->fetchAll();
  $count = $responseSelectCount->fetchAll();
