const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    RFID: String,
    name: String,
    state: String
})

const LogSchema = mongoose.Schema({
    RFID: String,
    name: String,
    state: String,
    createAt: { type: Date, default: Date.now }
})

exports.User = mongoose.model("users", UserSchema);
exports.Log = mongoose.model("logs", LogSchema);