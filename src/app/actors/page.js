import Link from "next/link";

export default async function ActorsListPage() {
  const res = await fetch("http://localhost:3000/api/actors", { cache: "no-store" });
  const { actors } = await res.json();

  return (
    <main style={{ padding: 24 }}>
      <h1>Актёры</h1>

      {actors.length === 0 ? (
        <div>Пока нет актёров</div>
      ) : (
        <ul style={{ paddingLeft: 18 }}>
          {actors.map((a) => (
            <li key={a.id} style={{ marginBottom: 10 }}>
              <Link href={`/actors/${a.id}`} style={{ fontWeight: 700 }}>
                {a.name}
              </Link>
              <div style={{ fontSize: 14, opacity: 0.8 }}>{a.email}</div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}