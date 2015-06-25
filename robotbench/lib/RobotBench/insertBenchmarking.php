<?php

  $status = array("cancelado", "em espera", "processando", "concluído");
  $car_id = 0;
  $loc_id = 0;

  for ($i=1; $i <= $_REQUEST["registros"]; $i++) {

    //Campos gerados para a tabela TRANSACTION.
    if ($i % 3 == 0 || $i == 1){
      $tra_lat = Faker\Geo::latitude(\Faker\Geo\SaoPaulo::bounds());
      $tra_lon = Faker\Geo::longitude(\Faker\Geo\SaoPaulo::bounds());
      $usr_token = md5(uniqid(rand(), true));
      $car_id++;
      $loc_id++;
    }

    $tra_confirmationcode = md5(uniqid(rand(), true));
    $tra_date = (int) (microtime(true) * 1000);
    //$tra_date = (int) (rand(1400965802, microtime(true)) * 1000);
    $tra_status = $status[array_rand($status)];
    $tra_value = number_format(mt_rand() / mt_getrandmax() * 1000,2);

    try{

      $statement = $connection->queryAsync(
            'INSERT INTO ' . $namespace . ' (
                    usr_token,
                    tra_id,
                    car_id,
                    loc_id,
                    tra_confirmationcode,
                    tra_date,
                    tra_lat,
                    tra_lon,
                    tra_status,
                    tra_value,
                    tra_alt)
            VALUES (
                    :usr_token,
                    now(),
                    :car_id,
                    :loc_id,
                    :tra_confirmationcode,
                    :tra_date,
                    :tra_lat,
                    :tra_lon,
                    :tra_status,
                    :tra_value,
                    :tra_alt)',
          [
            new Cassandra\Type\Varchar("$usr_token"),
            new Cassandra\Type\Int($car_id),
            new Cassandra\Type\Int($loc_id),
            new Cassandra\Type\Varchar("$tra_confirmationcode"),
            new Cassandra\Type\Timestamp($tra_date),
            new Cassandra\Type\Float($tra_lat),
            new Cassandra\Type\Float($tra_lon),
            new Cassandra\Type\Varchar("$tra_status"),
            new Cassandra\Type\Decimal($tra_value),
            new Cassandra\Type\Varchar("n"),
          ]);

          $rows = $statement->getResponse();

        }catch (Cassandra\Exception $e){
          echo 'Caught exception: ',  $e->getMessage(), "\n";
          exit;//if connect failed it may be good idea not to continue
        }
    }
?>
