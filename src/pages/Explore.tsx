import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { Input } from '../components/ui/Input';
import { RequestCard } from '../components/ui/RequestCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { HelpMap } from '../components/map/HelpMap';
import { useRequests } from '../context/RequestContext';
import { Category, Urgency } from '../types';
import { Search, Filter, SlidersHorizontal, X, MapPin, Compass, LayoutGrid, Map as MapIcon, Columns } from 'lucide-react';

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

type SortOption = 'Recommended' | 'Nearest' | 'Most Urgent' | 'Newest';
type ViewMode = 'split' | 'grid' | 'map';

function calculateDistanceKm(
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null
): number | undefined {
  if (
    lat1 === undefined || lat1 === null ||
    lon1 === undefined || lon1 === null ||
    lat2 === undefined || lat2 === null ||
    lon2 === undefined || lon2 === null
  ) {
    return undefined;
  }

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const Explore: React.FC = () => {
  const navigate = useNavigate();
  const { requests, currentUser, refreshAll } = useRequests();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedUrgency, setSelectedUrgency] = useState<Urgency | 'All'>('All');
  const [within10km, setWithin10km] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('Recommended');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Always refresh latest data from backend on mount
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const userLat = currentUser?.latitude;
  const userLng = currentUser?.longitude;
  const hasUserCoords = userLat !== undefined && userLat !== null && userLng !== undefined && userLng !== null;

  // Requests decorated with live dynamically calculated distance relative to currentUser
  const requestsWithLiveDistance = useMemo(() => {
    return requests.map((req) => {
      const reqLat = req.latitude ?? req.requester?.latitude;
      const reqLng = req.longitude ?? req.requester?.longitude;
      const dynamicDist = hasUserCoords
        ? calculateDistanceKm(userLat, userLng, reqLat, reqLng)
        : req.distanceKm;

      return {
        ...req,
        distanceKm: dynamicDist !== undefined ? dynamicDist : req.distanceKm,
      };
    });
  }, [requests, userLat, userLng, hasUserCoords]);

  // Combined Search, Category, Urgency, 10km radius, and Sorting filtering
  const filteredRequests = useMemo(() => {
    let result = requestsWithLiveDistance.filter((req) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        req.title.toLowerCase().includes(term) ||
        req.description.toLowerCase().includes(term) ||
        req.category.toLowerCase().includes(term) ||
        req.neighborhood.toLowerCase().includes(term) ||
        (req.locationName && req.locationName.toLowerCase().includes(term));

      const matchesCategory =
        selectedCategory === 'All' || req.category === selectedCategory;

      const matchesUrgency =
        selectedUrgency === 'All' || req.urgency === selectedUrgency;

      // 10 km filtering requires user coordinates and distance <= 10 km
      const matchesDistance = !within10km
        ? true
        : hasUserCoords && req.distanceKm !== undefined && req.distanceKm <= 10;

      return matchesSearch && matchesCategory && matchesUrgency && matchesDistance;
    });

    // Sort requests
    if (sortBy === 'Nearest') {
      result.sort((a, b) => {
        if (a.distanceKm === undefined) return 1;
        if (b.distanceKm === undefined) return -1;
        return a.distanceKm - b.distanceKm;
      });
    } else if (sortBy === 'Recommended') {
      result.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (sortBy === 'Most Urgent') {
      const urgencyRank: Record<Urgency, number> = { URGENT: 3, TODAY: 2, FLEXIBLE: 1 };
      result.sort((a, b) => urgencyRank[b.urgency] - urgencyRank[a.urgency]);
    } else if (sortBy === 'Newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [requestsWithLiveDistance, searchTerm, selectedCategory, selectedUrgency, within10km, sortBy, hasUserCoords]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedUrgency('All');
    setWithin10km(false);
    setSortBy('Recommended');
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'All' ||
    selectedUrgency !== 'All' ||
    within10km;

  return (
    <div className="space-y-6">
      
      {/* Page Header with Result Count & View Toggle */}
      <PageHeader
        kicker="NEIGHBORHOOD DISCOVERY"
        title="FIND HELP NEARBY"
        description="Small requests. Nearby people. Real help."
        action={
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal bg-lime px-3 py-1.5 rounded-full border border-charcoal/10">
              {filteredRequests.length} {filteredRequests.length === 1 ? 'REQUEST' : 'REQUESTS'} FOUND
            </span>

            {/* Desktop & Mobile View Mode Switcher */}
            <div className="flex items-center bg-white border border-nbrly-border rounded-button p-0.5 shadow-subtle">
              <button
                onClick={() => setViewMode('split')}
                title="Split List & Map"
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-button transition-colors ${
                  viewMode === 'split' ? 'bg-charcoal text-white' : 'text-muted-gray hover:text-charcoal'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Split</span>
              </button>

              <button
                onClick={() => setViewMode('grid')}
                title="List View"
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-button transition-colors ${
                  viewMode === 'grid' ? 'bg-charcoal text-white' : 'text-muted-gray hover:text-charcoal'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>List</span>
              </button>

              <button
                onClick={() => setViewMode('map')}
                title="Map View"
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-button transition-colors ${
                  viewMode === 'map' ? 'bg-charcoal text-white' : 'text-muted-gray hover:text-charcoal'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map</span>
              </button>
            </div>
          </div>
        }
      />

      {/* Missing Location Banner if 10km filter is toggled but user has no location set */}
      {within10km && !currentUser?.latitude && (
        <div className="bg-lime/25 border border-lime/80 rounded-panel p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-subtle">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-charcoal shrink-0" />
            <div>
              <p className="text-xs font-bold font-heading text-charcoal uppercase">Add your location to discover help nearby</p>
              <p className="text-[11px] text-muted-gray font-sans">Set your neighborhood in your profile to enable exact distance calculations.</p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate('/profile')}>
            SET LOCATION
          </Button>
        </div>
      )}

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
              className="absolute right-3.5 top-3 text-muted-gray hover:text-charcoal cursor-pointer"
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

        {/* Urgency, 10km Nearby, & Sorting Controls Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-nbrly-border text-xs">
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Urgency filters */}
            <div className="flex items-center gap-1.5">
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

            {/* Within 10 km Nearby Filter Toggle */}
            <div className="flex items-center gap-2 pl-2 border-l border-nbrly-border">
              <button
                onClick={() => setWithin10km(!within10km)}
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  within10km
                    ? 'bg-charcoal text-lime shadow-subtle border border-charcoal'
                    : 'bg-paper text-charcoal hover:bg-paper/80 border border-nbrly-border'
                }`}
              >
                <Compass className={`w-3.5 h-3.5 ${within10km ? 'text-lime animate-spin' : 'text-muted-gray'}`} />
                Within 10 km
              </button>
            </div>
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
              {hasUserCoords && <option value="Nearest">Nearest (Distance)</option>}
              <option value="Most Urgent">Most Urgent</option>
              <option value="Newest">Newest First</option>
            </select>
          </div>

        </div>

        {/* Active Filter Clear Bar if active */}
        {hasActiveFilters && (
          <div className="pt-2 flex items-center justify-between text-xs text-muted-gray border-t border-dashed border-nbrly-border">
            <span>
              Showing filtered results
              {within10km && <strong className="text-charcoal ml-1">· within 10 km of your location</strong>}
            </span>
            <button
              onClick={handleClearFilters}
              className="text-charcoal font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Clear all filters
            </button>
          </div>
        )}

      </div>

      {/* Main Content Area based on View Mode */}
      {filteredRequests.length > 0 ? (
        <>
          {/* 1. DESKTOP SPLIT VIEW (Requests on left, Sticky Map on right) */}
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Request Cards */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRequests.map((req) => (
                    <div
                      key={req.id}
                      onMouseEnter={() => setSelectedRequestId(req.id)}
                      className={`transition-all duration-200 rounded-panel ${
                        selectedRequestId === req.id ? 'ring-2 ring-charcoal shadow-lifted' : ''
                      }`}
                    >
                      <RequestCard
                        request={req}
                        onCardClick={(r) => {
                          setSelectedRequestId(r.id);
                          navigate(`/request/${r.id}`);
                        }}
                        onHelpClick={(r) => navigate(`/request/${r.id}`)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Sticky HelpMap */}
              <div className="hidden lg:block lg:col-span-5 sticky top-20 h-[calc(100vh-140px)] min-h-[520px]">
                <HelpMap
                  requests={filteredRequests}
                  currentUser={currentUser}
                  selectedRequestId={selectedRequestId}
                  onSelectRequest={(id) => setSelectedRequestId(id)}
                />
              </div>

              {/* Mobile fallback when split is chosen on mobile -> shows cards */}
              <div className="block lg:hidden pt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => setViewMode('map')}
                >
                  <MapIcon className="w-4 h-4" /> SWITCH TO FULL MAP
                </Button>
              </div>

            </div>
          )}

          {/* 2. GRID ONLY VIEW (Full width card grid) */}
          {viewMode === 'grid' && (
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
          )}

          {/* 3. MAP ONLY VIEW (Expanded interactive map) */}
          {viewMode === 'map' && (
            <div className="h-[calc(100vh-220px)] min-h-[520px] w-full">
              <HelpMap
                requests={filteredRequests}
                currentUser={currentUser}
                selectedRequestId={selectedRequestId}
                onSelectRequest={(id) => setSelectedRequestId(id)}
              />
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="QUIET AROUND HERE"
          description="No requests match your current filters. Try expanding your search or clearing active filters."
          actionText="Clear filters"
          onAction={handleClearFilters}
        />
      )}

    </div>
  );
};
