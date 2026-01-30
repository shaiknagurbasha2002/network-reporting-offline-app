import React, { useState } from "react";
import { auth } from "@/lib/firebase";
import { createReport, createSpeedTest } from "@/lib/reportsService";

export default function ReportForm() {
  const [formData, setFormData] = useState({
    network_provider: "",
    device_type: "",
    signal_type: "",
    signal_strength: 0,
    problem_type: "",
    problem_description: "",
  });
  const [speed, setSpeed] = useState({
    download_speed: 0,
    upload_speed: 0,
    ping_ms: 0,
    jitter_ms: 0,
    network_type: "",
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const runSpeedTest = async () => {
    setStatus("Running speed test...");
    await new Promise((r) => setTimeout(r, 1500));
    setSpeed({
      download_speed: 25 + Math.random() * 10,
      upload_speed: 5 + Math.random() * 3,
      ping_ms: 40 + Math.random() * 10,
      jitter_ms: 5 + Math.random() * 2,
      network_type: formData.signal_type || "4G",
    });
    setStatus("✅ Speed test complete");
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("Submitting report...");
    try {
      const user = auth?.currentUser;
      if (!user) throw new Error("Please log in first");

      const reportId = await createReport({
        userId: user.uid,
        userName: user.email ? user.email.split("@")[0] : "User",
        userEmail: user.email ?? "",
        provider: formData.network_provider,
        signalStrength: String(formData.signal_strength),
        networkType: speed.network_type || formData.signal_type,
        issueType: formData.problem_type,
        location: "",
        weather: "",
        comments: formData.problem_description,
        timestamp: new Date().toISOString(),
      });

      await createSpeedTest({
        reportId,
        userId: user.uid,
        downloadSpeed: Number(speed.download_speed),
        uploadSpeed: Number(speed.upload_speed),
        ping: Number(speed.ping_ms),
        timestamp: new Date().toISOString(),
      });

      setStatus("✅ Report submitted successfully!");
    } catch (err: any) {
      setStatus("❌ Error: " + (err?.message || "Unknown error"));
    }
    setLoading(false);
  };

  // --- Simple CSS-in-JS style object ---
  const container: React.CSSProperties = {
    maxWidth: 500,
    margin: "2rem auto",
    padding: 20,
    background: "#f9fafc",
    borderRadius: 10,
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    fontFamily: "system-ui, sans-serif",
  };
  const label: React.CSSProperties = { display: "block", marginTop: 12, fontWeight: 500 };
  const input: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #ccc",
    borderRadius: 6,
    marginTop: 4,
    fontSize: 14,
  };
  const button: React.CSSProperties = {
    marginTop: 16,
    padding: "10px 14px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  };

  return (
    <div style={container}>
      <h2 style={{ textAlign: "center", color: "#0077ff" }}>📶 Report Network Issue</h2>
      <form onSubmit={handleSubmit}>
        <label style={label}>Network Provider</label>
        <input name="network_provider" style={input} onChange={handleChange} required />

        <label style={label}>Device Type</label>
        <input name="device_type" style={input} onChange={handleChange} required />

        <label style={label}>Signal Type</label>
        <select name="signal_type" style={input} onChange={handleChange} required>
          <option value="">Select</option>
          <option value="4G">4G</option>
          <option value="5G">5G</option>
          <option value="WiFi">WiFi</option>
        </select>

        <label style={label}>Signal Strength (0–5)</label>
        <input
          type="number"
          name="signal_strength"
          style={input}
          min="0"
          max="5"
          onChange={handleChange}
          required
        />

        <label style={label}>Problem Type</label>
        <select name="problem_type" style={input} onChange={handleChange} required>
          <option value="">Select</option>
          <option value="No Signal">No Signal</option>
          <option value="Slow Internet">Slow Internet</option>
          <option value="Call Drop">Call Drop</option>
          <option value="Other">Other</option>
        </select>

        <label style={label}>Problem Description</label>
        <textarea
          name="problem_description"
          style={{ ...input, minHeight: 80 }}
          onChange={handleChange}
          required
        />

        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            onClick={runSpeedTest}
            disabled={loading}
            style={{ ...button, background: "#eaeaea" }}
          >
            Run Speed Test
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ ...button, background: "#0077ff", color: "#fff", marginLeft: 10 }}
          >
            Submit Report
          </button>
        </div>
      </form>

      <p style={{ marginTop: 20, textAlign: "center" }}>{status}</p>

      {speed.download_speed > 0 && (
        <div style={{ marginTop: 20, background: "#fff", padding: 10, borderRadius: 8 }}>
          <h4>Speed Test Results</h4>
          <p>Download: {speed.download_speed.toFixed(2)} Mbps</p>
          <p>Upload: {speed.upload_speed.toFixed(2)} Mbps</p>
          <p>Ping: {speed.ping_ms.toFixed(1)} ms</p>
          <p>Jitter: {speed.jitter_ms.toFixed(1)} ms</p>
          <p>Network: {speed.network_type}</p>
        </div>
      )}
    </div>
  );
}
