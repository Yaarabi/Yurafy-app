"use client";

import AddTemplate from "./AddTemplate";
import TemplateList from "./TemplateList";


export default function TemplatesTab() {

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Manage Templates</h2>
            <AddTemplate />
            <TemplateList />
        </div>
    );
}
