import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SpotlightCard } from '../components/SpotlightCard';
import { CourseCoverImage } from '../components/CoverPresets';
import { Search, Filter, BookOpen, Layers, Users, ArrowRight, Sparkles } from 'lucide-react';

const CATEGORIES = ['All', 'Computer Science', 'Web Development', 'Design', 'Machine Learning', 'Cloud Architecture'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export function CatalogPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const fetchCourses = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (selectedCategory !== 'All') params.append('category', selectedCategory);
    if (selectedLevel !== 'All') params.append('level', selectedLevel);

    fetch(`/api/courses?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses || []);
      })
      .catch((err) => console.error('Failed to load catalog:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedLevel]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <div className="min-h-screen pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 tech-label mb-3">
            TECHNICAL CURRICULA // ARCHITECTURE & SYSTEMS
          </div>
          <h1 className="font-headline text-4xl sm:text-6xl text-[#EBEBEB] font-normal tracking-tight mb-4">
            Course Catalog
          </h1>
          <p className="text-zinc-400 font-sans text-base leading-relaxed">
            Discover rigorous engineering curricula built by experienced practitioners. Select a masterclass to inspect its syllabus outline or register immediately.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="mb-12 p-4 rounded-3xl glass-panel border border-white/[0.08] flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/[0.03] border border-white/10 text-sm text-[#EBEBEB] placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-sans"
            />
          </form>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 tech-label hidden sm:inline">CATEGORY:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3.5 py-2 rounded-full bg-white/[0.03] border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#111] text-zinc-200">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 tech-label hidden sm:inline">LEVEL:</span>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3.5 py-2 rounded-full bg-white/[0.03] border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl} className="bg-[#111] text-zinc-200">
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchCourses}
              className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
            >
              Apply Filter
            </button>
          </div>
        </div>

        {/* Course Cards Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-zinc-500 font-mono text-sm">Querying ClassCast catalog...</div>
          </div>
        ) : courses.length === 0 ? (
          <div className="py-24 text-center rounded-3xl glass-panel border border-white/[0.08] max-w-xl mx-auto p-12">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center text-zinc-500 mx-auto mb-6">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="font-headline text-2xl text-[#EBEBEB] mb-2 font-normal">
              No matching courses found
            </h3>
            <p className="text-zinc-400 text-sm max-w-sm mx-auto mb-6 font-sans">
              No courses matched your current filter or search criteria. Try selecting another category or clear the search query.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedLevel('All');
              }}
              className="px-6 py-2.5 rounded-full bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400 transition-colors"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <SpotlightCard
                key={course._id}
                className="flex flex-col justify-between overflow-hidden group hover:border-emerald-500/40"
              >
                <div>
                  {/* Preset Cover Artwork */}
                  <div className="relative overflow-hidden rounded-t-3xl border-b border-white/[0.06]">
                    <CourseCoverImage presetId={course.coverPreset} title={course.title} className="w-full h-48" />
                    <div className="absolute top-4 left-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] tech-label bg-black/80 backdrop-blur-md border border-white/10 text-emerald-400">
                        {course.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-black/80 backdrop-blur-md border border-white/10 text-zinc-300">
                        {course.level}
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-6">
                    <Link to={`/courses/${course._id}`}>
                      <h3 className="font-headline text-xl text-[#EBEBEB] font-medium mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                    </Link>
                    <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3 mb-6 font-sans">
                      {course.shortDescription}
                    </p>

                    <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06] text-xs text-zinc-400">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                        {course.instructor?.name?.charAt(0) || 'I'}
                      </div>
                      <span className="truncate">{course.instructor?.name || 'Instructor'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Metrics & CTA */}
                <div className="px-6 pb-6 pt-2 flex items-center justify-between text-xs font-mono text-zinc-400 border-t border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{course.lessonCount || 0} lessons</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{course.studentCount || 0} enrolled</span>
                    </span>
                  </div>

                  <Link
                    to={`/courses/${course._id}`}
                    className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold link-hover-emerald"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
