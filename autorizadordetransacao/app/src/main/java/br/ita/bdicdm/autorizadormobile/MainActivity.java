package br.ita.bdicdm.autorizadormobile;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.preference.PreferenceManager;
import android.os.Bundle;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.json.JSONObject;

import br.ita.bdicdm.autorizadormobile.service.MqttListener;


public class MainActivity extends Activity {

    String TokenG;
    Button Logar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_my);

        if (PrefCarregaTokenSalvo() != "") {
            startService(new Intent(this, MqttListener.class));
            Intent i = new Intent();
            i.setClass(this, TransactionListActivity.class);
            startActivity(i);
            finish();
        }

        Logar = (Button) findViewById(R.id.logar);
        Logar.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                final EditText Login = (EditText) findViewById(R.id.digite_login);
                final EditText Passwd = (EditText) findViewById(R.id.digite_senha);
                Login.clearFocus();
                Passwd.clearFocus();

                new LoginTask().execute(Login.getText().toString(), Passwd.getText().toString());

            }
        });

    }

    private void PrefSalvaToken(String valor) {
        SharedPreferences sharedPreferences = PreferenceManager
                .getDefaultSharedPreferences(this);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString("Token", valor);
        editor.commit();
    }

    private String PrefCarregaTokenSalvo() {
        SharedPreferences sharedPreferences = PreferenceManager
                .getDefaultSharedPreferences(this);
        return sharedPreferences.getString("Token", "");
    }


    class LoginTask extends AsyncTask<String, Void, String> {

        @Override
        protected void onPostExecute(String result) {
            if (result != "ERROR") {
                PrefSalvaToken(result);
                setContentView(R.layout.transaction_list);
                startService(new Intent(getApplicationContext(), MqttListener.class));
            }else{
                Toast.makeText(getApplicationContext(), "Ocorreu um erro no login", Toast.LENGTH_LONG).show();
            }
        }

        @Override
        protected String doInBackground(String... values) {
            try {
                String Tokenapi = "ERROR";
                HttpClient httpClient = new DefaultHttpClient();
                HttpPost httpPost = new HttpPost("http://orion2412.startdedicated.net:8899/api/user/login");

                JSONObject jsonObject = new JSONObject();

                try {
                    jsonObject.put("login", values[0]);
                    jsonObject.put("password", values[1]);
                } catch (Exception ex) {
                    ex.printStackTrace();
                    Log.e("", "", ex);
                }


                try {
                    httpPost.setEntity(new StringEntity(jsonObject.toString()));
                } catch (UnsupportedEncodingException e) {
                    // log exception
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
                        Tokenapi = json.getString("token");
                        Log.d("Http Post Response:", builder.toString());
                    } else {
                        Tokenapi = "ERROR";
                    }
                } catch (ClientProtocolException e) {
                    // Log exception
                    e.printStackTrace();
                } catch (IOException e) {
                    // Log exception
                    e.printStackTrace();
                }

                return Tokenapi;
            } catch (Exception e) {
                Log.e("app", "erro", e);
                return "ERROR";
            }
        }
    }
}
