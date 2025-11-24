import React from "react";
import "./Infomation.css";
import { assets } from "../../assets/assets";

const Infomation = () => {
  return (
    <div className="info">
      <div className="info-header">
        <div className="info-left">
          <img src={assets.logo} alt="Logo" />
        </div>
        <div className="info-right">
          <h1>TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP</h1>
          <h2>THÀNH PHỐ HỒ CHÍ MINH</h2>
        </div>
      </div>
      <h3>ĐỀ TÀI: HỆ THỐNG QUẢN LÝ ĐIỂM DANH SINH VIÊN BẰNG RFID</h3>
      <div className="info-member">
        <p>Giáo viên bộ môn: Trần Thị Minh Khoa</p>
        <p>Lớp: DHCNTT17A</p>
        <p>Nhóm: 23</p>
        <p>
          Thành viên: <br />
          <span className="member-list">
            - Đặng Anh Hào_22646811  <br />
            - Đỗ Kiều Oanh_22647231 <br />
            - Cao Hoài Sang_22654021
          </span>
        </p>
      </div>
    </div>
  );
};

export default Infomation;
