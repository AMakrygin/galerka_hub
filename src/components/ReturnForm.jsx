"use client";

import { useEffect, useState } from "react";

export default function ReturnForm({ propId }) {
  const [containers, setContainers] = useState([]);
  const [containerId, setContainerId] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "" });

  useEffect(() => {
    fetch("/api/containers")
      .then((r) => r.json())
      .then((data) => setContainers(data.containers || []));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "" });

    const res = await fetch("/api/issues/return", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propId, containerId }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus({ loading: false, error: data.error || "Ошибка" });
      return;
    }

    window.location.reload();
  }

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Вернуть на склад</div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select
          value={containerId}
          onChange={(e) => setContainerId(e.target.value)}
          style={{ padding: 8, minWidth: 260 }}
        >
          <option value="">Выбери контейнер</option>
          {containers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.warehouse?.name} / {c.name}
            </option>
          ))}
        </select>

        <button disabled={!containerId || status.loading} type="submit" style={{ padding: "8px 12px" }}>
          Вернуть
        </button>
      </div>

      {status.error && <div style={{ marginTop: 8, color: "crimson" }}>{status.error}</div>}
    </form>
  );
}