import { ImageResponse } from "next/og";

export const alt = "e-tungo - Rwanda livestock and animal-products marketplace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #eff5ef 0%, #ffffff 55%, #f5ede7 100%)",
          color: "#262424",
          display: "flex",
          height: "100%",
          justifyContent: "space-between",
          padding: "70px 84px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 720 }}>
          <div style={{ color: "#375d3f", display: "flex", fontSize: 68, fontWeight: 800 }}>
            e-tungo
          </div>
          <div style={{ display: "flex", fontSize: 46, fontWeight: 700, lineHeight: 1.15, marginTop: 24 }}>
            Rwanda&apos;s livestock and animal-products marketplace
          </div>
          <div style={{ color: "#6a5f56", display: "flex", fontSize: 26, marginTop: 28 }}>
            Buy and sell across Rwanda
          </div>
        </div>
        <div
          style={{
            alignItems: "center",
            background: "#375d3f",
            border: "18px solid #d8eadb",
            borderRadius: "50%",
            color: "white",
            display: "flex",
            fontSize: 82,
            fontWeight: 800,
            height: 310,
            justifyContent: "center",
            width: 310,
          }}
        >
          e-t
        </div>
      </div>
    ),
    size
  );
}
