"use client";

import { useState, useEffect } from "react";
import { 
    Filter, 
    Search, 
    Trash2, 
    Eye, 
    Mail, 
    Phone,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
    Loader2,
    Briefcase,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface ServiceInquiry {
    _id: string;
    fullName: string;
    phoneNumber: string;
    email: string;
    serviceType: string;
    domainOfWork?: string;
    message?: string;
    status: 'new' | 'contacted' | 'converted' | 'closed';
    createdAt: string;
    updatedAt: string;
}

const statusColors = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    converted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const statusIcons = {
    new: Clock,
    contacted: Eye,
    converted: CheckCircle2,
    closed: XCircle,
};

export default function AdminServicesManagement() {
    const [inquiries, setInquiries] = useState<ServiceInquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterService, setFilterService] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInquiry, setSelectedInquiry] = useState<ServiceInquiry | null>(null);

    useEffect(() => {
        fetchInquiries();
    }, [filterService, filterStatus]);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filterService !== 'all') params.append('serviceType', filterService);
            if (filterStatus !== 'all') params.append('status', filterStatus);
            params.append('sortBy', 'createdAt');
            params.append('order', 'desc');

            const response = await fetch(`/api/services/inquiries?${params}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to fetch inquiries');
            }

            const data = await response.json();
            setInquiries(data.inquiries || []);
        } catch (error: any) {
            console.error('Error fetching inquiries:', error);
            toast.error(error.message || 'Failed to load service inquiries');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            const response = await fetch('/api/services/inquiries', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status }),
            });

            if (!response.ok) throw new Error('Failed to update status');

            toast.success('Status updated successfully');
            fetchInquiries();
            if (selectedInquiry?._id === id) {
                setSelectedInquiry({ ...selectedInquiry, status: status as any });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const deleteInquiry = async (id: string) => {
        if (!confirm('Are you sure you want to delete this inquiry?')) return;

        try {
            const response = await fetch(`/api/services/inquiries?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete inquiry');

            toast.success('Inquiry deleted');
            fetchInquiries();
            if (selectedInquiry?._id === id) {
                setSelectedInquiry(null);
            }
        } catch (error) {
            console.error('Error deleting inquiry:', error);
            toast.error('Failed to delete inquiry');
        }
    };

    const filteredInquiries = inquiries.filter((inquiry) => {
        const matchesSearch = 
            inquiry.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inquiry.phoneNumber.includes(searchTerm);
        return matchesSearch;
    });

    const serviceTypes = [
        'Basic Store',
        'Store + WhatsApp Auto Reply',
        'Store + Delivery API Integration',
        'Full COD System (Automation)',
        'AI WhatsApp Agent Integration',
        // Newly-added service types (model enum)
        'Custom Website',
        'WordPress website',
        'Shopify Store',
    ];

    const statuses = ['new', 'contacted', 'converted', 'closed'];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-indigo-600" />
                    Services Management
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Manage customer service inquiries and requests</p>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, email, phone..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>

                    {/* Service Type Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                            value={filterService}
                            onChange={(e) => setFilterService(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">All Services</option>
                            {serviceTypes.map((service) => (
                                <option key={service} value={service}>
                                    {service}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">All Statuses</option>
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredInquiries.length} of {inquiries.length} inquiries
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                    Service
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                    Domain
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredInquiries.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        No service inquiries found
                                    </td>
                                </tr>
                            ) : (
                                filteredInquiries.map((inquiry) => {
                                    const StatusIcon = statusIcons[inquiry.status];
                                    return (
                                        <tr
                                            key={inquiry._id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                                            onClick={() => setSelectedInquiry(inquiry)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {new Date(inquiry.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {inquiry.fullName}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {inquiry.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                {inquiry.serviceType}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                                                {inquiry.domainOfWork || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[inquiry.status]}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteInquiry(inquiry._id);
                                                    }}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedInquiry && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSelectedInquiry(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 flex items-center justify-between z-10">
                                <h2 className="text-2xl font-bold text-white">Inquiry Details</h2>
                                <button
                                    onClick={() => setSelectedInquiry(null)}
                                    className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Customer Info */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Customer Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {selectedInquiry.email}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                                <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Phone</div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {selectedInquiry.phoneNumber}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Service Info */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                        Service Requested
                                    </h3>
                                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg">
                                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                                            {selectedInquiry.serviceType}
                                        </div>
                                        {selectedInquiry.domainOfWork && (
                                            <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                                Domain: <span className="font-medium">{selectedInquiry.domainOfWork}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Message */}
                                {selectedInquiry.message && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                            Message
                                        </h3>
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                {selectedInquiry.message}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Status Update */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                        Update Status
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {statuses.map((status) => {
                                            const StatusIcon = statusIcons[status as keyof typeof statusIcons];
                                            return (
                                                <button
                                                    key={status}
                                                    onClick={() => updateStatus(selectedInquiry._id, status)}
                                                    className={`p-3 rounded-lg font-medium transition-all ${
                                                        selectedInquiry.status === status
                                                            ? statusColors[status as keyof typeof statusColors] + ' ring-2 ring-offset-2 ring-indigo-500'
                                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                    }`}
                                                >
                                                    <StatusIcon className="w-5 h-5 mx-auto mb-1" />
                                                    <div className="text-xs">{status.charAt(0).toUpperCase() + status.slice(1)}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Timestamps */}
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            Submitted: {new Date(selectedInquiry.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Clock className="w-4 h-4" />
                                        <span>
                                            Last Updated: {new Date(selectedInquiry.updatedAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
