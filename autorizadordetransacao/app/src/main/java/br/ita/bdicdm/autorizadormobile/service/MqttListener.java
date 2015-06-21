package br.ita.bdicdm.autorizadormobile.service;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.RingtoneManager;
import android.os.Handler;
import android.os.IBinder;
import android.preference.PreferenceManager;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.TaskStackBuilder;
import android.util.Log;
import android.widget.Toast;

import br.ita.bdicdm.autorizadormobile.ConfirmTransactionActivity;
import br.ita.bdicdm.autorizadormobile.R;

import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Timer;
import java.util.TimerTask;

/**
 * Created by Andre on 20/06/2015.
 */
public class MqttListener extends Service {

    public static final long NOTIFY_INTERVAL = 10 * 1000; // 10 seconds
    int totalMsg = 1;
    // run on another Thread to avoid crash
    private Handler mHandler = new Handler();
    // timer handling
    private Timer mTimer = null;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    MqttClient sampleClient;

    @Override
    public void onCreate() {
        super.onCreate();

        String token = "";
        token = PrefCarregaTokenSalvo();

        if(token != "") {

            try {
                String topic = token;
                String uri = "tcp://orion2412.startdedicated.net:1883";
                String clientId = "MobileUser_" + token;
                MemoryPersistence persistence = new MemoryPersistence();

                sampleClient = new MqttClient(uri, clientId, persistence);
                MqttConnectOptions connOpts = new MqttConnectOptions();
                connOpts.setCleanSession(true);

                sampleClient.connect(connOpts);

                sampleClient.subscribe(topic, 1);

                sampleClient.setCallback(new MqttCallback() {
                    @Override
                    public void connectionLost(Throwable throwable) {

                    }

                    @Override
                    public void messageArrived(String s, MqttMessage mqttMessage) throws Exception {

                        final MqttMessage mqttMessage2 = mqttMessage;

                        mHandler.post(new Runnable() {

                            @Override
                            public void run() {

                                NotificationCompat.Builder mBuilder =
                                        new NotificationCompat.Builder(getApplicationContext())
                                                .setSmallIcon(R.drawable.ic_mobile_payment)
                                                .setAutoCancel(true)
                                                .setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION))
                                                .setContentTitle("Aviso de compra")
                                                .setContentText("Chegou uma notificação de compra em seu nome, toque para verificar e confirmar.");

                                String status = "OK";

                                try {
                                    JSONObject json = new JSONObject(new String(mqttMessage2.getPayload()));

                                    status = json.getString("status");

                                    if (!status.equalsIgnoreCase("OK")) {
                                        mBuilder.setContentTitle("Aviso de transação negada");
                                        mBuilder.setContentText("Você realizou uma transação, mas esta foi negada pelo sistema, toque para detalhes.");
                                    }

                                } catch (JSONException e) {
                                    e.printStackTrace();
                                }


                                Intent resultIntent = new Intent(getApplicationContext(), ConfirmTransactionActivity.class);
                                resultIntent.putExtra("json", new String(mqttMessage2.getPayload()));

                                // The stack builder object will contain an artificial back stack for the
                                // started Activity.
                                // This ensures that navigating backward from the Activity leads out of
                                // your application to the Home screen.
                                TaskStackBuilder stackBuilder = TaskStackBuilder.create(getApplicationContext());
                                // Adds the back stack for the Intent (but not the Intent itself)
                                stackBuilder.addParentStack(ConfirmTransactionActivity.class);
                                // Adds the Intent that starts the Activity to the top of the stack
                                stackBuilder.addNextIntent(resultIntent);
                                PendingIntent resultPendingIntent =
                                        stackBuilder.getPendingIntent(
                                                0,
                                                PendingIntent.FLAG_UPDATE_CURRENT
                                        );

                                mBuilder.setContentIntent(resultPendingIntent);
                                NotificationManager mNotificationManager =
                                        (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                                // mId allows you to update the notification later on.
                                mNotificationManager.notify(totalMsg++, mBuilder.build());
                            }

                        });
                    }

                    @Override
                    public void deliveryComplete(IMqttDeliveryToken iMqttDeliveryToken) {

                    }
                });

            } catch (Exception e) {
                Log.e("app", "erro", e);
                e.printStackTrace();
            }
        }

    }


    private String PrefCarregaTokenSalvo() {
        SharedPreferences sharedPreferences = PreferenceManager
                .getDefaultSharedPreferences(this);
        return sharedPreferences.getString("Token", "");
    }
}
