
"use client";

import { useTranslations } from "next-intl";
import { useState, ChangeEvent } from "react";

interface Profile {
  name: string;
  email: string;
}

export default function SettingsForm() {
  const t = useTranslations("settings");
  const [profile, setProfile] = useState<Profile>({ name: "", email: "" });

  async function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    await fetch("/api/upload-logo", { method: "POST", body: form });
  }

  return (
    <div className="grid gap-8 max-w-2xl">
      <section>
        <h2 className="text-xl font-semibold mb-3">{t("profileTitle")}</h2>
        <div className="flex flex-col gap-4">
          <Field
            label={t("name")}
            value={profile.name}
            onChange={(v) => setProfile((p) => ({ ...p, name: v }))}
          />
          <Field
            label={t("email")}
            value={profile.email}
            onChange={(v) => setProfile((p) => ({ ...p, email: v }))}
          />
          <button className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white">
            {t("save")}
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">{t("brandTitle")}</h2>
        <input type="file" accept="image/*" onChange={handleLogoUpload} />
        <p className="text-sm text-gray-400 mt-2">{t("brandHint")}</p>
      </section>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

function Field({ label, value, onChange }: FieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-gray-300">{label}</span>
      <input
        className="px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
