"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // добавь вверху файла

export default function ActorsManager() {
  const [actors, setActors] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function reload() {
    const data = await fetch("/api/actors").then((r) => r.json());
    setActors(data.actors || []);
  }

  useEffect(() => {
    reload();
  }, []);

  async function createActor(e) {
    e.preventDefault();
    setErr("");
    setOk("");

    const formEl = e.currentTarget; // важно: сохраняем ссылку
    const form = new FormData(formEl);

    const payload = {
      name: form.get("name"),
      email: form.get("email"),
    };

    const res = await fetch("/api/actors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error || "Ошибка");
      return;
    }

    formEl.reset();
    setOk("Актёр добавлен");
    await reload();
  }

  return (
    <div style={{ maxWidth: 700 }}>
      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}
      {ok && <div style={{ color: "green", marginBottom: 12 }}>{ok}</div>}

      <form onSubmit={createActor} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <input name="name" placeholder="Имя актёра" style={{ padding: 8, minWidth: 220 }} />
        <input name="email" placeholder="Email (уникальный)" style={{ padding: 8, minWidth: 260 }} />
        <button style={{ padding: "8px 12px" }}>Добавить</button>
      </form>

      <div style={{ opacity: 0.8, marginBottom: 8 }}>Всего: {actors.length}</div>

<ul>
  {actors.map((a) => (
    <li key={a.id} style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span>
          <strong>{a.name}</strong> — {a.email}
        </span>

        <Link
          href={`/actors/${a.id}`}
          style={{
            padding: "6px 10px",
            border: "1px solid #ddd",
            borderRadius: 10,
            textDecoration: "none",
            color: "black",
            background: "#fafafa",
            fontSize: 14,
          }}
        >
          Открыть карточку →
        </Link>
      </div>
    </li>
  ))}
</ul>
    </div>
  );
}