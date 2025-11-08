'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { THEMES, storeThemes } from '../../../../../lib/store/themes';
import type { ThemeDef } from '../../../../../lib/store/themes';

// ----------------------
// Dummy Store (replace later with real store data)
// ----------------------
const dummyStore = {
  _id: 'store123',
  owner: 'owner123',
  brandName: 'Demo Store',
  domain: 'demo-store.com',
  logoUrl: '',
  theme: storeThemes[0].theme,
};

export default function ThemePreviewPage() {
  const [theme, setTheme] = useState<any>(dummyStore.theme);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // -------------------
  // Handle Theme Select
  // -------------------
  const handleSelectTheme = (themeId: string) => {
    const def = THEMES.find((t: ThemeDef) => t.id === themeId);
    if (!def) return;
    setTheme({
      primaryColor: def.colorTokens.primaryColor,
      secondaryColor: def.colorTokens.secondaryColor,
      textColor: def.colorTokens.textColor,
      gradient: def.colorTokens.gradient,
    });
    setSelectedThemeId(themeId);
  };

  // -------------------
  // Handle Save (calls PATCH API)
  // -------------------
  const handleSave = async () => {
    if (!selectedThemeId) {
      toast.error('Please select a theme first.');
      return;
    }

    try {
      setSaving(true);

      const res = await fetch('/api/store/theme', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId: selectedThemeId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save theme');
      }

      toast.success('Theme saved successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Something went wrong while saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 transition-colors duration-300"
      style={{
        backgroundColor: theme.primaryColor || '#fff',
        color: theme.textColor || '#000',
      }}
    >
      {/* Theme Picker */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Choose a Theme
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {THEMES.map((def: ThemeDef) => {
    const t = def.colorTokens;
            const isSelected = selectedThemeId === def.id;
            const borderColor = t.primaryColor || t.secondaryColor || '#4f46e5';

            return (
              <button
                key={def.id}
                onClick={() => handleSelectTheme(def.id)}
                className={`relative flex flex-col rounded-xl border p-4 transition-all duration-200 ${
                  isSelected
                    ? 'scale-[1.03] shadow-lg'
                    : 'hover:scale-[1.02] hover:shadow-md border-gray-200'
                }`}
                style={
                  isSelected
                    ? {
                        borderColor,
                        boxShadow: `0 0 0 3px ${borderColor}40`, // subtle ring effect
                      }
                    : {}
                }
              >
                {/* Theme Preview Gradient */}
                <div
                  className="h-20 rounded-lg mb-3"
                  style={{
                    background: t.gradient
                      ? `linear-gradient(to right, ${t.gradient.from}, ${t.gradient.via}, ${t.gradient.to})`
                      : `linear-gradient(90deg, ${t.primaryColor}, ${t.secondaryColor})`,
                  }}
                />

                {/* Theme Name */}
                <span className="font-medium text-gray-800">{def.name}</span>

                {/* Color Swatches */}
                <div className="flex gap-1 mt-2">
                  {['primaryColor', 'secondaryColor', 'textColor'].map((key) => (
                    <div
                      key={key}
                      className="w-4 h-4 rounded border border-gray-200"
                      style={{ backgroundColor: (t as any)[key] }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!selectedThemeId || saving}
          className="mt-6 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-150 hover:opacity-90 disabled:opacity-50"
          style={{
            backgroundColor: theme.primaryColor || '#4f46e5',
          }}
        >
          {saving ? 'Saving...' : 'Save Selected Theme'}
        </button>
      </div>
    </section>
  );
}
