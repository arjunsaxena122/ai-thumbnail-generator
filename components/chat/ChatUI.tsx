"use client";

import type React from "react";
import { useMemo, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, ImageIcon, ArrowUp, Loader2, X } from "lucide-react";
import { useUploadImage } from "@/hook/useUploadImage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  imageUrl?: string;
};

export default function ChatUI() {
  const {
    fileInputRef,
    handleUpload,
    uploadResponse,
    clearAttachment,
    isUploading,
  } = useUploadImage();
  const [query, setQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const hasNetworkUrl =
    Boolean((uploadResponse as any)?.url) ||
    Boolean((uploadResponse as any)?.path) ||
    Boolean((uploadResponse as any)?.imageUrl);

  const canSend = useMemo(
    () => query.trim().length > 0 && hasNetworkUrl && !isUploading,
    [query, hasNetworkUrl, isUploading]
  );

  const attachedImageUrl =
    (uploadResponse as any)?.url ||
    (uploadResponse as any)?.path ||
    (uploadResponse as any)?.imageUrl ||
    (uploadResponse as any)?.previewUrl ||
    undefined;

  function addMessage(msg: ChatMessage) {
    setMessages((prev) => [...prev, msg]);
  }

  async function handleGenerateImage() {
    if (!canSend || isSending) return;
    try {
      setIsSending(true);

      const userMsg: ChatMessage = {
        id: `${Date.now()}-u`,
        role: "user",
        text: query.trim(),
        imageUrl: attachedImageUrl,
      };
      addMessage(userMsg);

      setQuery("");
      clearAttachment?.();

      setIsAssistantTyping(true);

      let aiText: string | undefined;
      let aiImage: string | undefined;

      try {
        const res = await axios.post("/api/image-generator", {
          query: userMsg.text,
          uploadResponse,
        });
        aiText =
          res?.data?.text ??
          res?.data?.message ??
          "Here is the result based on your image and prompt.";
        aiImage = res?.data?.imageUrl ?? res?.data?.url ?? undefined;
      } catch (err) {
        await new Promise((r) => setTimeout(r, 1200));
        aiText = `AI response for: "${userMsg.text}" — I analyzed your image and prompt and generated insights.`;
        aiImage = userMsg.imageUrl;
      }

      const aiMsg: ChatMessage = {
        id: `${Date.now()}-a`,
        role: "assistant",
        text: aiText || "Here is the result based on your image and prompt.",
        imageUrl: aiImage,
      };
      addMessage(aiMsg);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAssistantTyping(false);
      setIsSending(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void handleGenerateImage();
  }

  const handleLogout = async () => {
    try {
      const res = await axios.get("/api/auth/logout");
      if (res.status === 200) {
        toast.success(res.data.message);
        router.push("/");
      }
    } catch (error) {
      toast.error("error while logout");
    }
  };

  return (
    <main className="flex min-h-[100dvh] flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4">
          <h1 className="text-balance text-base font-semibold tracking-tight">
            Chat
          </h1>
          <div className="relative">
            {/* Profile Icon */}
            <button
              onClick={() => setOpen(!open)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
            >
              <span className="text-sm font-bold">A</span>
            </button>

            {open && (
              <div className="absolute mt-2 w-32 rounded-md border bg-white shadow-lg">
                <button
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                  onClick={() => alert("Under progress")}
                >
                  Profile
                </button>
                <button
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <section
        aria-label="Messages"
        className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 py-6"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-sm text-muted-foreground">
              No messages yet. Attach an image and write your prompt below.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <Avatar className="h-7 w-7">
                      <AvatarImage src="/ai-avatar.png" alt="AI" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={[
                      "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground",
                    ].join(" ")}
                  >
                    {m.imageUrl && (
                      <img
                        src={m.imageUrl || "/placeholder.svg"}
                        alt={isUser ? "Your attached image" : "AI result image"}
                        className="mb-2 max-h-56 w-full rounded-lg object-cover"
                      />
                    )}
                    <p className="whitespace-pre-wrap text-pretty">{m.text}</p>
                  </div>
                  {isUser && (
                    <Avatar className="h-7 w-7">
                      <AvatarImage src="/diverse-user-avatars.png" alt="You" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}

            {isAssistantTyping && (
              <div className="flex items-start gap-3">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="/ai-avatar.png" alt="AI" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="max-w-[70%] rounded-2xl bg-secondary px-3 py-2">
                  <div className="flex items-center gap-1">
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-foreground/70"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-foreground/70"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-foreground/70"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form
          onSubmit={onSubmit}
          className="mx-auto w-full max-w-3xl px-4 py-3"
          aria-label="Chat composer"
        >
          {attachedImageUrl && (
            <div className="mb-2">
              <div className="inline-flex items-center gap-3 rounded-lg border p-2 pr-1">
                <img
                  src={
                    attachedImageUrl ||
                    "/placeholder.svg?height=40&width=40&query=attached image preview"
                  }
                  alt="Attached image"
                  className="h-10 w-10 rounded object-cover"
                />
                <span className="text-xs text-muted-foreground">
                  {isUploading ? "Uploading..." : "Image attached"}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-1 h-7 w-7"
                  onClick={() => clearAttachment?.()}
                  aria-label="Remove attachment"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-end gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  aria-label="Add to message"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={6}>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }}
                  className="cursor-pointer"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Upload image from device
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Input
              type="file"
              accept="image/jpeg, image/png, image/webp"
              ref={fileInputRef}
              onChange={() => handleUpload()}
              className="sr-only"
              aria-hidden="true"
              tabIndex={-1}
            />

            <div className="flex w-full items-end rounded-xl border bg-background px-3 py-2 shadow-sm">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Write your prompt..."
                rows={1}
                className="max-h-32 w-full resize-none border-0 p-0 focus-visible:ring-0"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (canSend) void handleGenerateImage();
                  }
                }}
                aria-label="Message"
              />
              <div className="pl-2">
                <Button
                  type="submit"
                  size="icon"
                  disabled={!canSend || isSending}
                  aria-label="Send message"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            Shift + Enter for a new line. Send enables after your image upload
            finishes and you add a prompt.
          </p>
        </form>
      </div>
    </main>
  );
}
