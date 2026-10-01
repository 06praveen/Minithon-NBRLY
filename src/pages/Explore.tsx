import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { Input } from '../components/ui/Input';
import { RequestCard } from '../components/ui/RequestCard';
import { EmptyState } from '../components/ui/EmptyState';
import { useRequests } from '../context/RequestContext';
import { Category, Urgency } from '../types';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';

const CATEGORIES: (Category | 'All')[] = [
  'All',
  'Healthcare / Medicine',
  'Grocery / Errands',
  'Education',
  'Technology',
  'Transport',
  'Household',
  'Elderly Assistance',
];

type SortOption = 'Recommended' | 'Most Urgent' | 'Newest';

export const Explore: React.FC = () => {
  const navigate = useNavigate();
  const { requests } = useRequests();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedUrgency, setSelectedUrgency] = useState<Urgency | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('Recommended');

  // Combined Search, Category, Urgency, and Sorting filtering
  const filteredRequests = useMemo(() => {
    let result = requests.filter((req) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        req.title.toLowerCase().includes(term) ||
        req.description.toLowerCase().includes(term) ||
        req.category.toLowerCase().includes(term) ||
        req.neighborhood.toLowerCase().includes(term);

      const matchesCategory =
        selectedCategory === 'All' || req.category === selectedCategory;

      const matchesUrgency =
        selectedUrgency === 'All' || req.urgency === selectedUrgency;

      return matchesSearch && matchesCategory && matchesUrgency;
    });

    // Sort requests
    if (sortBy === 'Recommended') {
      result.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (sortBy === 'Most Urgent') {
      const urgencyRank: Record<Urgency, number> = { URGENT: 3, TODAY: 2, FLEXIBLE: 1 };
      result.sort((a, b) => urgencyRank[b.urgency] - urgencyRank[a.urgency]);
    }

    return result;
  }, [requests, searchTerm, selectedCategory, selectedUrgency, sortBy]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedUrgency('All');
    setSortBy('Recommended');
  };

  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'All' || selectedUrgency !== 'All';

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <PageHeader
        kicker="NEIGHBORHOOD DISCOVERY"
        title="FIND HELP NEARBY"
        description="Small requests. Nearby people. Real help."
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal bg-lime px-3 py-1.5 rounded-full border border-charcoal/10">
              {filteredRequests.length} {filteredRequests.length === 1 ? 'REQUEST' : 'REQUESTS'} FOUND
            </span>
          </div>
        }
      />

      {/* Search & Combined Filter Bar */}
      <div className="bg-white border border-nbrly-border rounded-panel p-5 space-y-4 shadow-subtle">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-gray" />
          <Input
            aria-label="What does your neighborhood need?"
            placeholder="What does your neighborhood need? Search medicine, router, laptop, Bandra..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm font-sans"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-3 text-muted-gray hover:text-charcoal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold uppercase text-muted-gray shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-charcoal" /> Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-charcoal text-white shadow-subtle'
                  : 'bg-paper text-charcoal hover:bg-paper/80 border border-nbrly-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Urgency & Sorting Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-nbrly-border text-xs">
          
          {/* Urgency filters */}
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase text-muted-gray mr-1">Urgency:</span>
            {(['All', 'URGENT', 'TODAY', 'FLEXIBLE'] as const).map((urg) => (
              <button
                key={urg}
                onClick={() => setSelectedUrgency(urg)}
                className={`px-2.5 py-1 rounded-button text-xs font-semibold cursor-pointer transition-colors ${
                  selectedUrgency === urg
                    ? 'bg-lime text-charcoal border border-charcoal/20'
                    : 'text-muted-gray hover:text-charcoal'
                }`}
              >
                {urg === 'URGENT' && '⚡ '}
                {urg === 'TODAY' && '📅 '}
                {urg === 'FLEXIBLE' && '🌱 '}
                {urg}
              </button>
            ))}
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase text-muted-gray flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-paper border border-nbrly-border rounded-button px-2.5 py-1 text-xs font-semibold text-charcoal cursor-pointer focus:outline-none focus:border-charcoal"
            >
              <option value="Recommended">Recommended (Match %)</option>
              <option value="Most Urgent">Most Urgent</option>
              <option value="Newest">Newest First</option>
            </select>
          </div>

        </div>

        {/* Active Filter Clear Bar if active */}
        {hasActiveFilters && (
          <div className="pt-2 flex items-center justify-between text-xs text-muted-gray border-t border-dashed border-nbrly-border">
            <span>Showing filtered results</span>
            <button
              onClick={handleClearFilters}
              className="text-charcoal font-semibold hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear all filters
            </button>
          </div>
        )}

      </div>

      {/* Feed Request Grid */}
      {filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              onCardClick={(r) => navigate(`/request/${r.id}`)}
              onHelpClick={(r) => navigate(`/request/${r.id}`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="NOTHING HERE YET"
          description="Try changing your filters or search another term to discover nearby requests."
          actionText="Clear filters"
          onAction={handleClearFilters}
        />
      )}

    </div>
  );
};
