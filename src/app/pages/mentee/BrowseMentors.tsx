import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Link, useNavigate } from "react-router";
import { Search, Star, Filter, Users } from "lucide-react";
import { toast } from "sonner";
import { SkeletonCard } from "../../components/ui/SkeletonCard";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  fetchRecommendedMentors,
  fetchMentors,
  type MentorListItem,
} from "../../../lib/api";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop";

type SortOption = "recommended" | "rating";

export default function BrowseMentors() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<MentorListItem[]>([]);
  const [isRecommendedOrder, setIsRecommendedOrder] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecommendedMentors()
      .then((list) => {
        setMentors(list);
        setIsRecommendedOrder(true);
      })
      .catch(() => {
        fetchMentors()
          .then((list) => {
            setMentors(list);
            setIsRecommendedOrder(false);
          })
          .catch(() => {
            toast.error("Failed to load mentors");
            setMentors([]);
          });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const expertiseOptions = useMemo(() => {
    const set = new Set<string>();
    mentors.forEach((m) => (m.skills ?? []).forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [mentors]);

  const handleExpertiseChange = (expertise: string, checked: boolean) => {
    setSelectedExpertise((prev) =>
      checked ? [...prev, expertise] : prev.filter((e) => e !== expertise)
    );
  };

  const handleRatingChange = (rating: number, checked: boolean) => {
    setSelectedRating(checked ? rating : null);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedExpertise([]);
    setSelectedRating(null);
    setSortBy("recommended");
    toast.success("All filters cleared!");
  };

  const filteredAndSortedMentors = useMemo(() => {
    let filtered = [...mentors];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (mentor) =>
          (mentor.name ?? "").toLowerCase().includes(query) ||
          (mentor.skills ?? []).some((s) => s.toLowerCase().includes(query))
      );
    }

    if (selectedExpertise.length > 0) {
      filtered = filtered.filter((mentor) =>
        selectedExpertise.some((exp) => (mentor.skills ?? []).includes(exp))
      );
    }

    if (selectedRating !== null) {
      filtered = filtered.filter(
        (mentor) => (mentor.averageRating ?? 0) >= selectedRating
      );
    }

    if (sortBy === "rating") {
      filtered = [...filtered].sort((a, b) => {
        const ra = a.averageRating ?? 0;
        const rb = b.averageRating ?? 0;
        if (rb !== ra) return rb - ra;
        return (b.ratingCount ?? 0) - (a.ratingCount ?? 0);
      });
    }
    return filtered;
  }, [mentors, searchQuery, selectedExpertise, selectedRating, sortBy]);

  return (
    <DashboardLayout role="mentee">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Browse Mentors
        </h1>
        <p className="text-gray-600">
          Find the perfect mentor to guide your journey
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Filter Sidebar */}
        <aside className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
          <Card className="p-6 border-0 shadow-lg sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">Filters</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-indigo-600"
                onClick={handleClearFilters}
              >
                Clear All
              </Button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <Label className="mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search by name or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Expertise */}
            <div className="mb-6">
              <Label className="mb-3 block">Expertise</Label>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {expertiseOptions.length === 0 ? (
                  <p className="text-sm text-gray-500">No skills loaded yet.</p>
                ) : (
                  expertiseOptions.map((skill) => (
                    <div key={skill} className="flex items-center gap-2">
                      <Checkbox
                        id={skill}
                        checked={selectedExpertise.includes(skill)}
                        onCheckedChange={(checked) =>
                          handleExpertiseChange(skill, checked === true)
                        }
                      />
                      <Label htmlFor={skill} className="font-normal cursor-pointer text-sm">
                        {skill}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Rating */}
            <div>
              <Label className="mb-3 block">Minimum Rating</Label>
              <div className="space-y-3">
                {[5, 4.5, 4, 3].map((rating) => (
                  <div key={rating} className="flex items-center gap-2">
                    <Checkbox
                      id={`rating-${rating}`}
                      checked={selectedRating === rating}
                      onCheckedChange={(checked) =>
                        handleRatingChange(rating, checked === true)
                      }
                    />
                    <Label htmlFor={`rating-${rating}`} className="font-normal cursor-pointer flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      {rating}+ Stars
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </aside>

        {/* Mentors Grid */}
        <div className="lg:col-span-3">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="w-full"
            >
              <Filter size={18} className="mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Sort and Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredAndSortedMentors.length}</span> mentor{filteredAndSortedMentors.length !== 1 ? 's' : ''}
            </p>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended for you</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mentors Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredAndSortedMentors.length === 0 ? (
            <EmptyState
              icon={<Users size={48} />}
              title="No mentors match your filters"
              subtitle="Try adjusting your search or filter criteria to find more mentors."
              actionLabel="Clear All Filters"
              onAction={handleClearFilters}
            />
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredAndSortedMentors.map((mentor) => (
                <Card key={mentor.id} className="p-6 border-0 shadow-lg hover:shadow-xl transition-all group">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar 
                      className="h-16 w-16 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => navigate(`/mentors/${mentor.id}`)}
                    >
                      <AvatarImage src={mentor.avatarUrl ?? DEFAULT_AVATAR} />
                      <AvatarFallback>{(mentor.name ?? "M")[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <Link
                          to={`/mentors/${mentor.id}`}
                          className="font-bold text-gray-900 hover:text-indigo-600 transition-colors"
                        >
                          {mentor.name ?? "Mentor"}
                        </Link>
                        {isRecommendedOrder && sortBy === "recommended" && (mentor.matchScore ?? 0) > 0 && (
                          <Badge className="bg-indigo-100 text-indigo-700 border-0 text-xs">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Star size={14} className="fill-yellow-400 text-yellow-400" />
                          {mentor.averageRating != null
                            ? mentor.averageRating.toFixed(1)
                            : "—"}{" "}
                          ({mentor.ratingCount ?? 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {mentor.bio ?? "No bio yet."}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {(mentor.skills ?? []).slice(0, 3).map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {(mentor.skills ?? []).length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{(mentor.skills ?? []).length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Link to={`/mentors/${mentor.id}`}>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
