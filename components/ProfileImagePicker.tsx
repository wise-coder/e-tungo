"use client";

import { Camera, Trash2 } from "lucide-react";
import { useRef } from "react";

interface ProfileImagePickerProps {
  image?: string;
  name: string;
  onChange: (image?: string) => void;
}

const MAX_SIZE = 1024;
const IMAGE_QUALITY = 0.82;

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function compressImage(file: File) {
  const originalDataUrl = await fileToDataUrl(file);
  const image = await loadImage(originalDataUrl);
  const scale = Math.min(1, MAX_SIZE / image.width, MAX_SIZE / image.height);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return originalDataUrl;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", IMAGE_QUALITY);
}

export default function ProfileImagePicker({ image, name, onChange }: ProfileImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = async (file?: File) => {
    if (!file) return;
    const compressed = await compressImage(file);
    onChange(compressed);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-brand-700 text-4xl font-bold text-white shadow-sm">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={`${name} profile`} className="h-full w-full object-cover" />
            ) : (
              <span>{name.charAt(0).toUpperCase() || "?"}</span>
            )}
          </div>
          {image && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white shadow-md transition-colors hover:bg-black"
              aria-label="Remove profile image"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900">Farm profile photo</p>
          <p className="mt-1 text-xs text-gray-500">
            Upload a clear image so buyers can recognize your farm.
          </p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-brand-700 hover:text-brand-700"
        >
          <Camera size={16} />
          {image ? "Change photo" : "Upload photo"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handlePick(e.target.files?.[0])}
      />
    </div>
  );
}
