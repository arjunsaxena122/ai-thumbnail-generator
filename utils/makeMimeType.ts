export function makeMimeType(name: string, fileType?: string) {
  const lower = (name || "").toLowerCase()
  if (lower.endsWith(".png")) return "image/png"
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg"
  if (lower.endsWith(".webp")) return "image/webp"

  const ft = fileType?.toLowerCase() || ""
  if (ft.includes("png")) return "image/png"
  if (ft.includes("jpg") || ft.includes("jpeg")) return "image/jpeg"
  if (ft.includes("webp")) return "image/webp"

  return "image/jpeg"
}
