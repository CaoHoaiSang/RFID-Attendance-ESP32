const express = require("express");
const mqtt = require("mqtt");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const mongoURL = "mongodb+srv://haoda:PsLp8YoJq35rS5bN@anhhao.uqdvc.mongodb.net/sensor";
const mqttURl = "81c1b84919354c788e2869c85d29a2ec.s1.eu.hivemq.cloud"; //Thay bằng url của mình
const mqttUsername = "anhhao"; //Thay bằng tên của mình
const mqttPass = "1212123Aa"; //Thay bằng mật khẩu của mình

const UserSchema = mongoose.Schema({
    RFID: String,
    name: String
});
const LogSchema = mongoose.Schema({
    RFID: String,
    name: String,
    state: { type: String, default: "V"},
    createAt: { type: Date, default: Date.now }
});

const User = mongoose.model("users", UserSchema);
const Log = mongoose.model("logs", LogSchema);

mongoose.connect(mongoURL)
    .then(() => console.log("Connected to database..."))
    .catch((err) => console.log("Failed to connect to database."));

const options = {
    host: mqttURl,
    port: 8883,
    protocol: 'mqtts',
    username: mqttUsername, 
    password: mqttPass  
}

const client = mqtt.connect(options);
//Lấy tất cả user
app.get("/users", async(req, res) => {
    try {
        const userList = await User.find();
        res.status(200).json({
            status: "Success.",
            data: userList
        })
    } catch (error) {
        res.status(400).json({status: "Failed to get user."});
    }
})
//Lấy user theo RFID
app.get("/users/:RFID", async (req, res) => {
    try {
        const user = await User.findOne({RFID: req.params.RFID});
        res.status(200).json({
            message: "Success.",
            data: user
        })
    } catch (error) {
        res.status(400).json({status: "Failed to get user."});
    }
})
// Thêm user
app.post("/users", async (req, res) => {
    try {
        const newUser = new User({
            RFID: req.body.RFID,
            name: req.body.name
        });
        const user = await newUser.save(); // Lưu user vào MongoDB
        res.status(200).json({message: "Success.", data: user});
    } catch (error) {
        res.status(400).json({message: "Failed to add user.", error: error});
    }
});

// Cập nhật user
app.put("/users/:RFID", async (req, res) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { RFID: req.params.RFID }, // Điều kiện tìm user
            { $set: req.body }, // Cập nhật thông tin user từ body
            { new: true } // Trả về user đã được cập nhật
        );
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User updated successfully", data: updatedUser });
    } catch (error) {
        res.status(400).json({ message: "Failed to update user.", error: error });
    }
});


//Xóa user dựa theo RFID
app.delete("/users/:RFID", async (req, res) => {
    try {
        const response = await User.findOneAndDelete({RFID: req.params.RFID});
        res.status(200).json({message: "Success."});
    } catch (error) {
        res.status(400).json({message: "Failed to delete user.", error: error});
    }
})
//Lấy tất cả log
app.get("/logs", async (req, res) => {
    const logList = await Log.find();
    res.status(200).json({
        message: "Success.",
        data: logList
    }) 
})
//Lấy log theo RFID
app.get("/logs/:RFID", async (req, res) => {
    try {
        const logList = await Log.find({RFID: req.params.RFID});
        res.status(200).json({
            message: "Success.",
            data: logList
        })
    } catch (error) {
        res.status(400).json({message: "Failed to get log.", error: error});
    }
})
//Thêm log 
app.post("/logs", async (req, res) => {
    try {
        const newLog = new Log({
            RFID: req.body.RFID,
            name: req.body.name,
            state: req.body.state
        });
        
        const response = newLog.save();
        res.status(200).json({message: "Success", data: data});
    } catch (error) {
        res.status(400).json({message: "Failed to save.", error: error});
    }
})
//Xóa log theo id
app.delete("/logs/:id", async (req, res) => {
    const response = await Log.findByIdAndDelete(req.params.id);
    if(response) {
        res.status(200).json({
            message: "Success."
        })
    }
})
//Xoá log theo RFID
app.delete("/logs/RFID/:RFID", async(req, res) => {
    try {
        const response = await Log.deleteMany({ RFID: req.params.RFID });
        if(response) {
            res.status(200).json({
                message: "Success."
            })
        }
    } catch (error) {
        res.status(400).json({message: "Failed.", error: error});
    }
})

client.on("connect", () => {
    console.log("Connected to HiveMQ with authentication");
    client.subscribe("rfid/check");
});

client.on("message", async (topic, message) => {
    console.log(`Received message from topic ${topic}: ${message.toString()}`);
    const data = JSON.parse(message.toString());
    try {
        const user = await User.findOne({ RFID: data.id });

        if (user) {

            const newLog = new Log({
                RFID: data.id,
                name: user.name,
                state: data.state
            });
            await newLog.save();

            const responsePayload = {
                status: "success",
                name: user.name,
                RFID: data.id
            };

            client.publish("rfid/response", JSON.stringify(responsePayload));
            console.log("Đã phản hồi thành công về rfid/response:", responsePayload);
        } else {
            const responsePayload = {
                status: "fail"
            };
            client.publish("rfid/response", JSON.stringify(responsePayload));
            console.log("RFID không tồn tại. Đã gửi phản hồi thất bại.");
        }
    } catch (error) {
        console.error("Lỗi xử lý message:", error);
    }
});


app.listen(3000, () => {
    console.log("Server is running on port 3000...");
})