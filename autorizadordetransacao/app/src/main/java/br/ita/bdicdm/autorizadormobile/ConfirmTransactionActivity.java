package br.ita.bdicdm.autorizadormobile;

import android.app.Activity;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;

/**
 * Created by Andre on 20/06/2015.
 */
public class ConfirmTransactionActivity extends Activity {

    String usr_token, tra_id, confirmation_code;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        onNewIntent(getIntent());
    }

    @Override
    public void onNewIntent(Intent intent){
        Bundle extras = intent.getExtras();
        if(extras != null){
            if(extras.containsKey("json"))
            {
                // extract the extra-data in the Notification
                String msg = extras.getString("json");

                String tra_confirmationcode = "", tra_id = "", usr_token = "", tra_value = "tra_value", status = "OK", reason = "";
                try {
                    JSONObject json = new JSONObject(msg);
                    status = json.getString("status");
                    tra_value = json.getString("tra_value");
                    tra_id = json.getString("tra_id");
                    usr_token = json.getString("usr_token");

                    if(status.equalsIgnoreCase("OK")) {
                        tra_confirmationcode = json.getString("tra_confirmationcode");
                    }else{
                        reason = json.getString("reason");
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }

                if(status.equalsIgnoreCase("OK")){
                    setContentView(R.layout.confirm_transaction);
                    TextView txtValorTransacao = (TextView) findViewById(R.id.txtValorTransacao);
                    txtValorTransacao.setText("R$ " + tra_value );
                    TextView txtCodigoDeConfirmacao = (TextView) findViewById(R.id.txtCodigoDeConfirmacao);
                    txtCodigoDeConfirmacao.setText(tra_confirmationcode);

                    Button btnConfirmar = (Button)findViewById(R.id.btnConfirmar);

                    final String finalUsr_token = usr_token;
                    final String finalTra_id = tra_id;
                    btnConfirmar.setOnClickListener(new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                            EditText txtCodigoDeConfirmacao2 = (EditText) findViewById(R.id.txtCodigoDeConfirmacao2);
                            new ConfirmTransactionTask().execute(finalUsr_token, finalTra_id, txtCodigoDeConfirmacao2.getText().toString());
                        }
                    });
                }else{
                    setContentView(R.layout.denied_transaction);
                    TextView txtMotivo = (TextView) findViewById(R.id.txtMotivo);

                    txtMotivo.setText("Foi uma compra de R$ " + tra_value + "\n negada com o motivo: " + reason);

                    Button btnFechar = (Button)findViewById(R.id.btnFechar);
                    btnFechar.setOnClickListener(new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                            finish();
                        }
                    });
                }
            }
        }


    }

    class ConfirmTransactionTask extends AsyncTask<String, Void, String> {

        @Override
        protected void onPostExecute(String result) {
            if(result.equalsIgnoreCase("error")){
                Toast.makeText(getApplicationContext(), "Erro ao confirmar a transacao!", Toast.LENGTH_LONG).show();
            }else {
                Toast.makeText(getApplicationContext(), "Transacao confirmada com sucesso!!", Toast.LENGTH_LONG).show();
                finish();
            }
        }

        @Override
        protected String doInBackground(String... values) {
            String usr_token, tra_id, confirmation_code, apiReturn = "ERROR";

            try {
                usr_token = values[0];
                tra_id = values[1];
                confirmation_code = values[2];

                HttpClient httpClient = new DefaultHttpClient();
                HttpPost httpPost = new HttpPost("http://orion2412.startdedicated.net:8899/api/transaction/confirm");

                JSONObject jsonObject = new JSONObject();

                try {
                    jsonObject.put("token", usr_token);
                    jsonObject.put("id", tra_id);
                    jsonObject.put("confirmationCode", confirmation_code);

                } catch (Exception ex) {
                    ex.printStackTrace();
                    Log.e("", "", ex);
                }

                try {
                    httpPost.setEntity(new StringEntity(jsonObject.toString()));
                } catch (UnsupportedEncodingException e) {
                    Log.e("Erro","Erro ao gerar JSON para Confirm", e);
                    e.printStackTrace();
                }

                //making POST request.
                try {
                    httpPost.setHeader("Content-Type", "application/json");
                    HttpResponse response = httpClient.execute(httpPost);

                    if (response.getStatusLine().getStatusCode() == HttpStatus.SC_OK) {

                        StringBuilder builder = new StringBuilder();
                        BufferedReader reader = new BufferedReader(new InputStreamReader(response.getEntity().getContent()));
                        String line;
                        while ((line = reader.readLine()) != null) {
                            builder.append(line);
                        }

                        line = builder.toString();

                        JSONObject json = new JSONObject(line);
                        // write response to log
                        apiReturn = json.getString("status");

                    } else {
                        apiReturn = "ERROR " + response.getStatusLine().getStatusCode();
                    }
                } catch (ClientProtocolException e) {
                    // Log exception
                    e.printStackTrace();
                } catch (IOException e) {
                    // Log exception
                    e.printStackTrace();
                }

                return apiReturn;
            } catch (Exception e) {
                Log.e("app", "erro", e);
                return apiReturn;
            }
        }
    }



}
