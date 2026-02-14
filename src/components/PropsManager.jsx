"use client";

import { useEffect, useState } from "react";

export default function PropsManager() {
  const [containers, setContainers] = useState([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function loadContainers() {
    const data = await fetch("/api/containers").then((r) => r.json());
    setContainers(data.containers || []);
  }

  useEffect(() => {
    loadContainers();
  }, []);

  async function createProp(e) {
    e.preventDefault();
    setErr("");
    setOk("");

    const formEl = e.currentTarget; // важно: сохраняем ссылку
    const form = new FormData(formEl);

    const payload = {
      name: form.get("name"),
      inventoryNumber: form.get("inventoryNumber"),
      description: form.get("description"),
      containerId: form.get("containerId"),
    };

    const res = await fetch("/api/props/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error || "Ошибка");
      return;
    }

    const data = await res.json();
    setOk(`Создано: ${data.prop?.name || ""}`);
    formEl.reset();
  }

  return (
    <div style={{ maxWidth: 800 }}>
      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}
      {ok && <div style={{ color: "green", marginBottom: 12 }}>{ok}</div>}

      <form onSubmit={createProp} style={{ display: "grid", gap: 8 }}>
        <input name="name" placeholder="Название реквизита" style={{ padding: 8 }} />
        <input name="inventoryNumber" placeholder="Инв. номер (необязательно)" style={{ padding: 8 }} />
        <textarea name="description" placeholder="Описание (необязательно)" rows={3} style={{ padding: 8 }} />

        <select name="containerId" style={{ padding: 8 }}>
          <option value="">Выбери контейнер хранения</option>
          {containers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.warehouse?.name} / {c.name} (QR: {c.qrCode})
            </option>
          ))}
        </select>

        <button style={{ padding: "8px 12px", width: 220 }}>Добавить реквизит</button>
      </form>

      <div style={{ marginTop: 12, opacity: 0.8 }}>
        Контейнеров доступно: {containers.length}
      </div>
    </div>
  );
}