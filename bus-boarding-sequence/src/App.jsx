import React, { useState } from "react";
import Papa from "papaparse";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";

const extractSeatNum = (seat) => parseInt(seat.match(/\d+/)[0], 10);

function App() {
  const [boardingOrder, setBoardingOrder] = useState([]);
  const [bookings, setBookings] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data.map((row) => ({
          id: parseInt(row.Booking_ID),
          seats: row.Seats.replace(/\s+/g, ",").split(",").filter(Boolean),
        }));

        parsed.forEach((b) => {
          b.farthest = Math.max(...b.seats.map(extractSeatNum));
        });

        const sorted = [...parsed].sort(
          (a, b) => b.farthest - a.farthest || a.id - b.id
        );

        setBookings(parsed);
        setBoardingOrder(sorted);
      },
    });
  };

  // Find the boarding position for a given booking ID
  const getBoardingPosition = (bookingId) => {
    const idx = boardingOrder.findIndex((b) => b.id === bookingId);
    return idx !== -1 ? idx + 1 : null;
  };

  const renderSeat = (label) => {
    const booking = bookings.find((b) => b.seats.includes(label));
    const seq = booking ? getBoardingPosition(booking.id) : null;

    return (
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="d-flex justify-content-center align-items-center rounded shadow-sm m-1"
        style={{
          width: "42px",
          height: "42px",
          fontSize: "12px",
          fontWeight: "bold",
          cursor: "pointer",
          backgroundColor: seq ? "rgba(255, 215, 0, 0.8)" : "rgba(255,255,255,0.08)",
          color: seq ? "black" : "#ccc",
          border: seq ? "2px solid gold" : "1px solid rgba(255,255,255,0.2)",
          transition: "all 0.3s ease",
        }}
        key={label}
        title={
          booking
            ? `Seat ${label} - Booking ${booking.id} (Boarding #${seq})`
            : `Seat ${label} - Available`
        }
      >
        {seq ? seq : label}
      </motion.div>
    );
  };

  const renderRow = (row) =>
    Array.from({ length: 20 }, (_, i) => renderSeat(`${row}${i + 1}`));

  return (
    <div
      className="min-vh-100 d-flex flex-column align-items-center py-4"
      style={{
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        color: "white",
      }}
    >
      <h1 className="fw-bold mb-3">🚌 Smart Bus Boarding System</h1>
      <p className="text-light mb-4">
        Upload a CSV to view the boarding order and seat mapping.
      </p>

      {/* File Upload */}
      <div
        className="p-4 rounded shadow-lg mb-4"
        style={{
          width: "90%",
          maxWidth: "700px",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(8px)",
        }}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="form-control bg-dark text-white border-light"
        />
      </div>

      {/* Boarding Order Table */}
      {boardingOrder.length > 0 && (
        <div
          className="p-4 rounded shadow-lg mb-4"
          style={{
            width: "90%",
            maxWidth: "900px",
            background: "rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(10px)",
          }}
        >
          <h3 className="text-warning text-center mb-3">🧾 Boarding Order</h3>
          <table className="table table-dark table-striped text-center">
            <thead>
              <tr className="text-warning">
                <th>#</th>
                <th>Booking ID</th>
                <th>Seats</th>
              </tr>
            </thead>
            <tbody>
              {boardingOrder.map((b, i) => (
                <tr key={b.id}>
                  <td>{i + 1}</td>
                  <td>{b.id}</td>
                  <td>{b.seats.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bus Layout */}
      <h3 className="text-center mb-3">🪑 Bus Seat Layout</h3>
      <div
        className="d-flex flex-column align-items-center p-3 rounded"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.2)",
          width: "fit-content",
        }}
      >
        {["A", "B", "C", "D"].map((row) => (
          <div className="d-flex mb-2" key={row}>
            {renderRow(row)}
          </div>
        ))}
      </div>

      <p className="text-center mt-3 text-light small">
        ⬆️ Front of Bus (A1–D1) | Rear at A20–D20 ⬇️
      </p>
    </div>
  );
}

export default App;
