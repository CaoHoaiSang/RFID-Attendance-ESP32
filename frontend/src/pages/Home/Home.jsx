import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Home.css";

const Home = () => {
  const url = "http://localhost:3000";
  const [list, setList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCard, setNewCard] = useState({ RFID: "", name: "" });
  const [editingCard, setEditingCard] = useState(null);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const { data } = await axios.get(`${url}/users`);
        data?.data ? setList(data.data) : toast.error("Error fetching data");
      } catch (error) {
        toast.error("Failed to fetch data");
      }
    };
    fetchList();
  }, []);

  const handleDelete = async (RFID) => {
    try {
      await axios.delete(`${url}/users/${RFID}`);
      setList((prevList) => prevList.filter((item) => item.RFID !== RFID));
      toast.success("Student deleted successfully");
    } catch (error) {
      toast.error("Failed to delete student");
    }
  };

  const handleSave = async () => {
    if (!newCard.RFID || !newCard.name) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const method = editingCard ? "put" : "post";
      const endpoint = editingCard ? `${url}/users/${editingCard.RFID}` : `${url}/users`;
      const response = await axios[method](endpoint, newCard);

      if (editingCard) {
        setList((prevList) =>
          prevList.map((item) => (item.RFID === editingCard.RFID ? newCard : item))
        );
        toast.success("Card updated successfully");
      } else {
        setList((prevList) => [...prevList, response.data.data]);
        toast.success("Card added successfully");
      }

      setShowModal(false);
      setNewCard({ RFID: "", name: "" });
      setEditingCard(null);
    } catch (error) {
      toast.error("Failed to save card");
    }
  };

  const openEditModal = (card = { RFID: "", name: "" }) => {
    setNewCard({ RFID: card.RFID, name: card.name });
    setEditingCard(card.RFID ? card : null);
    setShowModal(true);
  };

  return (
    <div className="history">
      <div className="history-header">
        <h3>DANH SÁCH HỌC SINH</h3>
        <button className="btn btn-primary" onClick={() => openEditModal()}>
          Thêm
        </button>
      </div>
      <div className="history-bottom">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2 px-4">STT</th>
              <th className="py-2 px-4">ID Card</th>
              <th className="py-2 px-4">Họ và Tên</th>
              <th className="py-2 px-4">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {list.length ? (
              list.map((item, index) => (
                <tr key={item.RFID}>
                  <td className="py-2 px-4">{index + 1}</td>
                  <td className="py-2 px-4">{item.RFID}</td>
                  <td className="py-2 px-4">{item.name}</td>
                  <td className="py-2 px-4">
                    <button className="btn btn-warning" onClick={() => openEditModal(item)}>
                      Sửa
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(item.RFID)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-2 px-4 text-center">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>{editingCard ? "Chỉnh sửa thẻ" : "Thêm thẻ"}</h3>
            <div className="input-group">
              <input
                type="text"
                placeholder="Mã thẻ"
                value={newCard.RFID}
                onChange={(e) => setNewCard({ ...newCard, RFID: e.target.value })}
                disabled={!!editingCard}
              />
              <input
                type="text"
                placeholder="Họ và tên"
                value={newCard.name}
                onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Đóng
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editingCard ? "Cập nhật" : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
