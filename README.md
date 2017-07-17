# -DBLab-HRV-PM-Project
This is a patient monitoring system for 2 scenarios in medical environments, hospital wards and hemodialysis center.

## 1. Hospital Wards 
  It monitors the patients' pulse rate and locations. There are 2 components, wearable sensor and communication gateway. Communication gateways are installed around the indoors environments and scan the broadcast packets from wearable sensors by Zigbee.

  ### Wearable Sensor 
+   Environment: Arduino
+   Used hardware components: Arduino Micro, XBee S2 module, pulse sensor
+   Used library: https://github.com/andrewrapp/xbee-arduino (for XBee)
+   Algorithm: https://github.com/WorldFamousElectronics/PulseSensor_Amped_Arduino (Pulse detection)

  ### Communication Gateway (installed around the indoors environments)
+   Environment: Nodejs on Ubuntu Mate (RaspberryPi 3)
+   Used hardware components: RaspberryPi 3, XBee S2 module
+   Language: ES6
+   Used tools: gulp and babel (transform ES6 syntax to ES5)
+   Start command (in WearableSensorRouter folder): node main [room id] (this id must exist)

## 2. Hemodialysis Center
  It monitors the patients' ECG signals. Stationary sensor are wore by patient and real-time send raw ECG signals to the server.

  ### Stationary Sensor
+   Environment: Nodejs on Ubuntu Mate (RaspberryPi 3)
+   Used hardware components: RaspberryPi 3, AD8232 and MCP3008 (analog to digital)
+   Language: ES6
+   Useful references: 
      http://atceiling.blogspot.tw/2014/04/raspberry-pi-mcp3008.html
      https://learn.sparkfun.com/tutorials/ad8232-heart-rate-monitor-hookup-guide
+   Used tools: gulp and babel (transform ES6 syntax to ES5)
+   Start command (in StationarySensor folder): node main 0 [stationary sensor id] (this id must exist, and 0 is unused)

## 3. Server
  It integrates all the information from communication gateway and stationary sensor. All the information is shown on a Web app.

## Backend
+   Environment: Nodejs on Linux
+   Used tools and libraries: [firebase](https://firebase.google.com/) (for database), gulp, babel and express
+   Start command (in Server folder): node Server.js
+   Note: HRVlib is refer to [Alive source code](https://www.dropbox.com/sh/ce0qy649p3xk9wt/AAASRd7Tc0gFrfXeZDkYUnhla?dl=0). I transformed it to Javascript and use them to detect R peak then do HRV analysis. It can real-time analyze the last 32 RR intervals to calculate HRV paramters.

## Web App (in Server/public/app)
+   Environment: Nodejs on Linux
+   Used tools and libraries: [react](https://facebook.github.io/react/), gulp, and babel 


    