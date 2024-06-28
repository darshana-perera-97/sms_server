import React, { useState } from "react";
import Upload from "./Upload";

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

      const data = await response.json();
      console.log("Data written successfully:", data);
      alert("Data written successfully");
    } catch (error) {
      console.error("Error writing data:", error);
      alert("Error writing data");
    }
  };

  return (
    <div>
      <h1>Write Data to Firebase</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Contact Number (Designation): </label>
          <input
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Message: </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <button type="submit">Write Data</button>
      </form>
      <Upload />
    </div>
  );
};

export default Design;
