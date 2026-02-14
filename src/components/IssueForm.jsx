"use client";

import { useEffect, useState } from "react";

export default function IssueForm({ propId, disabled }) {
  const [actors, setActors] = useState([]);
  const [actorUserId, setActorUserId] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "", ok: "" });

  useEffect(() => {
    fetch("/api/actors")
      .then((r) => r.json())
      .then((data) => setActors(data.actors || []))
      .catch(() => setActors([]));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "", ok: "" });

    const res = await fetch("/api/issues/issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propId, actorUserId, comment }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus({ loading: false, error: data.error || "Ошибка", ok: "" });
      return;
    }

    setStatus({ loading: false, error: "", ok: "Выдано!" });
    // обновим страницу, чтобы подтянулся новый статус/история
    window.location.reload();
  }

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Выдать реквизит</div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <select
          value={actorUserId}
          onChange={(e) => setActorUserId(e.target.value)}
          disabled={disabled || status.loading}
          style={{ padding: 8, minWidth: 240 }}
        >
          <option value="">Выбери актёра</option>
          {actors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.email})
            </option>
          ))}
        </select>

        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={disabled || status.loading}
          placeholder="Комментарий (необязательно)"
          style={{ padding: 8, minWidth: 260 }}
        />

        <button
          type="submit"
          disabled={disabled || status.loading || !actorUserId}
          style={{ padding: "8px 12px" }}
        >
          {status.loading ? "Выдаю..." : "Выдать"}
        </button>
      </div>

      {status.error && <div style={{ marginTop: 8, color: "crimson" }}>{status.error}</div>}
      {status.ok && <div style={{ marginTop: 8, color: "green" }}>{status.ok}</div>}

      {disabled && <div style={{ marginTop: 8, opacity: 0.7 }}>Сейчас предмет не на складе или списан.</div>}
    </form>
  );
}