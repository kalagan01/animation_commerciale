import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080/api";

const initialForm = {
  title: "",
  supervisor: "",
  agent: ""
};

function App() {
  const [form, setForm] = useState(initialForm);
  const [workItems, setWorkItems] = useState([]);
  const [audit, setAudit] = useState([]);
  const [message, setMessage] = useState("");

  const fetchQueue = async () => {
    const response = await fetch(`${API_BASE}/work-items`);
    const data = await response.json();
    setWorkItems(data);
  };

  const fetchAudit = async () => {
    const response = await fetch(`${API_BASE}/audit`);
    const data = await response.json();
    setAudit(data);
  };

  useEffect(() => {
    fetchQueue();
    fetchAudit();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const createWorkItem = async () => {
    const response = await fetch(`${API_BASE}/work-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        supervisor: form.supervisor
      })
    });
    if (response.ok) {
      setMessage("Work item créé.");
      setForm({ ...form, title: "" });
      await fetchQueue();
      await fetchAudit();
    }
  };

  const assignWorkItem = async (id) => {
    const response = await fetch(`${API_BASE}/work-items/${id}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent: form.agent })
    });
    if (response.ok) {
      setMessage("Work item assigné.");
      await fetchQueue();
      await fetchAudit();
    }
  };

  const completeWorkItem = async (id) => {
    const response = await fetch(`${API_BASE}/work-items/${id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent: form.agent })
    });
    if (response.ok) {
      setMessage("Work item complété.");
      await fetchQueue();
      await fetchAudit();
    }
  };

  const assignNext = async () => {
    const response = await fetch(`${API_BASE}/agent/next`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent: form.agent })
    });
    if (response.ok) {
      setMessage("Prochaine tâche assignée par l'agent.");
      await fetchQueue();
      await fetchAudit();
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
      <h1>Sprint 1 — Work Queue</h1>
      <p>Frontend React connecté au backend Spring Boot (SQLite).</p>

      <section style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ddd" }}>
        <h2>Supervisor</h2>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          Titre du work item
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
          />
        </label>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          Superviseur
          <input
            name="supervisor"
            value={form.supervisor}
            onChange={handleChange}
            style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
          />
        </label>
        <button onClick={createWorkItem}>Créer</button>
      </section>

      <section style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ddd" }}>
        <h2>Agent</h2>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          Nom de l'agent
          <input
            name="agent"
            value={form.agent}
            onChange={handleChange}
            style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
          />
        </label>
        <button onClick={assignNext}>Prendre la prochaine tâche</button>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Work Queue</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>ID</th>
              <th style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>Titre</th>
              <th style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>Statut</th>
              <th style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>Assigné à</th>
              <th style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workItems.map((item) => (
              <tr key={item.id}>
                <td style={{ padding: "0.5rem 0" }}>{item.id}</td>
                <td>{item.title}</td>
                <td>{item.status}</td>
                <td>{item.assignedTo || "-"}</td>
                <td>
                  <button onClick={() => assignWorkItem(item.id)} style={{ marginRight: "0.5rem" }}>
                    Assigner
                  </button>
                  <button onClick={() => completeWorkItem(item.id)}>Compléter</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Audit</h2>
        <ul>
          {audit.map((entry) => (
            <li key={entry.id}>
              [{entry.occurredAt}] WorkItem {entry.workItemId} — {entry.actionType} par {entry.actor}
            </li>
          ))}
        </ul>
      </section>

      {message && <p style={{ marginTop: "1rem", color: "green" }}>{message}</p>}
    </div>
  );
}

export default App;
