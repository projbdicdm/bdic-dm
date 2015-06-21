package br.ita.bdicdm.autorizadormobile.receivers;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import br.ita.bdicdm.autorizadormobile.service.MqttListener;

/**
 * Created by Andre on 20/06/2015.
 */
public class BootCompletedIntentReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if ("android.intent.action.BOOT_COMPLETED".equals(intent.getAction())) {
            Intent service = new Intent(context, MqttListener.class);
            context.startService(service);
        }
    }
}
