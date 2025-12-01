"use client";

interface ActiveVariablesProps {
    variableSpans: Array<{ key: string; seq: number }>;
    onRemove: (seq: number) => void;
}

export default function ActiveVariables({ variableSpans, onRemove }: ActiveVariablesProps) {
    if (!variableSpans.length) return null;
    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-gray-100 p-3 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
                Active Variables ({variableSpans.length}):
            </p>
            <div className="flex flex-wrap gap-2">
                {variableSpans.map((span) => (
                    <span
                        key={span.seq}
                        className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-800/60 text-blue-800 dark:text-blue-100 px-2 py-1 rounded text-xs border border-blue-200 dark:border-blue-700"
                    >
                        <span className="font-mono">{"{{" + span.seq + "}}"}</span>
                        <span className="text-blue-600 dark:text-blue-300">→</span>
                        <span className="font-medium">{span.key}</span>
                        <button
                            onClick={() => onRemove(span.seq)}
                            className="ml-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 font-bold transition-colors"
                            title="Remove variable"
                        >
                            ×
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
}
