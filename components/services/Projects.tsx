"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface Project {
    _id: string;
    name: string;
    link: string;
    img: string;
}

export default function Projects({ locale, initialProjects }: { locale: string; initialProjects?: Project[] }) {
    const t = useTranslations("services");
    const [projects, setProjects] = useState<Project[]>(initialProjects || []);
    const [loading, setLoading] = useState(!initialProjects);

    useEffect(() => {
        // Only fetch if no initial data was provided
        if (initialProjects && initialProjects.length > 0) return;

        let cancelled = false;
        async function load() {
        try {
            setLoading(true);
            const res = await fetch("/api/projects", { cache: "no-store" });
            if (!res.ok) throw new Error("Failed to load projects");
            const data = await res.json();
            if (!cancelled) setProjects(data.projects || []);
        } catch (err) {
            console.error(err);
        } finally {
            if (!cancelled) setLoading(false);
        }
        }
        load();
        return () => {
        cancelled = true;
        };
    }, [initialProjects]);

    if (loading)
        return (
        <section className="max-w-7xl mx-auto px-4 py-16">
            <h3 className="text-2xl font-semibold text-center text-gray-900 dark:text-white mb-4">
            {t("projectsTitle")}
            </h3>
            <p className="text-center text-gray-500">Loading projects…</p>
        </section>
        );

    return (
        <section
        id="projects"
        className="max-w-7xl mx-auto px-4 py-20"
        >
        {/* Header */}
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {t("projectsTitle")}
            </h2>
            <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-sky-500" />
            {t("projectsSubtitle") && (
            <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {t("projectsSubtitle")}
            </p>
            )}
        </div>

        {projects.length === 0 ? (
            <p className="text-center text-gray-500">
            {t("projectsEmpty") || "No projects yet"}
            </p>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((p) => (
                <a
                key={p._id}
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-xl overflow-hidden border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                    <img
                    src={p.img}
                    alt={p.name}
                    className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Content */}
                <div className="p-5">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
                    {p.name}
                    </h4>

                    <span className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 dark:text-sky-400 group-hover:gap-2 transition-all">
                    {t("projectsView")}
                    <span aria-hidden>→</span>
                    </span>
                </div>

                {/* Hover border glow */}
                <div className="absolute inset-0 rounded-xl ring-1 ring-transparent group-hover:ring-sky-500/40 transition" />
                </a>
            ))}
            </div>
        )}
        </section>
    );
}
