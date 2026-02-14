import Link from "next/link";

export default async function ActorPage({ params }) {
  const { id } = await params; // Next 16: params = Promise

  const res = await fetch(`http://localhost:3000/api/actors/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Актёр не найден</h1>
      </main>
    );
  }

  const { actor, openIssues, history } = await res.json();

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ margin: 0 }}>{actor.name}</h1>
        <Link href="/manage/actors" style={{ textDecoration: "none" }}>
          ← к списку актёров
        </Link>
      </div>

      <div style={{ marginTop: 8, opacity: 0.8 }}>
        {actor.email}
      </div>

      <h2 style={{ marginTop: 24 }}>Сейчас на руках</h2>
      {openIssues.length === 0 ? (
        <div>Ничего нет</div>
      ) : (
        <ul style={{ paddingLeft: 18 }}>
          {openIssues.map((i) => (
            <li key={i.id} style={{ marginBottom: 10 }}>
              <Link href={`/props/${i.propId}`} style={{ fontWeight: 700 }}>
                {i.prop?.name}
              </Link>
              <div style={{ fontSize: 14, opacity: 0.8 }}>
                Выдано: {new Date(i.issuedAt).toLocaleString()} · Кто выдал: {i.issuedBy?.name || "—"}
              </div>
              {i.comment && <div style={{ fontSize: 14, opacity: 0.8 }}>Комментарий: {i.comment}</div>}
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ marginTop: 24 }}>История (последние 50)</h2>
      {history.length === 0 ? (
        <div>Истории пока нет</div>
      ) : (
        <ul style={{ paddingLeft: 18 }}>
          {history.map((i) => (
            <li key={i.id} style={{ marginBottom: 10 }}>
              <Link href={`/props/${i.propId}`} style={{ fontWeight: 700 }}>
                {i.prop?.name}
              </Link>
              <div style={{ fontSize: 14, opacity: 0.8 }}>
                {i.status === "OPEN" ? "Выдано" : "Выдано/Возврат"}:{" "}
                {new Date(i.issuedAt).toLocaleString()}
                {i.returnedAt ? ` · Возврат: ${new Date(i.returnedAt).toLocaleString()}` : ""}
              </div>
              <div style={{ fontSize: 14, opacity: 0.8 }}>
                Выдал: {i.issuedBy?.name || "—"}
                {i.returnedAt ? ` · Принял: ${i.returnedBy?.name || "—"}` : ""}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}