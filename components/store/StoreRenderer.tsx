"use client";

import React from "react";
import { StorePageSchema } from "@/lib/store/StoreSchema";

interface StoreRendererProps {
  schema: StorePageSchema;
  themeId?: string;
}

export default function StoreRenderer({ schema }: StoreRendererProps) {
  if (!schema || !Array.isArray(schema.sections)) return null;

  return (
    <div className="w-full">
      {schema.sections.map((section) => {
        if (section.visible === false) return null;
        switch (section.type) {
          case "hero":
            return (
              <section key={section.id} className="py-16 bg-gradient-to-r from-green-50 to-white">
                <div className="max-w-6xl mx-auto px-6 text-center">
                  <h1 className="text-3xl md:text-5xl font-extrabold mb-4">{section.title}</h1>
                  {section.subtitle && <p className="text-lg text-gray-600 mb-6">{section.subtitle}</p>}
                  {section.imageUrl && (
                    <div className="mt-6">
                      <img src={section.imageUrl} alt={section.title || "hero"} className="mx-auto max-h-64 object-cover rounded-lg" />
                    </div>
                  )}
                </div>
              </section>
            );

          case "about":
            return (
              <section key={section.id} className="py-12 bg-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                  <h2 className="text-2xl font-semibold mb-3">{section.heading || "About"}</h2>
                  {section.imageUrl && (
                    <div className="mb-4">
                      <img src={section.imageUrl} alt={section.heading || "about"} className="mx-auto w-full max-w-md object-cover rounded" />
                    </div>
                  )}
                  <p className="text-gray-600">{section.description}</p>
                </div>
              </section>
            );

          case "features":
            return (
              <section key={section.id} className="py-12 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                  <h3 className="text-2xl font-bold text-center mb-6">{section.heading || "Features"}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(section.features || []).map((f, idx) => (
                      <div key={idx} className="p-6 bg-white rounded shadow-sm">
                        <h4 className="font-semibold mb-2">{f.title}</h4>
                        {f.description && <p className="text-sm text-gray-600">{f.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
