"use client"

import { useRef, useState } from "react"
import { upload } from "@imagekit/next"
import { authenticator } from "@/utils/imageKitAuth.util"

export type UploadItem = {
  url?: string
  path?: string
  imageUrl?: string
  previewUrl?: string
  name?: string
  fileType?: string
  size?: number
  [key: string]: any
}

const allowedMime = ["image/jpeg", "image/png", "image/webp"] as const

export function useUploadImage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadResponses, setUploadResponses] = useState<UploadItem[]>([])
  const [activeUploads, setActiveUploads] = useState(0)

  const isUploading = activeUploads > 0

  async function uploadSingle(file: File) {
    if (!allowedMime.includes(file.type as any)) {
      // eslint-disable-next-line no-console
      console.error("[v0] Invalid file type:", file.type)
      return null
    }

    setActiveUploads((c) => c + 1)
    try {
      const previewUrl = URL.createObjectURL(file)
      const { token, expire, signature, publicKey } = await authenticator()

      const res = await upload({
        expire,
        token,
        signature,
        publicKey,
        file,
        fileName: file.name,
        folder: "/uploaded/images",
      })

      const item: UploadItem = {
        ...res,
        previewUrl,
        name: file.name,
        fileType: file.type,
        size: file.size,
      }

      setUploadResponses((prev) => [...prev, item])
      return item
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[v0] Image upload failed:", e)
      return null
    } finally {
      setActiveUploads((c) => c - 1)
    }
  }

  async function handleUpload(filesParam?: FileList | File[]) {
    const files = filesParam ?? (fileInputRef.current?.files ? Array.from(fileInputRef.current.files) : [])
    if (!files || files.length === 0) return

    const remaining = Math.max(0, 2 - uploadResponses.length)
    if (remaining <= 0) return

    const toUpload = Array.from(files).slice(0, remaining)
    for (const f of toUpload) {
      // eslint-disable-next-line no-await-in-loop
      await uploadSingle(f)
    }

    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function removeAttachment(index: number) {
    setUploadResponses((prev) => {
      const item = prev[index]
      if (item?.previewUrl && item.previewUrl.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(item.previewUrl)
        } catch {
          // ignore
        }
      }
      return prev.filter((_, i) => i !== index)
    })
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function clearAttachment() {
    setUploadResponses((prev) => {
      for (const it of prev) {
        if (it?.previewUrl && it.previewUrl.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(it.previewUrl)
          } catch {
            // ignore
          }
        }
      }
      return []
    })
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const hasAnyNetworkUrl = uploadResponses.some((u) => Boolean(u?.url) || Boolean(u?.path) || Boolean(u?.imageUrl))

  return {
    fileInputRef,
    handleUpload,
    uploadResponses,
    hasAnyNetworkUrl,
    isUploading,
    clearAttachment,
    removeAttachment,
  }
}
