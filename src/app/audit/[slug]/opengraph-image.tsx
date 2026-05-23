import { ImageResponse } from "next/og";

export const alt = "SpendLens shared AI spend audit";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#090a0f",
          color: "#f8fafc",
          display: "flex",
          fontFamily: "Arial, sans-serif",
          height: "100%",
          justifyContent: "center",
          padding: "72px",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: "32px",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
            padding: "56px",
            width: "100%",
          }}
        >
          <div
            style={{
              color: "#34d399",
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            SpendLens
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                color: "#f8fafc",
                fontSize: "76px",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                maxWidth: "860px",
              }}
            >
              Shared AI spend audit
            </div>
            <div
              style={{
                color: "#94a3b8",
                fontSize: "30px",
                lineHeight: 1.4,
                marginTop: "28px",
                maxWidth: "820px",
              }}
            >
              Benchmark-based savings opportunities for AI tools, seats, and
              API usage.
            </div>
          </div>

          <div
            style={{
              color: "#34d399",
              fontSize: "28px",
              fontWeight: 700,
            }}
          >
            Public report · Private lead details excluded
          </div>
        </div>
      </div>
    ),
    size,
  );
}
