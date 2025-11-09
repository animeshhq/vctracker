import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function App() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData(q = "") {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("per_page", "100");

      const res = await fetch(`${API_BASE}/api/vcs?${params.toString()}`);
      const text = await res.text();

      try {
        const json = JSON.parse(text);
        setData(json.data || []);
      } catch (err) {
        console.error("Raw response:", text);
        setError("Server didn't return JSON. Check backend logs.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(query);
  };

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
          padding: "1.5rem",
        }}
      >
        <h1 style={{ fontSize: "1.6rem", marginBottom: "1rem" }}>
          Foreign VC Registry
        </h1>

        <form
          onSubmit={handleSearch}
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "1.5rem",
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by VC name or country..."
            style={{
              flex: 1,
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
          />
          <button
            type="submit"
            style={{
              background: "#0f172a",
              color: "#fff",
              padding: "10px 16px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>

        {loading && <p>Loading...</p>}
        {error && (
          <p style={{ color: "red", background: "#fee2e2", padding: "8px" }}>
            {error}
          </p>
        )}

        {!loading && !error && (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.9rem",
                minWidth: "900px",
              }}
            >
              <thead style={{ background: "#f1f5f9" }}>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px" }}>#</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Name</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>
                    Registration No.
                  </th>
                  <th style={{ textAlign: "left", padding: "8px" }}>
                    Contact Person
                  </th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Address</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Email</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Phone</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Country</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>
                    Validity From
                  </th>
                  <th style={{ textAlign: "left", padding: "8px" }}>
                    Validity To
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      style={{
                        textAlign: "center",
                        padding: "1rem",
                        color: "#64748b",
                      }}
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  data.map((row, i) => (
                    <tr
                      key={row._id || i}
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <td style={{ padding: "8px", color: "#94a3b8" }}>
                        {i + 1}
                      </td>
                      <td style={{ padding: "8px" }}>
                        {row[
                          "Registered Foreign Venture Capital Investors as on Nov 08, 2025"
                        ] ||
                          row.name ||
                          "N/A"}
                      </td>
                      <td style={{ padding: "8px" }}>
                        {row["Registration No."] ||
                          row.registration_no ||
                          "N/A"}
                      </td>
                      <td style={{ padding: "8px" }}>
                        {row["Contact Person"] || row.contact_person || "N/A"}
                      </td>
                      <td style={{ padding: "8px" }}>
                        {row["Address"] || row.address || "N/A"}
                      </td>
                      <td style={{ padding: "8px" }}>
                        {row["Email-Id"] || row.email || "N/A"}
                      </td>
                      <td style={{ padding: "8px" }}>
                        {row["Telephone"] || row.phone || "N/A"}
                      </td>
                      <td style={{ padding: "8px" }}>
                        {row["Country"] || row.country || "N/A"}
                      </td>
                      <td style={{ padding: "8px" }}>
                        {row["From"] || row["Validity From"] || "N/A"}
                      </td>
                      <td style={{ padding: "8px" }}>
                        {row["To"] || row["Validity To"] || "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
