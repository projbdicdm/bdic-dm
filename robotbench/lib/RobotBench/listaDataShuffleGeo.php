<div class="alert alert-success">
Dados Alterados com Sucesso!
</div>
<table class="table table-striped table-hover table-condensed">
  <thead>
    <tr>
      <td>DADOS ALTERADOS: </td>
    </tr>
    <tr>
      <td>User Token</td>
      <td>Latitude</td>
      <td>Longitude</td>
    </tr>
  </thead>
  <tbody>
    <?php
      foreach($rowsSelect as $row){
        echo
          '<tr class="error">' .
            "<td>" . $row["usr_token"] . "</td>" .
            "<td>" . $row["tra_lat"] . "</td>" .
            "<td>" . $row["tra_lon"] . "</td>" .
          "</tr>";
      }
    ?>
  </tbody>
</table>
