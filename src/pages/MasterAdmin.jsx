import React, { useState, useEffect, useContext, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { AdminContext } from "../App";
import "../assets/masteradmin.css";

const API_BASE =
  process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api/admin`
    : "http://localhost:4000/api/admin";

const MasterAdmin = () => {
  const { isAdmin } = useContext(AdminContext);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [opId, setOpId] = useState(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const safeDate = (d) => {
    if (!d) return "—";
    const t = new Date(d);
    return isNaN(t.getTime()) ? "—" : t.toLocaleString();
  };

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/users`, { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (e) {
      console.error(e);
      setError("Unexpected error fetching users.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    setOpId(userId);
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (e) {
      console.error(e);
      setError("Unexpected error deleting user.");
    } finally {
      setOpId(null);
    }
  };

  const handleToggleUser = async (userId, currentlyDisabled) => {
    setOpId(userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, banned_until: currentlyDisabled ? null : "forever" } : u))
    );
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enable: currentlyDisabled }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (e) {
      console.error(e);
      setError("Failed to update user status.");
      fetchUsers(); // rollback
    } finally {
      setOpId(null);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword.trim()) {
      setPasswordMessage("Password cannot be empty.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/change-key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newKey: newPassword.trim() }),
      });
      if (!res.ok) throw new Error(await res.text());
      setPasswordMessage("✅ Secret admin password changed!");
      setNewPassword("");
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordMessage("");
      }, 1200);
    } catch {
      setPasswordMessage("❌ Failed to change password.");
    }
  };

  if (!isAdmin) {
    return <p style={{ textAlign: "center", color: "red" }}>Access Denied</p>;
  }

  return (
    <div className="container masteradmin-container">
      <Sidebar />
      <main className="main-content">
        <h1>Master Admin - Auth Users</h1>
        {error && <p className="masteradmin-error">{error}</p>}

        <div className="card">
          <button className="btn-primary" onClick={() => setShowPasswordModal(true)}>
            🔑 Change Secret Admin Password
          </button>
          <button className="btn" onClick={fetchUsers} disabled={loading}>
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        <div className="card">
          <table className="masteradmin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5">No users found 👀</td></tr>
              ) : (
                users.map((u) => {
                  const disabled = u.banned_until && u.banned_until !== "none";
                  return (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.email}</td>
                      <td>{safeDate(u.created_at)}</td>
                      <td>{disabled ? "Disabled ❌" : "Active ✅"}</td>
                      <td>
                        <button className="btn btn-danger"
                          onClick={() => handleDelete(u.id)}
                          disabled={opId === u.id}>
                          {opId === u.id ? "Deleting…" : "Delete"}
                        </button>
                        <button className={`btn ${disabled ? "btn-success" : "btn-warning"}`}
                          onClick={() => handleToggleUser(u.id, disabled)}
                          disabled={opId === u.id}
                          style={{ marginLeft: 8 }}>
                          {opId === u.id ? (disabled ? "Enabling…" : "Disabling…") : (disabled ? "Enable" : "Disable")}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {showPasswordModal && (
          <div className="modal-backdrop">
            <div className="modal">
              <h2>Change Secret Admin Password</h2>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              {passwordMessage && <p>{passwordMessage}</p>}
              <div>
                <button className="modal-btn confirm" onClick={handlePasswordChange}>Confirm</button>
                <button className="modal-btn cancel" onClick={() => setShowPasswordModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MasterAdmin;
