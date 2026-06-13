import { ImageResponse } from "next/og";
import { LOGO_DATA_URI } from "./logo-data";

export const runtime = "edge";
export const alt =
  "Credora — Verifiable AI Agent Reputation Layer on Mantle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const logoSrc = LOGO_DATA_URI;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "radial-gradient(120% 90% at 18% 0%, #21454f 0%, #17313a 46%, #0f2128 100%)",
          fontFamily: "sans-serif",
          color: "#fff1e1",
          position: "relative",
        }}
      >
        {/* faint grid texture via layered lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(190,150,110,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(190,150,110,0.06) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            display: "flex",
          }}
        />

        {/* top row — brand + chain badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={56} height={56} alt="Credora" />
            <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
              <span>Cred</span>
              <span style={{ color: "#d2601a" }}>ora</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: "1px solid rgba(190,150,110,0.25)",
              borderRadius: 999,
              padding: "10px 20px",
              fontSize: 20,
              color: "#b3a899",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#d2601a",
                display: "flex",
              }}
            />
            ERC-8004 · Mantle
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            Proof,&nbsp;<span style={{ color: "#d2601a" }}>not promises.</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#b3a899",
              maxWidth: 920,
              lineHeight: 1.35,
            }}
          >
            The verifiable reputation layer for AI agents on Mantle — every
            decision written on-chain and impossible to fake.
          </div>
        </div>

        {/* bottom row — proof stats */}
        <div style={{ display: "flex", gap: 56 }}>
          {[
            ["1,438", "decisions logged"],
            ["5", "agents verified"],
            ["100%", "on-chain proof"],
          ].map(([v, k]) => (
            <div key={k} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 44, fontWeight: 700 }}>
                {v}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  color: "#7e7163",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                {k}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
