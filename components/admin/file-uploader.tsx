"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

function isPdfUrl(url: string): boolean {
  return url.toLowerCase().split("?")[0].endsWith(".pdf");
}

export function FileUploader({
  value,
  onChange,
  accept = "image/png,image/jpeg,image/webp",
}: {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileSelected(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/uploads", { method: "POST", body: formData });
      const result = await response.json();
      if (!result.success) {
        toast.error(result.error ?? "Upload failed");
        return;
      }
      onChange(result.url);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {value ? (
        isPdfUrl(value) ? (
          <Link
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-muted hover:bg-accent flex size-16 flex-col items-center justify-center gap-1 rounded"
            title="View current file"
          >
            <FileText className="size-6" />
            <span className="text-[10px]">PDF</span>
          </Link>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary user-uploaded URL, not a static asset
          <img src={value} alt="" className="size-16 rounded object-cover" />
        )
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFileSelected(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
      </Button>
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={uploading}
          onClick={() => onChange("")}
        >
          Remove
        </Button>
      ) : null}
    </div>
  );
}
