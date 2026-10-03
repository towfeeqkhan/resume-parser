"use client";

import { useState } from "react";

export default function Home() {
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState<object | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleParse() {
    if (!resumeText.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/parse-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

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
        Level 1 — Messy Text → Structured Output
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Input */}
        <section>
          <h2 className="mb-3 text-xl font-semibold">Resume Text</h2>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder={`Paste a resume here...

Example:

John Doe
john@gmail.com
+91 9876543210

B.Tech Computer Science
ABC University
2026

Software Engineer at Google
2024-2026

Skills: JavaScript, React, TypeScript`}
            className="h-[500px] w-full resize-none rounded-lg border p-4 outline-none focus:ring-2"
          />

          <button
            onClick={handleParse}
            disabled={loading || !resumeText.trim()}
            className="mt-4 rounded-lg bg-black px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Parsing..." : "Parse Resume"}
          </button>

          {error && <p className="mt-4 text-red-600">{error}</p>}
        </section>

        {/* Output */}
        <section>
          <h2 className="mb-3 text-xl font-semibold">Structured Output</h2>

          <div className="min-h-[500px] overflow-auto rounded-lg bg-gray-700 p-4">
            {result ? (
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">
                Structured resume data will appear here.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
