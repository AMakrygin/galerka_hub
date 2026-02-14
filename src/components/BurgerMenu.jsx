"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BurgerMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Закрывать меню при переходе
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Закрывать по Esc
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header style={styles.header}>
        <button
          onClick={() => setOpen(true)}
          aria-label="Открыть меню"
          style={styles.burgerBtn}
        >
          ☰
        </button>

        <Link href="/" style={styles.brand}>
          galerka_hub
        </Link>

        <div style={{ width: 40 }} />
      </header>

      {open && <div style={styles.backdrop} onClick={() => setOpen(false)} />}

      <aside
        style={{
          ...styles.drawer,
          transform: open ? "translateX(0)" : "translateX(-110%)",
        }}
        aria-hidden={!open}
      >
        <div style={styles.drawerTop}>
          <div style={{ fontWeight: 700 }}>Навигация</div>
          <button onClick={() => setOpen(false)} aria-label="Закрыть" style={styles.closeBtn}>
            ✕
          </button>
        </div>

        <nav style={styles.nav}>
          <MenuLink href="/props" label="Каталог реквизита" />
          <MenuLink href="/manage/props" label="Добавить реквизит" />
          <MenuLink href="/manage/actors" label="Актёры" />
          <MenuLink href="/manage/locations" label="Локации хранения" />
          <MenuLink href="/actors" label="Актёры (карточки)" />

          <div style={styles.divider} />

          <MenuLink href="/qr/A-01" label="QR демо (A-01)" />
        </nav>
      </aside>
    </>
  );
}

function MenuLink({ href, label }) {
  return (
    <Link href={href} style={styles.link}>
      {label}
    </Link>
  );
}

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 12px",
    borderBottom: "1px solid #e5e5e5",
    background: "white",
  },
  burgerBtn: {
    width: 40,
    height: 36,
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "white",
    cursor: "pointer",
    fontSize: 18,
    lineHeight: "18px",
  },
  brand: {
    fontWeight: 800,
    textDecoration: "none",
    color: "black",
    letterSpacing: 0.2,
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    zIndex: 60,
  },
  drawer: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: 320,
    background: "white",
    zIndex: 70,
    borderRight: "1px solid #e5e5e5",
    transition: "transform 180ms ease",
    display: "flex",
    flexDirection: "column",
  },
  drawerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 12px",
    borderBottom: "1px solid #eee",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "white",
    cursor: "pointer",
  },
  nav: {
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  link: {
    padding: "10px 10px",
    borderRadius: 10,
    border: "1px solid #eee",
    textDecoration: "none",
    color: "#111",
    background: "#fafafa",
  },
  divider: {
    height: 1,
    background: "#eee",
    margin: "8px 0",
  },
};