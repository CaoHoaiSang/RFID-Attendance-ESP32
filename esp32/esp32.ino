#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <LiquidCrystal_I2C.h>

// Pin cấu hình cho RFID
#define SS_PIN 16
#define RST_PIN 17
#define On_Board_LED_PIN 2
MFRC522 rfid(SS_PIN, RST_PIN);

int runMode=2;
const int btnIO = 15;
bool btnIOState = HIGH;
unsigned long timeDelay=millis();
unsigned long timeDelay2=millis();
bool InOutState=0; //0: vào, 1:ra
const int ledIO = 4;
const int buzzer = 5;

//Khai bao man hinh LCD 16x02
LiquidCrystal_I2C lcd(0x27, 16, 2);

// WiFi
const char* ssid = "iPhone";
const char* password = "14112004";

// HiveMQ MQTT
const char* mqtt_server = "81c1b84919354c788e2869c85d29a2ec.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_username = "diemDanh";
const char* mqtt_password = "diemDanh1234";

// WiFi & MQTT client
WiFiClientSecure espClient;
PubSubClient client(espClient);

// UID string
String uidString;

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Đang kết nối WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi đã kết nối");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void reconnect_mqtt() {
  while (!client.connected()) {
    Serial.print("Đang kết nối MQTT...");
    String clientID = "ESP32Client-" + String(random(0xffff), HEX);

    if (client.connect(clientID.c_str(), mqtt_username, mqtt_password)) {
      Serial.println("MQTT đã kết nối");

      client.subscribe("rfid/response");
    } else {
      Serial.print("Lỗi kết nối, mã: ");
      Serial.print(client.state());
      Serial.println(" | Thử lại sau 5 giây...");
      delay(5000);
    }
  }
}

void beep(int n, int d){
  for(int i=0;i<n;i++){
    digitalWrite(buzzer,HIGH);
    delay(d);
    digitalWrite(buzzer,LOW);
    delay(d);
  }
}


void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.println("Phản hồi từ server:");
  Serial.println(message);

  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (!error) {
    String status = doc["status"];
    String name = doc["name"] | "N/A";
    String RFID = doc["RFID"] | "N/A";

    lcd.clear();
    lcd.setCursor(0, 0);

    if (status == "success") {
      Serial.println("Thành công: " + name);

      lcd.print(String("Xin chao,      ") + (InOutState ? "R" : "V"));
      lcd.setCursor(0, 1);
      lcd.print(name);

      // Bật đèn và còi báo thành công
      digitalWrite(ledIO, HIGH);
      beep(2, 150);
      delay(500);
      digitalWrite(ledIO, LOW);
      delay(200);
      digitalWrite(ledIO, InOutState);
    } else {
      Serial.println("Thất bại");

      lcd.print("Khong hop le!");

      // Nháy đèn chậm và 1 tiếng bíp ngắn
      digitalWrite(ledIO, HIGH);
      beep(1, 100);
      delay(300);
      digitalWrite(ledIO, LOW);
      delay(200);
      digitalWrite(ledIO, InOutState);
    }
  } else {
    Serial.println("Lỗi khi đọc phản hồi JSON");

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Loi phan hoi");
  }
  delay(2000);
  lcd.clear();
  lcd.setCursor(0 ,0);
  lcd.print("Diem danh");
  lcd.setCursor(0, 1);
  lcd.print("Hay quet the...");
}

bool publishMessage(const char* topic, const char* payload, bool retained) {
  if (client.publish(topic, payload, retained)) {
    Serial.println("Gửi MQTT thành công");
    return true;
  } else {
    Serial.println("Gửi MQTT thất bại");
    return false;
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(buzzer,OUTPUT);
  digitalWrite(buzzer,LOW);
  pinMode(btnIO,INPUT_PULLUP);
  pinMode(ledIO,OUTPUT);
  pinMode(On_Board_LED_PIN,OUTPUT);
  Wire.begin(13, 14);
  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("Diem danh");
  lcd.setCursor(3, 1);
  lcd.print("hoc sinh ^_^");

  SPI.begin();
  rfid.PCD_Init();

  setup_wifi();

  espClient.setInsecure();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect_mqtt();
  }
  client.loop();

  if(digitalRead(btnIO)==LOW){
    if(btnIOState==HIGH){
      if(millis()-timeDelay>500){
        //Thực hiện lệnh
        InOutState = !InOutState;
        digitalWrite(ledIO,InOutState);
        timeDelay=millis();
      }
      btnIOState=LOW;
    }
  }else{
    btnIOState=HIGH;
  }

  // Kiểm tra có thẻ mới không
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    return;
  }

  // Lấy UID
  uidString = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    uidString += String(rfid.uid.uidByte[i] < 0x10 ? "0" : "");
    uidString += String(rfid.uid.uidByte[i], HEX);
  }
  uidString.toUpperCase();

  DynamicJsonDocument doc(1024);
  doc["id"]= uidString;
  doc["state"]= InOutState? "R" : "V";
  char mqtt_message[128];
  serializeJson(doc,mqtt_message);
  Serial.println(String("Data: ") + mqtt_message);
  publishMessage("rfid/check", mqtt_message, true);

  delay(2000); // tránh lặp lại UID nhiều lần
}
