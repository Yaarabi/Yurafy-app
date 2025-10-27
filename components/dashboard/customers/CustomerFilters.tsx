"use client";


interface Props {
    filters: { status: string; address: string };
    onChange: (filters: { status: string; address: string }) => void;
}

export default function CustomerFilters({ filters, onChange }: Props) {
    return (
        <div className="flex flex-wrap gap-4 mb-4">
        {/* Status Filter */}
        <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="px-3 py-2 rounded border dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white"
        >
            <option value="All">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="delivered">Delivered</option>
            <option value="new">New</option>
        </select>

        {/* Address Filter */}
        <input
            type="text"
            placeholder="Filter by address, city, or country"
            value={filters.address}
            onChange={(e) => onChange({ ...filters, address: e.target.value })}
            className="px-3 py-2 rounded border dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white flex-1 min-w-[200px]"
        />
        </div>
    );
}
