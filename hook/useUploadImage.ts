"use client"

import { useRef, useState } from "react"
import { upload } from "@imagekit/next"
import { authenticator } from "@/utils/imageKitAuth.util"

type UploadResponse = {
  url?: string
  path?: string
  imageUrl?: string
  previewUrl?: string
  name?: string
  fileType?: string
  type?: string
  size?: number
  [key: string]: any
} | null

export function useUploadImage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadResponse, setUploadResponse] = useState<UploadResponse>(null)
  const [isUploading, setIsUploading] = useState(false)

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const previewUrl = URL.createObjectURL(file)

      // Get auth parameters from our API
      const { token, expire, signature, publicKey } = await authenticator()

      // Upload to ImageKit for a public URL the server can access
      const res = await upload({
        expire,
        token,
        signature,
        publicKey,
        file,
        fileName: file.name,
        folder: "/uploaded/images",
      })

      // Ensure downstream API has mime hints
      setUploadResponse({
        ...res,
        previewUrl,
        name: file.name,
        fileType: file.type,
        size: file.size,
      })
    } catch (e) {
      console.error("[v0] Image upload failed:", e)
      // If upload fails, do not set a preview-only response to avoid server errors
      setUploadResponse(null)
    } finally {
      setIsUploading(false)
    }
  }

  function clearAttachment() {
    setUploadResponse(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return { fileInputRef, handleUpload, uploadResponse, isUploading, clearAttachment }
}
