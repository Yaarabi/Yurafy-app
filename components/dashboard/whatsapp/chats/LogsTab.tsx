'use client';

import { useEffect, useState, useMemo } from 'react';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import { IWhatsAppConversation } from '@/models/whatsappMessage';
import { Filter, X, Search, SortAsc, SortDesc } from 'lucide-react';
import { useUserFeatures } from '@/hooks/useUserFeatures';
import { useTranslations } from 'next-intl';
import { normalizePhoneNumber } from '@/lib/utils/phoneUtils';

type SortOption = 'newest' | 'oldest' | 'mostUnread' | 'name';
type StatusFilter = 'all' | 'opted_in' | 'opted_out' | 'human_required';

export default function LogsTab() {
    const [conversations, setConversations] = useState<IWhatsAppConversation[]>([]);
    const [activeConv, setActiveConv] = useState<IWhatsAppConversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [filters, setFilters] = useState({
        autoReply: false,
        adTemplate: false,
        adTemplate: false,
        agentReply: false,
        unread: false,
    });
    const { data: featuresData } = useUserFeatures();
    const hasAIAgent = featuresData?.planFeatures?.ai?.enabled ?? false;
    const t = useTranslations('whatsapp.conversations');

    useEffect(() => {
        const fetchConversations = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/whatsapp/conversations');
            if (!res.ok) throw new Error('Failed to fetch conversations');
            const data = await res.json();
            setConversations(data.conversations || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
        };
        fetchConversations();
    }, []);

    // Debounce search query
    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Filter and sort conversations
    const filteredAndSortedConversations = useMemo(() => {
        let filtered = [...conversations];

        // Apply search filter (name or phone)
        if (debouncedSearch.trim()) {
            const query = debouncedSearch.toLowerCase().trim();
            // Normalize search query for phone number matching
            const normalizedQuery = normalizePhoneNumber(query).toLowerCase();
            filtered = filtered.filter(conv => {
                const customer = conv.customer || {};
                const name = (customer.name || '').toLowerCase();
                const phone = customer.phone ? normalizePhoneNumber(customer.phone).toLowerCase() : '';
                // Search in name, original phone, or normalized phone
                return name.includes(query) || 
                       phone.includes(normalizedQuery) || 
                       (customer.phone || '').toLowerCase().includes(query);
            });
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(conv => {
                if (statusFilter === 'human_required') {
                    return conv.status === 'human_required';
                }
                return conv.optInStatus === statusFilter;
            });
        }

        // Apply metadata filters (AND logic - all selected must match)
        const activeMetadataFilters = Object.entries(filters).filter(([_, active]) => active);
        if (activeMetadataFilters.length > 0) {
            filtered = filtered.filter(conv => {
                return activeMetadataFilters.every(([filterName, _]) => {
                    switch (filterName) {
                        case 'autoReply':
                            return conv.metadata?.autoReplySent === true;
                        case 'adTemplate':
                            return conv.metadata?.adTemplateSent === true;
                        case 'agentReply':
                            return conv.messages?.some((msg: any) => msg.isAIResponse === true);
                        case 'unread':
                            return (conv.unreadCount || 0) > 0;
                        default:
                            return true;
                    }
                });
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return (b.lastTimestamp || 0) - (a.lastTimestamp || 0);
                case 'oldest':
                    return (a.lastTimestamp || 0) - (b.lastTimestamp || 0);
                case 'mostUnread':
                    return (b.unreadCount || 0) - (a.unreadCount || 0);
                case 'name':
                    const nameA = (a.customer?.name || a.customer?.phone || '').toLowerCase();
                    const nameB = (b.customer?.name || b.customer?.phone || '').toLowerCase();
                    return nameA.localeCompare(nameB);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [conversations, debouncedSearch, statusFilter, filters, sortBy]);

    const toggleFilter = (filterName: keyof typeof filters) => {
        setFilters(prev => ({ ...prev, [filterName]: !prev[filterName] }));
    };

    const clearAllFilters = () => {
        setFilters({
            autoReply: false,
            adTemplate: false,
            agentReply: false,
            unread: false,
        });
        setSearchQuery('');
        setStatusFilter('all');
        setSortBy('newest');
    };

    const hasActiveFilters = useMemo(() => {
        return Object.values(filters).some(v => v) || 
               debouncedSearch.trim() !== '' || 
               statusFilter !== 'all';
    }, [filters, debouncedSearch, statusFilter]);

    return (
        <div className="flex flex-col h-[85vh] overflow-hidden bg-white dark:bg-gray-700">
        {/* Filters Section */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-3 space-y-3">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder={t('searchPlaceholder') || 'Search by name or phone number...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent"
                />
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('filters') || 'Filters:'}</span>
                </div>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent"
                >
                    <option value="all">{t('status.all') || 'All Status'}</option>
                    <option value="opted_in">{t('status.optedIn')}</option>
                    <option value="opted_out">{t('status.optedOut')}</option>
                    <option value="human_required">{t('status.humanNeeded')}</option>
                </select>

                {/* Metadata Filters */}
                <button
                    onClick={() => toggleFilter('autoReply')}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        filters.autoReply
                            ? 'bg-[var(--brand-blue)] text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    title={t('filterButtons.autoReply') || 'Show conversations with auto reply sent'}
                >
                    {t('filterButtons.autoReply') || 'Auto Reply'}
                </button>
                <button
                    onClick={() => toggleFilter('adTemplate')}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        filters.adTemplate
                            ? 'bg-[var(--brand-blue)] text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    title={t('filterButtons.adTemplate') || 'Show conversations with ad template sent'}
                >
                    {t('filterButtons.adTemplate') || 'Ad Template'}
                </button>
                {hasAIAgent && (
                    <button
                        onClick={() => toggleFilter('agentReply')}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                            filters.agentReply
                                ? 'bg-[var(--brand-blue)] text-white'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                        title={t('filterButtons.agentReply') || 'Show conversations with AI agent replies'}
                    >
                        {t('filterButtons.agentReply') || 'Agent Reply'}
                    </button>
                )}
                <button
                    onClick={() => toggleFilter('unread')}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        filters.unread
                            ? 'bg-[var(--brand-blue)] text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    title={t('filterButtons.unread') || 'Show conversations with unread messages'}
                >
                    {t('filterButtons.unread') || 'Unread'}
                </button>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1 ml-2">
                    {sortBy === 'newest' ? (
                        <SortDesc className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    ) : sortBy === 'oldest' ? (
                        <SortAsc className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    ) : (
                        <SortAsc className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    )}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="px-2 py-1.5 text-xs rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 focus:ring-2 focus:ring-[var(--brand-blue)] focus:border-transparent"
                    >
                        <option value="newest">{t('sort.newest') || 'Newest'}</option>
                        <option value="oldest">{t('sort.oldest') || 'Oldest'}</option>
                        <option value="mostUnread">{t('sort.mostUnread') || 'Most Unread'}</option>
                        <option value="name">{t('sort.name') || 'Name'}</option>
                    </select>
                </div>

                {/* Results Count and Clear Button */}
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {filteredAndSortedConversations.length} {t('of') || 'of'} {conversations.length}
                    </span>
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                        >
                            <X className="w-3 h-3" />
                            {t('clearAll') || 'Clear All'}
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div
                className={`w-full md:w-1/3 border-r border-gray-200 dark:border-gray-600 ${
                activeConv ? 'hidden md:block' : 'block'
                }`}
            >
                {loading ? (
                <p className="text-gray-500 dark:text-gray-300 text-center mt-6">{t('loading') || 'Loading...'}</p>
                ) : (
                <ConversationList conversations={filteredAndSortedConversations} onSelect={setActiveConv} />
                )}
            </div>

            {/* Chat Window */}
            <div className={`flex-1 ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
                {activeConv ? (
                <ChatWindow
                    key={activeConv._id?.toString()} 
                    conversation={activeConv}
                    onBack={() => setActiveConv(null)}
                />
                ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    {t('selectConversation') || 'Select a conversation'}
                </div>
                )}
            </div>
        </div>
        </div>
    );
}
