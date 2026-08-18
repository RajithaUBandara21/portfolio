import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";
import { getProfile } from "@/features/profile/queries";

export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const profile = await getProfile();
  const name = profile?.fullName ?? siteConfig.name;
  const headline = profile?.headline ?? siteConfig.description;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "#0a0a0a",
        color: "#fafafa",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 32, color: "#a1a1aa", marginBottom: 24 }}>
        {siteConfig.url.replace(/^https?:\/\//, "")}
      </div>
      <div style={{ display: "flex", fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>{name}</div>
      <div
        style={{ display: "flex", fontSize: 36, color: "#a1a1aa", marginTop: 24, maxWidth: 900 }}
      >
        {headline}
      </div>
    </div>,
    { ...size },
  );
}
