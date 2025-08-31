"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import axios from "axios";
import path from "path";
import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import { authenticator } from "@/utils/imageKit.util";
export default function Chat() {
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    const fileInput = fileInputRef.current;
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      alert("Please select a file to upload");
      return;
    }

    const file = fileInput.files[0];

    let authParams;
    try {
      authParams = await authenticator();
    } catch (authError) {
      console.error("Failed to authenticate for upload:", authError);
      return;
    }

    const { signature, expire, token, publicKey } = authParams;

    try {
      const uploadResponse = await upload({
        expire,
        token,
        signature,
        publicKey,
        file,
        fileName: file.name,
        onProgress: (event) => {
          setProgress((event.loaded / event.total) * 100);
        },
      });
      console.log("Upload response:", uploadResponse);
      const { filePath, fileType, name, size, thumbnailUrl, url } =
        uploadResponse;

      const extension = path.extname(name || "");
      console.log("before", extension);
      const dotLessExt = extension.trim().split(".")[1];
      console.log(dotLessExt);
      const mimeType = `${fileType}/${dotLessExt}`;
      console.log("mime type", mimeType);
      console.log("url",url)

      const res = await axios.post("/api/image-generator", {
        query: "remove the background",
        filename: name,
        fileType: mimeType,
        url,
      });

      console.log(res);
    } catch (error) {
      // Handle specific error types provided by the ImageKit SDK.
      if (error instanceof ImageKitAbortError) {
        console.error("Upload aborted:", error.reason);
      } else if (error instanceof ImageKitInvalidRequestError) {
        console.error("Invalid request:", error.message);
      } else if (error instanceof ImageKitUploadNetworkError) {
        console.error("Network error:", error.message);
      } else if (error instanceof ImageKitServerError) {
        console.error("Server error:", error.message);
      } else {
        console.error("Upload error:", error);
      }
    }
  };

  return (
    <div>
      <Input type="file" accept=".png, .jpeg, .jpg" ref={fileInputRef} />
      <Button type="button" onClick={handleUpload}>
        Upload
      </Button>
      Upload progress: <progress value={progress} max={100}></progress>
    </div>
  );
}
