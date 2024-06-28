#include <SoftwareSerial.h>
SoftwareSerial mySerial(4, 5);

void setup() {
  mySerial.begin(9600);
  Serial.begin(9600);
  Serial.println("setup ok");

  mySerial.println("AT+CMGF=1");
  delay(1000);
  mySerial.println("AT+CMGS=\"+94771461925\"\r");
  delay(1000);
  mySerial.println("Hi");
  delay(100);
  mySerial.println((char)26);
  delay(1000);
}

void loop() {

  

}