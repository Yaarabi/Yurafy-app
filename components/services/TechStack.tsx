"use client";

import Image from "next/image";
import { useLocale } from "next-intl";

interface TechLogo {
    name: string;
    logo: string;
}

export default function HeroTechStackLogos() {
    const locale = useLocale();
    const isRTL = locale === "ar";

    const techStack: TechLogo[] = [
        { name: "MongoDB", logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original.svg" },
        { name: "Express.js", logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original.svg" },
        { name: "React", logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" },
        { name: "Node.js", logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" },
        { name: "JavaScript", logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" },
        { name: "TypeScript", logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" },
        { name: "Next.js", logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/nextjs/nextjs-original.svg" },
        { name: "NestJS", logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/nestjs/nestjs-original.svg" },
        { name: "Python", logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg" },
        { name: "PostgreSQL", logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" },
        { name: "Tailwind CSS", logo: "https://cdn.simpleicons.org/tailwindcss/38BDF8" },
        { name: "Supabase", logo: "https://avatars.githubusercontent.com/u/54469796?s=200&v=4" },
        { name: "AI", logo: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png" },
        { name: "LangChain", logo: "https://avatars.githubusercontent.com/u/126733545?s=200&v=4" },
        { name: "WordPress", logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/wordpress/wordpress-original.svg" },
        { name: "Shopify", logo: "https://cdn.simpleicons.org/shopify/7AB55C" },
        { name: "YouCan", logo: "https://th.bing.com/th/id/OIP.E-PvLR6LHo0gjgSwZPv9qAAAAA?w=147&h=180&c=7&r=0&o=7&pid=1.7" },
    ];

    return (
        <section className="relative overflow-hidden py-16 bg-gradient-to-b from-white via-gray-50 to-white">
        {/* subtle fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />

        <div
            className="flex gap-8 w-fit hover:[animation-play-state:paused]"
            style={{
            animation: isRTL
                ? "scrollRight 60s linear infinite"
                : "scrollLeft 60s linear infinite",
            }}
        >
            {techStack.map((tech, index) => (
            <div key={index} className="flex-shrink-0 w-[190px]">
                <div
                className="
                    group h-full rounded-2xl border border-gray-200/60
                    bg-white/80 backdrop-blur-md
                    p-6 flex flex-col items-center gap-4
                    shadow-sm transition-all duration-300
                    hover:-translate-y-1 hover:shadow-xl
                    hover:border-gray-300
                "
                >
                <div className="relative w-16 h-16">
                    <Image
                    src={tech.logo}
                    alt={tech.name}
                    fill
                    sizes="64px"
                    className="
                        object-contain
                        grayscale opacity-80
                        transition-all duration-300
                        group-hover:grayscale-0 group-hover:opacity-100
                    "
                    loading="lazy"
                    />
                </div>

                <p className="text-sm font-semibold text-gray-800 text-center tracking-wide">
                    {tech.name}
                </p>
                </div>
            </div>
            ))}
        </div>
        </section>
    );
}
