import React, { useState } from "react";
import Upload from "./Upload";
import "bootstrap/dist/css/bootstrap.min.css";
import SendMessageCSV from "./SendMessageCSV";

const Design = () => {
  const [designation, setDesignation] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:3002/write-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ designation, message }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      setMessage("");
      setDesignation("");
      const data = await response.json();
      console.log("Data written successfully:", data);
      alert("Data written successfully");
    } catch (error) {
      console.error("Error writing data:", error);
      alert("Error writing data");
    }
  };
  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,9}$/.test(value)) {
      setDesignation(value);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Send a Single Message</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="designation" className="form-label">
            Contact Number (Designation):
          </label>
          <input
            type="text"
            className="form-control"
            id="designation"
            value={designation}
            onChange={handleInputChange}
            required
            pattern="\d{0,9}"
            maxLength="9"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="message" className="form-label">
            Message:
          </label>
          <textarea
            className="form-control"
            placeholder="Line break with | charactor"
            id="message"
            rows="3"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Send Text Message
        </button>
      </form>
      <div className="mt-4">
        <Upload />
      </div>
      <SendMessageCSV />
    </div>
  );
};

export default Design;
