export function makeMimeType(name: string, fileType?: string) {
  const lower = (name || "").toLowerCase()
  if (lower.endsWith(".png")) return "image/png"
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg"
  if (lower.endsWith(".webp")) return "image/webp"
  if (fileType?.toLowerCase().includes("png")) return "image/png"
  if (fileType?.toLowerCase().includes("jpg") || fileType?.toLowerCase().includes("jpeg")) return "image/jpeg"
  if (fileType?.toLowerCase().includes("webp")) return "image/webp"
  return "image/jpeg"
}
