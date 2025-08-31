"use client"
import React, { useMemo, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowUp, Loader2, X, Download, Share2, Upload, Sparkles, Camera } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  text: string
  imageUrls?: string[]
  aspectRatio?: string
}

type Mode = "both" | "16-9" | "9-16"

type UploadItem = {
  url?: string
  path?: string
  imageUrl?: string
  previewUrl?: string
  name?: string
  fileType?: string
  size?: number
  preview?: string
}

export default function EnhancedThumbnailStudio() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadResponses, setUploadResponses] = useState<UploadItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [query, setQuery] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isAssistantTyping, setIsAssistantTyping] = useState(false)
  const [mode, setMode] = useState<Mode>("both")

  // ImageKit authentication
  async function getUploadAuth() {
    try {
      const response = await fetch("/api/upload-auth")
      if (!response.ok) {
        throw new Error(`Auth failed: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error("Authentication error:", error)
      throw new Error("Authentication failed")
    }
  }

  // Upload single file to ImageKit
  async function uploadToImageKit(file: File, authData: any) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('fileName', file.name)
    formData.append('publicKey', authData.publicKey)
    formData.append('signature', authData.signature)
    formData.append('expire', authData.expire.toString())
    formData.append('token', authData.token)
    formData.append('folder', '/uploaded/images')

    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }

    return await response.json()
  }

  // Handle file upload
  const handleUpload = async () => {
    const files = fileInputRef.current?.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      const authData = await getUploadAuth()
      const newUploads: UploadItem[] = []

      const filesToUpload = Array.from(files).slice(0, 2 - uploadResponses.length)
      
      for (const file of filesToUpload) {
        // Create preview
        const previewUrl = URL.createObjectURL(file)
        
        // Upload to ImageKit
        const uploadResult = await uploadToImageKit(file, authData)
        
        const uploadItem: UploadItem = {
          url: uploadResult.url,
          path: uploadResult.filePath,
          imageUrl: uploadResult.url,
          previewUrl: previewUrl,
          name: file.name,
          fileType: file.type,
          size: file.size,
          preview: previewUrl,
          ...uploadResult
        }

        newUploads.push(uploadItem)
      }

      setUploadResponses(prev => [...prev, ...newUploads])
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Remove attachment
  const removeAttachment = (index: number) => {
    setUploadResponses(prev => {
      const item = prev[index]
      if (item?.previewUrl && item.previewUrl.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(item.previewUrl)
        } catch (e) {
          // ignore
        }
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  // Clear all attachments
  const clearAttachment = () => {
    setUploadResponses(prev => {
      prev.forEach(item => {
        if (item?.previewUrl && item.previewUrl.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(item.previewUrl)
          } catch (e) {
            // ignore
          }
        }
      })
      return []
    })
  }

  const hasAnyNetworkUrl = uploadResponses.length > 0

  const canSend = useMemo(
    () => query.trim().length > 0 && hasAnyNetworkUrl && !isUploading,
    [query, hasAnyNetworkUrl, isUploading],
  )

  function addMessage(msg: ChatMessage) {
    setMessages((prev) => [...prev, msg])
  }

  // Call image generator API
  async function callImageGeneratorAPI(query: string, uploadResponses: UploadItem[], mode: Mode) {
    const response = await fetch('/api/image-generator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        uploadResponses,
        mode,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  }

  const handleDownload = async (imageUrl: string, filename: string = 'thumbnail') => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    }
  }

  const handleShare = async (imageUrl: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Thumbnail',
          url: imageUrl
        })
      } catch (error) {
        console.log('Share failed:', error)
        handleCopyToClipboard(imageUrl)
      }
    } else {
      handleCopyToClipboard(imageUrl)
    }
  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!')
    }).catch(() => {
      alert('Failed to copy link')
    })
  }

  async function handleGenerate() {
    if (!canSend || isSending) return

    try {
      setIsSending(true)

      const attachedPreviews = uploadResponses
        .map((u) => u.url || u.preview || u.previewUrl)
        .filter(Boolean) as string[]

      // Add user message
      addMessage({
        id: `${Date.now()}-u`,
        role: "user",
        text: query.trim(),
        imageUrls: attachedPreviews,
      })

      const currentQuery = query.trim()
      setQuery("")
      clearAttachment()
      setIsAssistantTyping(true)

      // Call actual API
      const apiResponse = await callImageGeneratorAPI(currentQuery, uploadResponses, mode)
      
      // Process API response
      const generatedImages: string[] = []
      
      // Get images from API response
      if (apiResponse.outputs?.thumbnail169?.transformedUrl) {
        generatedImages.push(apiResponse.outputs.thumbnail169.transformedUrl)
      }
      if (apiResponse.outputs?.reel916?.transformedUrl) {
        generatedImages.push(apiResponse.outputs.reel916.transformedUrl)
      }
      
      // Fallback to imageUrl if outputs not available
      if (generatedImages.length === 0 && apiResponse.imageUrl) {
        generatedImages.push(apiResponse.imageUrl)
      }

      // If still no images, use the images array
      if (generatedImages.length === 0 && apiResponse.images) {
        generatedImages.push(...apiResponse.images)
      }

      // Add AI response with actual generated images
      addMessage({
        id: `${Date.now()}-a`,
        role: "assistant",
        text: apiResponse.text || apiResponse.message || `✨ Perfect! I've created professional thumbnails optimized for maximum engagement. ${mode === "both" ? "Generated both YouTube (16:9) and Shorts/Reels (9:16) formats" : mode === "16-9" ? "Generated YouTube thumbnail in perfect 16:9 format" : "Generated Shorts/Reels thumbnail in perfect 9:16 format"} with high contrast, clear composition, and eye-catching design elements that will boost your click-through rates!`,
        imageUrls: generatedImages,
        aspectRatio: mode
      })
      
    } catch (error) {
      console.error('Generation failed:', error)
      
      // Add error message
      addMessage({
        id: `${Date.now()}-error`,
        role: "assistant",
        text: `❌ Sorry, thumbnail generation failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again with different images or description.`,
        imageUrls: []
      })
    } finally {
      setIsAssistantTyping(false)
      setIsSending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">AI Thumbnail Studio</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">YouTube & Shorts Thumbnail Expert</p>
            </div>
          </div>
          <Badge variant="secondary" className="hidden sm:flex">
            <Camera className="mr-1 h-3 w-3" />
            16:9 & 9:16 Only
          </Badge>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-6 pb-32 sm:px-6">
          {messages.length === 0 ? (
            <div className="flex h-[60vh] flex-col items-center justify-center text-center">
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                Create Stunning Thumbnails
              </h2>
              <p className="mb-8 max-w-md text-slate-600 dark:text-slate-300">
                Upload up to 2 images and describe your perfect thumbnail. I'll create professional YouTube (16:9) and Shorts/Reels (9:16) thumbnails optimized for maximum engagement.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="p-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                    <span className="text-lg font-bold text-red-600">16:9</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">YouTube Thumbnails</h3>
                  <p className="text-sm text-slate-500">Perfect for YouTube videos</p>
                </Card>
                <Card className="p-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <span className="text-lg font-bold text-purple-600">9:16</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Shorts & Reels</h3>
                  <p className="text-sm text-slate-500">Perfect for vertical content</p>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {messages.map((m) => {
                const isUser = m.role === "user"
                return (
                  <div key={m.id} className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={isUser ? "/user.png" : "/ai-avatar.png"} />
                      <AvatarFallback className={isUser ? "bg-blue-500 text-white" : "bg-purple-500 text-white"}>
                        {isUser ? "U" : "AI"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <Card className={`max-w-[80%] ${isUser ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-slate-800"}`}>
                      <CardContent className="p-4">
{Array.isArray(m.imageUrls) && m.imageUrls.length > 0 && (
                          <div className="mb-4 space-y-4">
                            {isUser ? (
                              // User uploaded images - show as grid
                              <div className="grid grid-cols-2 gap-3">
                                {m.imageUrls.map((url, idx) => (
                                  <div key={idx} className="relative">
                                    <img
                                      src={url}
                                      alt="Uploaded image"
                                      className="w-full h-32 rounded-lg object-cover shadow-md border border-slate-200"
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              // AI generated thumbnails - show based on mode
                              <div className="space-y-4">
                                {m.imageUrls.map((url, idx) => {
                                  // Determine if this is YouTube (16:9) or Shorts (9:16) based on mode and index
                                  let isYoutube = false
                                  let label = ""
                                  
                                  if (m.aspectRatio === "both") {
                                    isYoutube = idx === 0
                                    label = idx === 0 ? "16:9 YouTube" : "9:16 Shorts"
                                  } else if (m.aspectRatio === "16-9") {
                                    isYoutube = true
                                    label = "16:9 YouTube"
                                  } else {
                                    isYoutube = false
                                    label = "9:16 Shorts"
                                  }
                                  
                                  return (
                                    <div key={idx} className="relative group">
                                      <div className={`relative ${isYoutube ? 'w-full' : 'w-64 mx-auto'}`}>
                                        <img
                                          src={url}
                                          alt="Generated thumbnail"
                                          className={`w-full rounded-lg object-cover shadow-lg border-2 border-slate-200 ${
                                            isYoutube ? 'aspect-video' : 'aspect-[9/16]'
                                          }`}
                                        />
                                        
                                        {/* Thumbnail Label */}
                                        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium">
                                          {label}
                                        </Badge>
                                        
                                        {/* Hover Actions */}
                                        <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/60 opacity-0 transition-all duration-200 group-hover:opacity-100">
                                          <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleDownload(url, isYoutube ? "youtube-thumbnail" : "shorts-thumbnail")}
                                            className="bg-white/95 text-black hover:bg-white shadow-lg"
                                          >
                                            <Download className="mr-1 h-4 w-4" />
                                            Download
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleShare(url)}
                                            className="bg-white/95 text-black hover:bg-white shadow-lg"
                                          >
                                            <Share2 className="mr-1 h-4 w-4" />
                                            Share
                                          </Button>
                                        </div>
                                      </div>
                                      
                                      {/* Thumbnail Info */}
                                      <div className="mt-2 text-center">
                                        <p className="text-xs text-slate-500">
                                          {isYoutube ? "Perfect for YouTube videos • 1280x720" : "Perfect for Shorts & Reels • 1080x1920"}
                                        </p>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )}
                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                          {m.text}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}

              {isAssistantTyping && (
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-purple-500 text-white">AI</AvatarFallback>
                  </Avatar>
                  <Card className="bg-white dark:bg-slate-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="h-2 w-2 animate-bounce rounded-full bg-purple-500"
                              style={{ animationDelay: `${i * 150}ms` }}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-slate-500">Creating your professional thumbnail...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Fixed Input Area */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95">
        <div className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6">
          {/* Upload Preview */}
          {uploadResponses.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Uploaded Images:</span>
                <Badge variant="outline" className="text-xs">
                  {uploadResponses.length}/2
                </Badge>
              </div>
              <div className="flex flex-wrap gap-3">
                {uploadResponses.map((u, idx) => {
                  const preview = u.preview || u.url || u.previewUrl
                  return (
                    <div key={idx} className="relative group">
                      <div className="relative">
                        <img
                          src={preview}
                          alt="Uploaded"
                          className="h-20 w-20 rounded-lg object-cover border-2 border-slate-200 shadow-sm"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -right-2 -top-2 h-6 w-6 rounded-full shadow-md opacity-80 hover:opacity-100"
                          onClick={() => removeAttachment(idx)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 text-center truncate w-20">
                        {u.name || `Image ${idx + 1}`}
                      </p>
                    </div>
                  )
                })}
                {isUploading && (
                  <div className="h-20 w-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mode Selection */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Output Format:</span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={mode === "both" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("both")}
                className="text-xs"
              >
                Both Formats
              </Button>
              <Button
                type="button"
                variant={mode === "16-9" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("16-9")}
                className="text-xs"
              >
                16:9 YouTube
              </Button>
              <Button
                type="button"
                variant={mode === "9-16" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("9-16")}
                className="text-xs"
              >
                9:16 Shorts
              </Button>
            </div>
          </div>

          {/* Input Form */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadResponses.length >= 2 || isUploading}
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            </Button>

            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            <div className="flex-1 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe your perfect thumbnail: style, colors, text, mood, subject positioning..."
                className="min-h-[44px] resize-none border-0 bg-transparent p-3 focus-visible:ring-0"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    if (canSend) handleGenerate()
                  }
                }}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!canSend || isSending}
              className="shrink-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>

          <p className="mt-2 text-xs text-slate-500 text-center">
            ⚡ I'm a thumbnail specialist - I only create YouTube (16:9) and Shorts/Reels (9:16) thumbnails with perfect aspect ratios and engaging designs
          </p>
        </div>
      </div>
    </div>
  )
}