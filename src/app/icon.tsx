import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: "linear-gradient(135deg, #6C8CF5, #3D63E8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <path d="M16 8.5v9.6" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M11 14.5 16 19.5 21 14.5" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10.5 23h11" stroke="white" strokeOpacity="0.55" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
