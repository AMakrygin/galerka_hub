import IssueForm from "@/components/IssueForm";
import ReturnForm from "@/components/ReturnForm";

export default async function PropPage({ params }) {
  const { id } = await params; // ← важно в Next 15

  const res = await fetch(`http://localhost:3000/api/props/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return <main style={{ padding: 24 }}>Не найдено</main>;
  }

  const { prop } = await res.json();

  const location =
    prop.status === "IN_STORAGE" && prop.currentContainer
      ? `${prop.currentContainer.warehouse?.name || ""} / ${prop.currentContainer.name}`
      : prop.status === "ISSUED"
      ? "На руках"
      : "—";

  return (
    <main style={{ padding: 24 }}>
      <h1>{prop.name}</h1>

      <div style={{ marginTop: 8 }}>
        <strong>Статус:</strong> {prop.status}
      </div>

      <div>
        <strong>Локация:</strong> {location}
      </div>

      {prop.description && (
        <div style={{ marginTop: 8 }}>
          <strong>Описание:</strong> {prop.description}
        </div>
      )}

      {/* Форма выдачи */}
      <IssueForm propId={prop.id} disabled={prop.status !== "IN_STORAGE"} />

      {prop.status === "ISSUED" && (
  <ReturnForm propId={prop.id} />
)}

      <h2 style={{ marginTop: 24 }}>История выдач</h2>

      {prop.issues.length === 0 ? (
        <div>Выдач не было</div>
      ) : (
        <ul>
          {prop.issues.map((i) => (
            <li key={i.id} style={{ marginBottom: 8 }}>
              <div>Выдано: {new Date(i.issuedAt).toLocaleString()}</div>
              <div>Актёр: {i.actor?.name}</div>
              <div>Кто выдал: {i.issuedBy?.name}</div>
              <div>
                Статус: {i.status}
                {i.returnedAt && <> · Возврат: {new Date(i.returnedAt).toLocaleString()}</>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}