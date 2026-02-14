"use client";

import { useEffect, useState } from "react";

export default function LocationsManager() {
  const [warehouses, setWarehouses] = useState([]);
  const [containers, setContainers] = useState([]);
  const [err, setErr] = useState("");

  async function reload() {
    setErr("");
    const [w, c] = await Promise.all([
      fetch("/api/warehouses").then((r) => r.json()),
      fetch("/api/containers").then((r) => r.json()),
    ]);
    setWarehouses(w.warehouses || []);
    setContainers(c.containers || []);
  }

  useEffect(() => {
    reload();
  }, []);

async function createWarehouse(e) {
  e.preventDefault();
  setErr("");

  const formEl = e.currentTarget;           // ✅ сохраняем ссылку на форму
  const form = new FormData(formEl);

  const payload = {
    name: form.get("name"),
    address: form.get("address"),
    comment: form.get("comment"),
  };

  const res = await fetch("/api/warehouses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    setErr(data.error || "Ошибка создания склада");
    return;
  }

  formEl.reset();                           // ✅ безопасно
  await reload();
}

 async function createContainer(e) {
  e.preventDefault();
  setErr("");

  const formEl = e.currentTarget; // ✅ сохраняем форму сразу
  const form = new FormData(formEl);

  const payload = {
    warehouseId: form.get("warehouseId"),
    parentId: form.get("parentId") || null,
    name: form.get("name"),
    qrCode: form.get("qrCode"), // может быть пустым — сервер сгенерит
    comment: form.get("comment"),
  };

  const res = await fetch("/api/containers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    setErr(data.error || "Ошибка создания контейнера");
    return;
  }

  formEl.reset(); // ✅ теперь не null
  await reload();
}

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 900 }}>
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <section style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <h2>Добавить склад</h2>
        <form onSubmit={createWarehouse} style={{ display: "grid", gap: 8 }}>
          <input name="name" placeholder="Название склада" style={{ padding: 8 }} />
          <input name="address" placeholder="Адрес" style={{ padding: 8 }} />
          <input name="comment" placeholder="Комментарий" style={{ padding: 8 }} />
          <button style={{ padding: "8px 12px", width: 180 }}>Создать склад</button>
        </form>

        <div style={{ marginTop: 12, opacity: 0.8 }}>
          Складов: {warehouses.length}
        </div>
      </section>

      <section style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <h2>Добавить контейнер</h2>
        <form onSubmit={createContainer} style={{ display: "grid", gap: 8 }}>
          <select name="warehouseId" style={{ padding: 8 }}>
            <option value="">Выбери склад</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          <select name="parentId" style={{ padding: 8 }}>
            <option value="">Родительский контейнер (необязательно)</option>
            {containers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (QR: {c.qrCode})
              </option>
            ))}
          </select>

          <input name="name" placeholder="Название контейнера" style={{ padding: 8 }} />
          <input name="comment" placeholder="Комментарий" style={{ padding: 8 }} />

          <button style={{ padding: "8px 12px", width: 200 }}>Создать контейнер</button>
        </form>

        <div style={{ marginTop: 12, opacity: 0.8 }}>
          Контейнеров: {containers.length}
        </div>
      </section>
    </div>
  );
}