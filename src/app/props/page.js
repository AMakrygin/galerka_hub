import Link from "next/link";

export default async function PropsPage({ searchParams }) {
    const params = await searchParams;

    const q = params?.q || "";
    const status = params?.status || "";

    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (status) query.set("status", status);

    const res = await fetch(`http://localhost:3000/api/props?${query.toString()}`, {
        cache: "no-store",
    });

    const { props } = await res.json();

    return (
        <main style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <h1 style={{ margin: 0 }}>Каталог реквизита</h1>
                <Link
                    href="/manage/props"
                    style={{
                        padding: "8px 12px",
                        border: "1px solid #ddd",
                        borderRadius: 10,
                        textDecoration: "none",
                        color: "black",
                        background: "#fafafa",
                    }}
                >
                    + Добавить реквизит
                </Link>
            </div>

            <form style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12, marginBottom: 16 }}>
                <input
                    name="q"
                    defaultValue={q}
                    placeholder="Поиск по названию или инв. номеру"
                    style={{ padding: 8, minWidth: 320 }}
                />

                <select name="status" defaultValue={status} style={{ padding: 8 }}>
                    <option value="">Все статусы</option>
                    <option value="IN_STORAGE">На складе</option>
                    <option value="ISSUED">Выдано</option>
                    <option value="WRITTEN_OFF">Списано</option>
                </select>

                <button type="submit" style={{ padding: "8px 12px" }}>
                    Найти
                </button>

                {(q || status) && (
                    <Link href="/props" style={{ alignSelf: "center", opacity: 0.75 }}>
                        Сбросить
                    </Link>
                )}
            </form>

            {props.length === 0 ? (
                <div>Ничего не найдено</div>
            ) : (
                <ul style={{ paddingLeft: 18 }}>
                    {props.map((p) => {
                        const loc =
                            p.status === "IN_STORAGE" && p.currentContainer
                                ? `${p.currentContainer.warehouse?.name || ""} / ${p.currentContainer.name}`
                                : p.status === "ISSUED"
                                    ? "На руках"
                                    : "—";

                        const holder =
                            p.status === "ISSUED" && p.issues?.length
                                ? p.issues[0].actor?.name || "—"
                                : null;

                        const issue = p.issues?.[0];
                        const holderName = issue?.actor?.name || issue?.actor?.email || "—";
                        const holderId = issue?.actor?.id;

                        return (
                            <li key={p.id} style={{ marginBottom: 10 }}>
                                <Link href={`/props/${p.id}`} style={{ fontWeight: 700 }}>
                                    {p.name}
                                </Link>
                                <div style={{ fontSize: 14, opacity: 0.8 }}>
                                    Статус: {p.status} · Локация: {loc}
                                    {p.status === "ISSUED" ? (
                                        <>
                                            {" · У кого: "}
                                            {holderId ? <Link href={`/actors/${holderId}`}>{holderName}</Link> : holderName}
                                        </>
                                    ) : null}
                                    {p.inventoryNumber ? ` · Инв: ${p.inventoryNumber}` : ""}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </main>
    );
}