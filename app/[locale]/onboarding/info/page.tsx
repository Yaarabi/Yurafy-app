"use client"
import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"
import { AiOutlineShoppingCart, AiOutlineWechat } from "react-icons/ai"
import { FaChevronDown, FaChevronUp } from "react-icons/fa"

export default function InfoPage() {
    const plan = useSearchParams().get("plan")
    const locale = useSearchParams().get("locale") ?? "en"
    const router = useRouter()

    // Store fields
    const [brandName, setBrandName] = useState("")
    const [domain, setDomain] = useState("")
    const [description, setDescription] = useState("")
    const [logoUrl, setLogoUrl] = useState("")
    const [whoWeAreDesc, setWhoWeAreDesc] = useState("")
    const [whoWeAreImage, setWhoWeAreImage] = useState("")
    const [facebook, setFacebook] = useState("")
    const [instagram, setInstagram] = useState("")
    const [twitter, setTwitter] = useState("")
    const [linkedin, setLinkedin] = useState("")
    const [heroTitle, setHeroTitle] = useState("")
    const [heroSubtitle, setHeroSubtitle] = useState("")
    const [heroImage, setHeroImage] = useState("")

    // WhatsApp fields
    const [waBusinessId, setWaBusinessId] = useState("")
    const [waNumberId, setWaNumberId] = useState("")
    const [waNumber, setWaNumber] = useState("")
    const [waToken, setWaToken] = useState("")
    const [aiPersonality, setAiPersonality] = useState("friendly assistant")

    const [storeOpen, setStoreOpen] = useState(true)
    const [waOpen, setWaOpen] = useState(true)

    const inputClasses =
        "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"

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
        })
        router.push(`/${locale}/onboarding/checkout?plan=${plan}`)
    }

    const CollapsibleSection = ({
        title,
        color,
        Icon,
        open,
        setOpen,
        children,
    }: {
        title: string
        color: string
        Icon: React.ComponentType<{ size?: number }>
        open: boolean
        setOpen: (val: boolean) => void
        children: React.ReactNode
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
    )

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
        <div className="w-full max-w-4xl space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 text-center">
            Setup Info for <span className="capitalize">{plan}</span>
            </h1>

            {/* Store Section */}
            {(plan === "starter" || plan === "proSeller" || plan === "visionary") && (
            <CollapsibleSection
                title="Store Details"
                color="text-indigo-600"
                Icon={AiOutlineShoppingCart}
                open={storeOpen}
                setOpen={setStoreOpen}
            >
                <input
                placeholder="Brand Name *"
                className={inputClasses}
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                required
                />
                <input
                placeholder="Domain *"
                className={inputClasses}
                value={domain}
                onChange={e => setDomain(e.target.value)}
                required
                />
                <textarea
                placeholder="Description"
                className={inputClasses}
                value={description}
                onChange={e => setDescription(e.target.value)}
                />
                <input
                placeholder="Logo URL"
                className={inputClasses}
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
                />

                <h3 className="font-medium">Who We Are</h3>
                <textarea
                placeholder="Description"
                className={inputClasses}
                value={whoWeAreDesc}
                onChange={e => setWhoWeAreDesc(e.target.value)}
                />
                <input
                placeholder="Image URL"
                className={inputClasses}
                value={whoWeAreImage}
                onChange={e => setWhoWeAreImage(e.target.value)}
                />

                <h3 className="font-medium">Social Links</h3>
                <input
                placeholder="Facebook"
                className={inputClasses}
                value={facebook}
                onChange={e => setFacebook(e.target.value)}
                />
                <input
                placeholder="Instagram"
                className={inputClasses}
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
                />
                <input
                placeholder="Twitter"
                className={inputClasses}
                value={twitter}
                onChange={e => setTwitter(e.target.value)}
                />
                <input
                placeholder="LinkedIn"
                className={inputClasses}
                value={linkedin}
                onChange={e => setLinkedin(e.target.value)}
                />

                <h3 className="font-medium">Hero Section</h3>
                <input
                placeholder="Hero Title"
                className={inputClasses}
                value={heroTitle}
                onChange={e => setHeroTitle(e.target.value)}
                />
                <input
                placeholder="Hero Subtitle"
                className={inputClasses}
                value={heroSubtitle}
                onChange={e => setHeroSubtitle(e.target.value)}
                />
                <input
                placeholder="Hero Image URL"
                className={inputClasses}
                value={heroImage}
                onChange={e => setHeroImage(e.target.value)}
                />
            </CollapsibleSection>
            )}

            {/* WhatsApp Section */}
            {(plan === "whatsapp" || plan === "aiAgent" || plan === "proSeller" || plan === "visionary") && (
            <CollapsibleSection
                title="WhatsApp Account"
                color="text-green-600"
                Icon={AiOutlineWechat}
                open={waOpen}
                setOpen={setWaOpen}
            >
                <input
                placeholder="Business ID *"
                className={inputClasses}
                value={waBusinessId}
                onChange={e => setWaBusinessId(e.target.value)}
                required
                />
                <input
                placeholder="Number ID *"
                className={inputClasses}
                value={waNumberId}
                onChange={e => setWaNumberId(e.target.value)}
                required
                />
                <input
                placeholder="WhatsApp Number *"
                className={inputClasses}
                value={waNumber}
                onChange={e => setWaNumber(e.target.value)}
                required
                />
                <input
                placeholder="Access Token (Encrypted) *"
                type="password"
                className={inputClasses}
                value={waToken}
                onChange={e => setWaToken(e.target.value)}
                required
                />

                <h3 className="font-medium">AI Agent Config</h3>
                <input
                placeholder="Personality"
                className={inputClasses}
                value={aiPersonality}
                onChange={e => setAiPersonality(e.target.value)}
                />
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
    )
}
