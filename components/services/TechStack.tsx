
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
        {
            name: "MongoDB",
            logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original.svg",
        },
        {
            name: "Express.js",
            logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original.svg",
        },
        {
            name: "React",
            logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg",
        },
        {
            name: "Node.js",
            logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg",
        },
        {
            name: "JavaScript",
            logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg",
        },
        {
            name: "TypeScript",
            logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg",
        },
        {
            name: "Next.js",
            logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/nextjs/nextjs-original.svg",
        },
        {
            name: "NestJS",
            logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/nestjs/nestjs-original.svg",
        },
        {
            name: "Python",
            logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg",
        },
        {
            name: "PostgreSQL",
            logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg",
        },
        {
            name: "Tailwind CSS",
            logo: "https://th.bing.com/th/id/OIP.pEeKeUoENMqoN-kR8f8XoQHaFj?w=213&h=180&c=7&r=0&o=7&cb=ucfimg2&pid=1.7&rm=3&ucfimg=1",  
        },
        {
            name: "Supabase",
            logo: "https://th.bing.com/th/id/OIP.N8uT5pHYxSqVZheYB4H64AHaHl?w=157&h=180&c=7&r=0&o=7&cb=ucfimg2&pid=1.7&rm=3&ucfimg=1",
        },
        {
            name: "AI",
            logo: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
        },
        {
            name: "LangChain",
            logo: "https://avatars.githubusercontent.com/u/126733545?s=200&v=4",
        },
        {
            name: "WordPress",
            logo: "https://raw.githubusercontent.com/devicons/devicon/master/icons/wordpress/wordpress-original.svg",
        },
        {
            name: "Shopify",
            logo: "https://cdn.simpleicons.org/shopify/7AB55C",
        },
        {
            name: "YouCan",
            logo: "https://th.bing.com/th/id/OIP.E-PvLR6LHo0gjgSwZPv9qAAAAA?w=147&h=180&c=7&r=0&o=7&cb=ucfimg2&pid=1.7&rm=3&ucfimg=1",
        },
    ];

    return (
        <section className="overflow-hidden py-12 bg-white">
            <div
                className="flex gap-6"
                style={{
                    animation: isRTL ? `scrollRight 60s linear infinite` : `scrollLeft 60s linear infinite`,
                    width: 'fit-content',
                }}
            >
                {techStack.map((tech, index) => (
                    <div
                        key={index}
                        className="flex-shrink-0 w-[180px] hover:scale-108 transition-transform duration-300"
                    >
                        <div className="h-full flex flex-col items-center justify-center gap-4 bg-white border border-gray-100 rounded-2xl p-6 shadow-md hover:shadow-xl transition">
                            <div className="relative w-16 h-16">
                                <Image
                                    src={tech.logo}
                                    alt={tech.name}
                                    fill
                                    className="object-contain"
                                    sizes="64px"
                                    loading="lazy"
                                />
                            </div>

                            <p className="text-sm font-semibold text-gray-800 text-center">
                                {tech.name}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
