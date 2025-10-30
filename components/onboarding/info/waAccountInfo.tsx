
"use client";

import { AiOutlineWechat } from "react-icons/ai";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const InputField = ({
    placeholder,
    value,
    onChange,
    type = "text",
    required = false,
    }: {
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    required?: boolean;
    }) => (
    <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none transition"
    />
    );

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

export default function WhatsAppSection({
    waData,
    setWaData,
    open,
    setOpen,
    }: {
    waData: any;
    setWaData: (data: any) => void;
    open: boolean;
    setOpen: (val: boolean) => void;
    }) {
    return (
        <CollapsibleSection
        title="WhatsApp Account"
        color="text-green-600"
        Icon={AiOutlineWechat}
        open={open}
        setOpen={setOpen}
        >
        <InputField placeholder="Business ID *" value={waData.waBusinessId} onChange={(e) => setWaData({ ...waData, waBusinessId: e.target.value })} required />
        <InputField placeholder="Number ID *" value={waData.waNumberId} onChange={(e) => setWaData({ ...waData, waNumberId: e.target.value })} required />
        <InputField placeholder="WhatsApp Number *" value={waData.waNumber} onChange={(e) => setWaData({ ...waData, waNumber: e.target.value })} required />
        <InputField placeholder="Access Token (Encrypted) *" type="password" value={waData.waToken} onChange={(e) => setWaData({ ...waData, waToken: e.target.value })} required />
        <h3 className="font-medium">AI Agent Config</h3>
        <InputField placeholder="Personality" value={waData.aiPersonality} onChange={(e) => setWaData({ ...waData, aiPersonality: e.target.value })} />
        </CollapsibleSection>
    );
}
