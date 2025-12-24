import imageCompression from "browser-image-compression";

export async function autoEnhanceReference(file: File, opts?: { targetSize?: number; quality?: number }) {
  const options = {
    maxWidthOrHeight: opts?.targetSize ?? 1600,
    initialQuality: opts?.quality ?? 0.92,
    useWebWorker: true,
  };
  return await imageCompression(file, options);
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const s = String(reader.result || "");
      const comma = s.indexOf(",");
      resolve(comma >= 0 ? s.slice(comma + 1) : s);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function sha256Hex(input: string | ArrayBuffer): Promise<string> {
  const data = (typeof input === "string") ? new TextEncoder().encode(input) : new Uint8Array(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
