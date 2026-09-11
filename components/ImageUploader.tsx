"use client";

import { Camera, Upload, X } from "lucide-react";
import { useRef } from "react";
import { useApp } from "@/context/AppContext";

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

const MAX_WIDTH = 1280;
const MAX_HEIGHT = 1280;
const IMAGE_QUALITY = 0.78;

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

  const scale = Math.min(1, MAX_WIDTH / image.width, MAX_HEIGHT / image.height);
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

export default function ImageUploader({
  images,
  onImagesChange,
  maxImages = 1,
}: ImageUploaderProps) {
  const { t } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = maxImages - images.length;
    const toProcess = files.slice(0, remaining);

    if (toProcess.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const compressed = await compressImage(toProcess[0]);
    onImagesChange([...images.slice(0, maxImages - 1), compressed].slice(0, maxImages));

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    onImagesChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <div className="grid grid-cols-1 gap-2">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-brand-700 py-0.5 text-center text-xs font-medium text-white">
                {t.coverPhoto}
              </div>
              <button
                onClick={() => removeImage(idx)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                aria-label="Remove photo"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.setAttribute("capture", "environment");
                fileInputRef.current.click();
              }
            }}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-6 text-gray-600 transition-colors hover:border-brand-700 hover:text-brand-700 active:scale-95"
          >
            <Camera size={28} />
            <span className="text-sm font-medium">{t.takePhoto}</span>
          </button>
          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.removeAttribute("capture");
                fileInputRef.current.click();
              }
            }}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-6 text-gray-600 transition-colors hover:border-brand-700 hover:text-brand-700 active:scale-95"
          >
            <Upload size={28} />
            <span className="text-sm font-medium">{t.chooseFromDevice}</span>
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <p className="text-center text-xs text-gray-400">
        {images.length}/{maxImages} photo
        {maxImages === 1 ? "" : "s"}
      </p>
    </div>
  );
}
