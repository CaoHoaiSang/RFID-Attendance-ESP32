import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./History.css";

const History = () => {
  const [fromDate, setFromDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toDate, setToDate] = useState("");
  const [toTime, setToTime] = useState("");
  const [historyList, setHistoryList] = useState([]);
  const [fullHistoryList, setFullHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/logs");
        const sortedData = data.data?.sort(
          (a, b) => new Date(b.createAt.$date || b.createAt) - new Date(a.createAt.$date || a.createAt)
        );
        setFullHistoryList(sortedData);
        setHistoryList(sortedData);
      } catch (error) {
        toast.error("Failed to fetch history");
      }
    };
    fetchHistoryData();
  }, []);

  const fetchHistory = () => {
    if (!fromDate || !toDate) {
      toast.error("Please select a valid date range");
      return;
    }

    setLoading(true);
    const fromDateTime = new Date(`${fromDate}T${fromTime || "00:00"}`).getTime();
    const toDateTime = new Date(`${toDate}T${toTime || "23:59"}`).getTime();

    const filteredData = fullHistoryList.filter((item) => {
      const itemDate = new Date(item.createAt.$date || item.createAt).getTime();
      return itemDate >= fromDateTime && itemDate <= toDateTime;
    });

    setHistoryList(filteredData);
    setLoading(false);
  };

  const renderTableRows = () => {
    if (historyList.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="py-2 px-4 text-center">
            No records found
          </td>
        </tr>
      );
    }
    return historyList.map((item, index) => (
      <tr key={item._id}>
        <td className="py-2 px-4">{index + 1}</td>
        <td className="py-2 px-4">{item._id}</td>
        <td className="py-2 px-4">{item.RFID}</td>
        <td className="py-2 px-4">{item.name}</td>
        <td className="py-2 px-4">{item.state}</td>
        <td className="py-2 px-4">
          {item.createAt ? new Date(item.createAt.$date || item.createAt).toLocaleString() : "N/A"}
        </td>
      </tr>
    ));
  };

  return (
    <div className="history">
      <div className="history-header">
        <div className="history-header1">
          <label htmlFor="fromDate">Từ</label>
          <input id="fromDate" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <input type="time" value={fromTime} onChange={(e) => setFromTime(e.target.value)} />
        </div>
        <div className="history-header2">
          <label htmlFor="toDate">Đến</label>
          <input id="toDate" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          <input type="time" value={toTime} onChange={(e) => setToTime(e.target.value)} />
        </div>
        <button onClick={fetchHistory} disabled={loading}>
          {loading ? "Loading..." : "Lọc"}
        </button>
      </div>
      <div className="history-bottom">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2 px-4">STT</th>
              <th className="py-2 px-4">ID</th>
              <th className="py-2 px-4">ID CARD</th>
              <th className="py-2 px-4">HỌ VÀ TÊN</th>
              <th className="py-2 px-4">STATE</th>
              <th className="py-2 px-4">THỜI GIAN VÀO</th>
            </tr>
          </thead>
          <tbody>{renderTableRows()}</tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
