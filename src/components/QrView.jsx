"use client";

import QRCode from "react-qr-code";

export default function QrView({ value, size = 180 }) {
  if (!value) return null;

  return (
    <div style={{ marginTop: 12, marginBottom: 12, width: size, height: size }}>
      <QRCode value={value} size={size} />
    </div>
  );
}