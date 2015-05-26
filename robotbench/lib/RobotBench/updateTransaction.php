<?php

  $tokenAnterior = "";
  $porcentagem = $_REQUEST["registros"];

  try{

    $response1 = $connection->querySync('SELECT *
                                      FROM "BDI"."TRANSACTION"' .
                                      " WHERE tra_alt = 'n'" .
                                      '');

    $rows1 = $response1->fetchAll();

    if (count($rows1) == 0):
      echo '<div class="alert alert-error">
              Não existem registros para alteração
            </div>';
      exit;

    endif;

    $limite = floor(($porcentagem / 100) * count($rows1));

    $response2 = $connection->querySync('SELECT *
                                      FROM "BDI"."TRANSACTION"' .
                                      " WHERE tra_alt = 'n'" .
                                      'LIMIT ' . $limite);

    $rows2 = $response2->fetchAll();


  } catch (Cassandra\Exception $e){
    //echo 'Caught exception: ',  $e->getMessage(), "\n";
    //exit;
  }

  foreach($rows2 as $row){
    $usr_token[] = $row["usr_token"];
    $tra_id[] = $row["tra_id"];
  }

  $dados = array_combine($tra_id, $usr_token);
  $dados = array_unique($dados);


  foreach($dados as $tra_id => $usr_token){

    //recupera lista de dados alterados no momento
    $ids[] = $tra_id;

      try{

        $statement = $connection->querySync(
          'UPDATE "BDI"."TRANSACTION"
            SET tra_alt = :tra_alt,
                tra_lat = :tra_lat,
                tra_lon = :tra_lon
            WHERE usr_token = ' . "'" . $usr_token . "'" .
                  ' AND tra_id = ' . $tra_id,
        [
          new Cassandra\Type\Varchar("s"),
          new Cassandra\Type\Float(Faker\Geo::latitude(\Faker\Geo\NewYork::bounds())),
          new Cassandra\Type\Float(Faker\Geo::longitude(\Faker\Geo\NewYork::bounds())),
        ]);

        $update = $statement->fetchAll();
        $tokenAnterior = $row["usr_token"];

      }

      catch (Cassandra\Exception $e){
            //echo 'Caught exception: ',  $e->getMessage(), "\n";
            //exit;//if connect failed it may be good idea not to continue
      }

  }

  $ids = implode(",", $ids);

?>
