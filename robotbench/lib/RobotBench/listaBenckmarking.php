<div class="alert alert-success">
Registros Inseridos com Sucesso!
</div>
<h4>Mostrando 10 transações de <?php echo $_REQUEST["registros"]; ?> inseridos</h4>
  <table class="table table-striped table-hover">
      <thead>
        <tr>
          <td>User Token</td>
          <td>UUID</td>
          <!--<td>car_id</td>
          <td>loc_id</td>
          <td>tra_confirmationcode</td>-->
          <td>Data</td>
          <td>Latitude</td>
          <td>Longitude</td>
          <td>Status</td>
          <td>Valor</td>
        </tr>
      </thead>
      <tbody>
        <?php
        foreach($rows as $row){

            echo
              "<tr>" .
                "<td>" . $row["usr_token"] . "</td>" .
                "<td>" . $row["tra_id"] . "</td>" .
                /*"<td>" . $row["car_id"] . "</td>" .
                "<td>" . $row["loc_id"] . "</td>" .
                "<td>" . $row["tra_confirmationcode"] . "</td>" .*/
                "<td>" . date('l jS \of F Y h:i:s A', ($row["tra_date"] / 1000)) . "</td>" .
                "<td>" . $row["tra_lat"] . "</td>" .
                "<td>" . $row["tra_lon"] . "</td>" .
                "<td>" . $row["tra_status"] . "</td>" .
                "<td>" . $row["tra_value"] . "</td>" .
              "</tr>";
          }
        ?>
      </tbody>
    </table>
