"use client";

import { useState } from "react";

import { uploadToCloudinary } from "@/lib/cloudinary";

type Education = {
  degree: string;
  institution: string;
  year: string;
};

type Experience = {
  company: string;
  role: string;
  duration: string;
  description: string;
};

type Resume = {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  education: Education[];
  experience: Experience[];
  skills: string[];
};

function createEmptyResume(): Resume {
  return {
    name: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    education: [],
    experience: [],
    skills: [],
  };
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500";

const addButtonClass =
  "rounded-lg border border-gray-400 px-3 py-1.5 text-sm font-medium hover:bg-gray-200";

const removeButtonClass = "text-sm font-medium text-red-600 hover:underline";

type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

function TextField({ label, ...props }: TextFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input className={inputClass} {...props} />
    </label>
  );
}

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [resume, setResume] = useState<Resume>(createEmptyResume);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResume(createEmptyResume());
    setError("");
  }

  function updateField<K extends keyof Resume>(field: K, value: Resume[K]) {
    setResume((prev) => ({ ...prev, [field]: value }));
  }

  function addEducation() {
    setResume((prev) => ({
      ...prev,
      education: [...prev.education, { degree: "", institution: "", year: "" }],
    }));
  }

  function updateEducation(
    index: number,
    field: keyof Education,
    value: string,
  ) {
    setResume((prev) => ({
      ...prev,
      education: prev.education.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function removeEducation(index: number) {
    setResume((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }

  function addExperience() {
    setResume((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { company: "", role: "", duration: "", description: "" },
      ],
    }));
  }

  function updateExperience(
    index: number,
    field: keyof Experience,
    value: string,
  ) {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function removeExperience(index: number) {
    setResume((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }

  function addSkill() {
    setResume((prev) => ({ ...prev, skills: [...prev.skills, ""] }));
  }

  function updateSkill(index: number, value: string) {
    setResume((prev) => ({
      ...prev,
      skills: prev.skills.map((skill, i) => (i === index ? value : skill)),
    }));
  }

  function removeSkill(index: number) {
    setResume((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  }

  async function handleParse() {
    if (!image) return;

    setLoading(true);
    setError("");
    setResume(createEmptyResume());

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

      // 3. Populate the form fields with the parsed data
      setResume({
        name: data.name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        location: data.location ?? "",
        summary: data.summary ?? "",
        education: Array.isArray(data.education) ? data.education : [],
        experience: Array.isArray(data.experience) ? data.experience : [],
        skills: Array.isArray(data.skills) ? data.skills : [],
      });
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
        Level 3 — Resume Image → Auto Fill Form
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

        {/* Parsed Resume Form */}
        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold">Parsed Resume</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Name"
              value={resume.name}
              onChange={(event) => updateField("name", event.target.value)}
            />

            <TextField
              label="Email"
              type="email"
              value={resume.email}
              onChange={(event) => updateField("email", event.target.value)}
            />

            <TextField
              label="Phone"
              value={resume.phone}
              onChange={(event) => updateField("phone", event.target.value)}
            />

            <TextField
              label="Location"
              value={resume.location}
              onChange={(event) => updateField("location", event.target.value)}
            />
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">Summary</span>
            <textarea
              rows={4}
              className={inputClass}
              value={resume.summary}
              onChange={(event) => updateField("summary", event.target.value)}
            />
          </label>

          {/* Education */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Education</h3>

              <button
                type="button"
                onClick={addEducation}
                className={addButtonClass}
              >
                Add Education
              </button>
            </div>

            {resume.education.length === 0 && (
              <p className="text-sm text-gray-500">No education added yet.</p>
            )}

            {resume.education.map((entry, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 rounded-lg border border-gray-300 p-4"
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextField
                    label="Degree"
                    value={entry.degree}
                    onChange={(event) =>
                      updateEducation(index, "degree", event.target.value)
                    }
                  />

                  <TextField
                    label="Institution"
                    value={entry.institution}
                    onChange={(event) =>
                      updateEducation(index, "institution", event.target.value)
                    }
                  />

                  <TextField
                    label="Year"
                    value={entry.year}
                    onChange={(event) =>
                      updateEducation(index, "year", event.target.value)
                    }
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className={`${removeButtonClass} self-start`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Experience */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Experience</h3>

              <button
                type="button"
                onClick={addExperience}
                className={addButtonClass}
              >
                Add Experience
              </button>
            </div>

            {resume.experience.length === 0 && (
              <p className="text-sm text-gray-500">No experience added yet.</p>
            )}

            {resume.experience.map((entry, index) => (
              <div
                key={index}
                className="flex flex-col gap-3 rounded-lg border border-gray-300 p-4"
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextField
                    label="Company"
                    value={entry.company}
                    onChange={(event) =>
                      updateExperience(index, "company", event.target.value)
                    }
                  />

                  <TextField
                    label="Role"
                    value={entry.role}
                    onChange={(event) =>
                      updateExperience(index, "role", event.target.value)
                    }
                  />

                  <TextField
                    label="Duration"
                    value={entry.duration}
                    onChange={(event) =>
                      updateExperience(index, "duration", event.target.value)
                    }
                  />
                </div>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-700">
                    Description
                  </span>
                  <textarea
                    rows={3}
                    className={inputClass}
                    value={entry.description}
                    onChange={(event) =>
                      updateExperience(index, "description", event.target.value)
                    }
                  />
                </label>

                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className={`${removeButtonClass} self-start`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Skills</h3>

              <button
                type="button"
                onClick={addSkill}
                className={addButtonClass}
              >
                Add Skill
              </button>
            </div>

            {resume.skills.length === 0 && (
              <p className="text-sm text-gray-500">No skills added yet.</p>
            )}

            {resume.skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  className={inputClass}
                  value={skill}
                  onChange={(event) => updateSkill(index, event.target.value)}
                />

                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className={removeButtonClass}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
