import { Sparkles } from 'lucide-react';

export default function ChatHeader() {
    return (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8" />
                <h2 className="text-2xl font-bold">AI Store Setup Assistant</h2>
            </div>
            <p className="text-indigo-100">
                Tell me about your business and I'll help you set up your store automatically!
            </p>
        </div>
    );
}

