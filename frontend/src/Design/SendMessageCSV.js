import React, { useState } from "react";

const SendMessageCSV = () => {
  const [file, setFile] = useState(null); // To store the uploaded file
  const [message, setMessage] = useState(""); // To store the text message
  const [status, setStatus] = useState(""); // To display API response messages
  const [loading, setLoading] = useState(false); // Loading state for API call

  // Handle file upload
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle message input
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  // Submit form data to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !message) {
      setStatus("Please upload a file and enter a message.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("message", message);

    try {
      setLoading(true);
      const response = await fetch("http://localhost:3002/send-message-csv", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data.message);
      } else {
        const errorData = await response.json();
        setStatus(errorData.error || "An error occurred while processing.");
      }
    } catch (error) {
      setStatus("An error occurred while connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Send Message to Numbers from CSV</h2>
      <form onSubmit={handleSubmit} className="mt-3">
        {/* Message Input */}
        <div className="form-group mb-3">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            className="form-control"
            rows="4"
            placeholder="Enter your message here"
            value={message}
            onChange={handleMessageChange}
          ></textarea>
        </div>

        {/* File Input */}
        <div className="form-group mb-3">
          <label htmlFor="file">Upload CSV</label>
          <input
            type="file"
            id="file"
            className="form-control"
            accept=".csv"
            onChange={handleFileChange}
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Processing..." : "Send Messages"}
        </button>
      </form>

      {/* Status Message */}
      {status && <div className="alert mt-3">{status}</div>}
    </div>
  );
};

export default SendMessageCSV;
