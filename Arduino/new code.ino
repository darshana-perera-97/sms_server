#include <Arduino.h>
#if defined(ESP32)
#include <WiFi.h>
#elif defined(ESP8266)
#include <ESP8266WiFi.h>
#endif
#include <Firebase_ESP_Client.h>

#include <SoftwareSerial.h>
SoftwareSerial mySerial(4, 5);

// Provide the token generation process info.
#include "addons/TokenHelper.h"
// Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

// Insert your network credentials
#define WIFI_SSID "Xiomi"
#define WIFI_PASSWORD "dddddddd"

// Insert Firebase project API Key
#define API_KEY "AIzaSyCwAMrMTk96PffuW7a4yEKifshfGoCQBZ4"

// Insert RTDB URL
#define DATABASE_URL "https://sms-server-adef0-default-rtdb.firebaseio.com/"

// Define Firebase Data object
FirebaseData fbdo;

FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
bool signupOK = false;

void setup()
{
    Serial.begin(115200);

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting to Wi-Fi");
    while (WiFi.status() != WL_CONNECTED)
    {
        Serial.print(".");
        delay(300);
    }
    Serial.println();
    Serial.print("Connected with IP: ");
    Serial.println(WiFi.localIP());
    Serial.println();

    config.api_key = API_KEY;
    config.database_url = DATABASE_URL;

    if (Firebase.signUp(&config, &auth, "", ""))
    {
        Serial.println("ok");
        signupOK = true;
    }
    else
    {
        Serial.printf("%s\n", config.signer.signupError.message.c_str());
    }

    // Assign the callback function for the long running token generation task
    config.token_status_callback = tokenStatusCallback; // See addons/TokenHelper.h

    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);
}

void printWithLineBreak(String text)
{
    int index = 0;
    while ((index = text.indexOf('|')) != -1)
    {
        Serial.println(text.substring(0, index));
        text = text.substring(index + 1);
    }
    Serial.println(text); // Print the last part
}

void loop()
{
    if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 5000 || sendDataPrevMillis == 0))
    {
        sendDataPrevMillis = millis();

        String textToSend = "Hello, Firebase!";
        String receivedText;
        String receivedNum;
        String state;

        if (Firebase.RTDB.getJSON(&fbdo, "messages"))
        {
            FirebaseJson &json = fbdo.jsonObject();
            FirebaseJsonData jsonData;

            // Retrieve the "designation" field
            if (json.get(jsonData, "designation") && jsonData.type == "string")
            {
                Serial.println("Designation: " + jsonData.stringValue);
                receivedNum = jsonData.stringValue;
            }
            else
            {
                Serial.println("Failed to get designation");
            }

            // Retrieve the "message" field
            if (json.get(jsonData, "message") && jsonData.type == "string")
            {
                Serial.println("Message: " + jsonData.stringValue);
                receivedText = jsonData.stringValue;
            }
            else
            {
                Serial.println("Failed to get message");
            }
        }
        else
        {
            Serial.println("FAILED to get messages node");
            Serial.println("REASON: " + fbdo.errorReason());
            Serial.println("Data Type: " + fbdo.dataType());
        }
        if (Firebase.RTDB.getString(&fbdo, "state/state"))
        {
            state = fbdo.stringData();
            Serial.print("State: ");
            Serial.println(state);
        }
        else
        {
            Serial.println("FAILED to get state");
            Serial.println("REASON: " + fbdo.errorReason());
            Serial.println("Data Type: " + fbdo.dataType());
        }

        // Send message
        if (state == "send")
        {
            mySerial.begin(9600);
            Serial.println("Serial communication setup ok");

            mySerial.println("AT+CMGF=1");
            delay(1000);

            mySerial.print("AT+CMGS=\"+94");
            mySerial.print(receivedNum);
            mySerial.println("\"\r");
            delay(1000);
            mySerial.println(receivedText);
            delay(100);
            mySerial.println((char)26);
            delay(1000);

            // Wait for the response from the GSM module
            while (mySerial.available())
            {
                String response = "";
                while (mySerial.available())
                {
                    response += (char)mySerial.read();
                }
                Serial.println("Response from GSM: " + response);
            }

            String path = "state/state";
            String message = "send2";

            digitalWrite(LED_BUILTIN, LOW);
            delay(1000);
            digitalWrite(LED_BUILTIN, HIGH);

            if (Firebase.RTDB.setString(&fbdo, path.c_str(), message))
            {
                Serial.println("Data written to Firebase successfully");
            }
            else
            {
                Serial.println("FAILED to write data to Firebase");
                Serial.println("REASON: " + fbdo.errorReason());
            }
        }
        else
        {
            Serial.println("Message is not sent");
        }
    }
}