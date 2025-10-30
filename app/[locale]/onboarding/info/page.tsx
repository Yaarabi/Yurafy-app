"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { AiOutlineShoppingCart, AiOutlineWechat } from "react-icons/ai";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

/* ------------------- Reusable Input Components ------------------- */
const InputField = ({
    label,
    placeholder,
    value,
    onChange,
    type = "text",
    required = false,
    }: {
    label?: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: string;
    required?: boolean;
    }) => (
    <div>
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
        />
    </div>
    );

    const TextAreaField = ({
    label,
    placeholder,
    value,
    onChange,
    }: {
    label?: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    }) => (
    <div>
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
        />
    </div>
    );

    /* ------------------- Collapsible Section ------------------- */
    const CollapsibleSection = ({
    title,
    color,
    Icon,
    open,
    setOpen,
    children,
    }: {
    title: string;
    color: string;
    Icon: React.ComponentType<{ size?: number }>;
    open: boolean;
    setOpen: (val: boolean) => void;
    children: React.ReactNode;
    }) => (
    <div className="bg-white shadow-md rounded-xl p-6">
        <button
        onClick={() => setOpen(!open)}
        className={`flex justify-between items-center w-full text-left ${color} font-semibold text-lg`}
        >
        <div className="flex items-center gap-2">
            <Icon size={24} />
            {title}
        </div>
        {open ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {open && <div className="mt-4 space-y-3">{children}</div>}
    </div>
);

/* ------------------- Main Page Component ------------------- */
export default function InfoPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // 🧠 Fix the focus bug (memoize search params)
    const plan = useMemo(() => searchParams.get("plan"), [searchParams]);
    const locale = useMemo(() => searchParams.get("locale") ?? "en", [searchParams]);

    /* ------------------- Store Fields ------------------- */
    const [brandName, setBrandName] = useState("");
    const [domain, setDomain] = useState("");
    const [description, setDescription] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [whoWeAreDesc, setWhoWeAreDesc] = useState("");
    const [whoWeAreImage, setWhoWeAreImage] = useState("");
    const [facebook, setFacebook] = useState("");
    const [instagram, setInstagram] = useState("");
    const [twitter, setTwitter] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [heroTitle, setHeroTitle] = useState("");
    const [heroSubtitle, setHeroSubtitle] = useState("");
    const [heroImage, setHeroImage] = useState("");

    /* ------------------- WhatsApp Fields ------------------- */
    const [waBusinessId, setWaBusinessId] = useState("");
    const [waNumberId, setWaNumberId] = useState("");
    const [waNumber, setWaNumber] = useState("");
    const [waToken, setWaToken] = useState("");
    const [aiPersonality, setAiPersonality] = useState("friendly assistant");

    const [storeOpen, setStoreOpen] = useState(true);
    const [waOpen, setWaOpen] = useState(true);

    /* ------------------- Handle Submit ------------------- */
    const handleSubmit = async () => {
        await fetch("/api/onboarding/save-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            plan,
            store: {
            brandName,
            domain,
            description,
            logoUrl,
            whoWeAre: { description: whoWeAreDesc, imageUrl: whoWeAreImage },
            socialLinks: { facebook, instagram, twitter, linkedin },
            hero: { title: heroTitle, subtitle: heroSubtitle, imageUrl: heroImage },
            },
            whatsapp: {
            waBusinessId,
            waNumberId,
            waNumber,
            waTokenEncrypted: waToken,
            aiConfig: { personality: aiPersonality },
            },
        }),
        });
        router.push(`/${locale}/onboarding/checkout?plan=${plan}`);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
        <div className="w-full max-w-4xl space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 text-center">
            Setup Info for <span className="capitalize">{plan}</span>
            </h1>

            {/* 🛍️ Store Section */}
            {(plan === "starter" || plan === "proSeller" || plan === "visionary") && (
            <CollapsibleSection
                title="Store Details"
                color="text-indigo-600"
                Icon={AiOutlineShoppingCart}
                open={storeOpen}
                setOpen={setStoreOpen}
            >
                <InputField placeholder="Brand Name *" value={brandName} onChange={(e) => setBrandName(e.target.value)} required />
                <InputField placeholder="Domain *" value={domain} onChange={(e) => setDomain(e.target.value)} required />
                <TextAreaField placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                <InputField placeholder="Logo URL" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />

                <h3 className="font-medium">Who We Are</h3>
                <TextAreaField placeholder="Description" value={whoWeAreDesc} onChange={(e) => setWhoWeAreDesc(e.target.value)} />
                <InputField placeholder="Image URL" value={whoWeAreImage} onChange={(e) => setWhoWeAreImage(e.target.value)} />

                <h3 className="font-medium">Social Links</h3>
                <InputField placeholder="Facebook" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
                <InputField placeholder="Instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                <InputField placeholder="Twitter" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
                <InputField placeholder="LinkedIn" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />

                <h3 className="font-medium">Hero Section</h3>
                <InputField placeholder="Hero Title" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
                <InputField placeholder="Hero Subtitle" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
                <InputField placeholder="Hero Image URL" value={heroImage} onChange={(e) => setHeroImage(e.target.value)} />
            </CollapsibleSection>
            )}

            {/* 💬 WhatsApp Section */}
            {(plan === "whatsapp" || plan === "aiAgent" || plan === "proSeller" || plan === "visionary") && (
            <CollapsibleSection
                title="WhatsApp Account"
                color="text-green-600"
                Icon={AiOutlineWechat}
                open={waOpen}
                setOpen={setWaOpen}
            >
                <InputField placeholder="Business ID *" value={waBusinessId} onChange={(e) => setWaBusinessId(e.target.value)} required />
                <InputField placeholder="Number ID *" value={waNumberId} onChange={(e) => setWaNumberId(e.target.value)} required />
                <InputField placeholder="WhatsApp Number *" value={waNumber} onChange={(e) => setWaNumber(e.target.value)} required />
                <InputField
                placeholder="Access Token (Encrypted) *"
                type="password"
                value={waToken}
                onChange={(e) => setWaToken(e.target.value)}
                required
                />

                <h3 className="font-medium">AI Agent Config</h3>
                <InputField placeholder="Personality" value={aiPersonality} onChange={(e) => setAiPersonality(e.target.value)} />
            </CollapsibleSection>
            )}

            <button
            onClick={handleSubmit}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 active:scale-95 transition"
            >
            Continue to Checkout
            </button>
        </div>
        </div>
    );
}
