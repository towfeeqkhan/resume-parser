"use client";

import { useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";

type ResumeResult = {
  name?: string;
};

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState<ResumeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError("");
  }

  async function handleParse() {
    if (!image) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // 1. Upload image directly to Cloudinary
      const uploadResult = await uploadToCloudinary(image);

      console.log("Cloudinary URL:", uploadResult.url);

      // 2. Send only the URL to our Next.js API
      const response = await fetch("/api/parse-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: uploadResult.url,
          mediaType: image.type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse resume.");
      }

      // 3. Display structured output
      setResult(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl p-8">
      <h1 className="mb-2 text-3xl font-bold">Resume Parser</h1>

      <p className="mb-8 text-gray-600">
        Level 2 — Resume Image → Structured Output
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Image Upload */}
        <section>
          <h2 className="mb-3 text-xl font-semibold">Resume Image</h2>

          <label className="flex min-h-[500px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Resume preview"
                className="max-h-[450px] max-w-full object-contain"
              />
            ) : (
              <div className="text-center">
                <p className="text-lg font-medium">Upload Resume</p>

                <p className="mt-2 text-sm text-gray-500">
                  PNG, JPG, JPEG or WebP
                </p>
              </div>
            )}

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          <button
            onClick={handleParse}
            disabled={loading || !image}
            className="mt-4 rounded-lg bg-black px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Parsing..." : "Parse Resume"}
          </button>

          {error && <p className="mt-4 text-red-600">{error}</p>}
        </section>

        {/* Structured Output */}
        <section>
          <h2 className="mb-3 text-xl font-semibold">Structured Output</h2>

          <div className="min-h-[500px] overflow-auto rounded-lg bg-gray-700 p-4">
            {result ? (
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">
                Parsed resume data will appear here.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
