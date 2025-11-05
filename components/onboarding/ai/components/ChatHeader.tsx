import { Sparkles } from 'lucide-react';

export default function ChatHeader() {
    return (
        <div className="bg-[var(--brand-blue)] rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8" />
                <h2 className="text-2xl font-bold">AI Store Setup Assistant</h2>
            </div>
            <p className="text-white/80">
                Tell me about your business and I'll help you set up your store automatically!
            </p>
        </div>
    );
}

