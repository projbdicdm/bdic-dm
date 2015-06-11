var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://orion2412.startdedicated.net');
 
client.on('connect', function () {
  client.subscribe('presence');
  client.publish('presence', 'Hello mqtt', function(err){
	if(err){
		console.log(err);
	}else{
		console.log("envio ok");
	}
	
	
  });
});
 
client.on('message', function (topic, message) {
  // message is Buffer 
  console.log(message.toString());
  client.end();
});