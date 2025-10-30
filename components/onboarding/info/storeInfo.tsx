
"use client";

import { useState } from "react";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

/* ------------------- Reusable Inputs ------------------- */
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
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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

/* ------------------- Store Section ------------------- */
export default function StoreSection({
    storeData,
    setStoreData,
    open,
    setOpen,
    }: {
    storeData: any;
    setStoreData: (data: any) => void;
    open: boolean;
    setOpen: (val: boolean) => void;
    }) {
    return (
        <CollapsibleSection
        title="Store Details"
        color="text-indigo-600"
        Icon={AiOutlineShoppingCart}
        open={open}
        setOpen={setOpen}
        >
        <InputField placeholder="Brand Name *" value={storeData.brandName} onChange={(e) => setStoreData({ ...storeData, brandName: e.target.value })} required />
        <InputField placeholder="Domain *" value={storeData.domain} onChange={(e) => setStoreData({ ...storeData, domain: e.target.value })} required />
        <TextAreaField placeholder="Description" value={storeData.description} onChange={(e) => setStoreData({ ...storeData, description: e.target.value })} />
        <InputField placeholder="Logo URL" value={storeData.logoUrl} onChange={(e) => setStoreData({ ...storeData, logoUrl: e.target.value })} />

        <h3 className="font-medium">Who We Are</h3>
        <TextAreaField placeholder="Description" value={storeData.whoWeAreDesc} onChange={(e) => setStoreData({ ...storeData, whoWeAreDesc: e.target.value })} />
        <InputField placeholder="Image URL" value={storeData.whoWeAreImage} onChange={(e) => setStoreData({ ...storeData, whoWeAreImage: e.target.value })} />

        <h3 className="font-medium">Social Links</h3>
        <InputField placeholder="Facebook" value={storeData.facebook} onChange={(e) => setStoreData({ ...storeData, facebook: e.target.value })} />
        <InputField placeholder="Instagram" value={storeData.instagram} onChange={(e) => setStoreData({ ...storeData, instagram: e.target.value })} />
        <InputField placeholder="Twitter" value={storeData.twitter} onChange={(e) => setStoreData({ ...storeData, twitter: e.target.value })} />
        <InputField placeholder="LinkedIn" value={storeData.linkedin} onChange={(e) => setStoreData({ ...storeData, linkedin: e.target.value })} />

        <h3 className="font-medium">Hero Section</h3>
        <InputField placeholder="Hero Title" value={storeData.heroTitle} onChange={(e) => setStoreData({ ...storeData, heroTitle: e.target.value })} />
        <InputField placeholder="Hero Subtitle" value={storeData.heroSubtitle} onChange={(e) => setStoreData({ ...storeData, heroSubtitle: e.target.value })} />
        <InputField placeholder="Hero Image URL" value={storeData.heroImage} onChange={(e) => setStoreData({ ...storeData, heroImage: e.target.value })} />
        </CollapsibleSection>
    );
}
