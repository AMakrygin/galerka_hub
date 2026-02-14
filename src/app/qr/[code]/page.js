import QrView from "@/components/QrView";

export default async function QrPage({ params }) {
  const res = await fetch(`http://localhost:3000/api/qr/${params.code}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Контейнер не найден</h1>
        <div>QR: {params.code}</div>
      </main>
    );
  }

  const { container } = await res.json();

  return (
    <main style={{ padding: 24 }}>
      <h1>{container.name}</h1>

      {/* Текст */}
      <div>QR: {container.qrCode}</div>

      {/* Картинка QR */}
      <QrView value={container.qrCode} />

      <div>Склад: {container.warehouse?.name}</div>

      <h2 style={{ marginTop: 16 }}>Что внутри</h2>
      {container.props.length === 0 ? (
        <div>Пусто</div>
      ) : (
        <ul>
          {container.props.map((p) => (
            <li key={p.id}>
              {p.name} — {p.status}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}