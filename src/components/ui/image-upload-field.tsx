"use client";

import { useState } from "react";

import { fileInputClass } from "@/components/ui/field";

export function ImageUploadField({
  id,
  name,
  existingImageUrl,
  onPreviewChange,
}: {
  id: string;
  name: string;
  existingImageUrl?: string | null;
  onPreviewChange?: (url: string | null) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <input
        id={id}
        name={name}
        type="file"
        accept="image/*"
        className={fileInputClass}
        onChange={(event) => {
          const file = event.target.files?.[0];
          const url = file ? URL.createObjectURL(file) : null;
          setPreview(url);
          onPreviewChange?.(url ?? existingImageUrl ?? null);
        }}
      />
      {(preview ?? existingImageUrl) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview ?? existingImageUrl ?? undefined}
          alt=""
          className="h-28 w-full max-w-xs rounded-lg border border-border object-cover"
        />
      ) : null}
    </div>
  );
}
