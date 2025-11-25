# Hệ thống Điểm Danh Sinh Viên bằng RFID & ESP32
# (IoT – MQTT – MongoDB – ReactJS)

##Giới thiệu
Dự án xây dựng hệ thống điểm danh tự động dành cho trường học. Mỗi sinh viên sử dụng thẻ RFID để điểm danh, dữ liệu được ESP32 đọc và gửi lên server qua giao thức MQTT. Hệ thống lưu trữ trên MongoDB và hiển thị trên giao diện ReactJS theo thời gian thực.

##Mục tiêu
 - Tự động hóa quá trình điểm danh.
 - Giảm thao tác thủ công, hạn chế sai sót.
 - Giúp giảng viên theo dõi danh sách và lịch sử điểm danh tức thời.
 - Ứng dụng trọn vẹn kiến thức IoT: thiết bị → mạng → server → giao diện.

##Công nghệ sử dụng
###Phần cứng:
 - ESP32
 - RFID RC522
 - RFID Tag

###Backend:
 - Node.js
 - MQTT Broker: HiveMQ Cloud
 - MongoDB

###Frontend:
 - ReactJS

##Chức năng chính
 - Đọc mã RFID bằng ESP32
 - Gửi dữ liệu điểm danh theo thời gian thực qua MQTT
 - Lưu trữ thông tin điểm danh trên MongoDB
 - Giao diện ReactJS hiển thị sinh viên & trạng thái điểm danh
 - Lịch sử điểm danh theo ngày
 - Tự động reconnect MQTT khi mất kết nối

##Thành tựu
 - Xử lý điểm danh theo thời gian thực (<1 giây) thông qua MQTT
 - Bảng điều khiển trực quan với lịch sử hàng ngày và trạng thái học sinh
 - Loại bỏ việc điểm danh thủ công; tăng độ chính xác 100%
 - Kết nối ESP32–MQTT ổn định với khả năng tự động kết nối lại
 - Quy trình làm việc IoT toàn diện tích hợp: phần cứng → đám mây → giao diện người dùng