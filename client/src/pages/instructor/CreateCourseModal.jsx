import React, { useState } from 'react';
import { COVER_PRESETS, CourseCoverImage } from '../../components/CoverPresets';
import { X, Plus, Trash2, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Computer Science', 'Web Development', 'Design', 'Machine Learning', 'Cloud Architecture'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

export function CreateCourseModal({ isOpen, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [level, setLevel] = useState('Beginner');
  const [language, setLanguage] = useState('English');
  const [coverPreset, setCoverPreset] = useState('preset-cyber-grid');
  const [objectives, setObjectives] = useState(['']);
  const [prerequisites, setPrerequisites] = useState(['']);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddObjective = () => setObjectives([...objectives, '']);
  const handleRemoveObjective = (idx) => setObjectives(objectives.filter((_, i) => i !== idx));
  const handleObjectiveChange = (idx, val) => {
    const updated = [...objectives];
    updated[idx] = val;
    setObjectives(updated);
  };

  const handleAddPrereq = () => setPrerequisites([...prerequisites, '']);
  const handleRemovePrereq = (idx) => setPrerequisites(prerequisites.filter((_, i) => i !== idx));
  const handlePrereqChange = (idx, val) => {
    const updated = [...prerequisites];
    updated[idx] = val;
    setPrerequisites(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !shortDescription.trim()) {
      setErrorMsg('Course title and short description are required.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          shortDescription: shortDescription.trim(),
          fullDescription: fullDescription.trim() || shortDescription.trim(),
          category,
          level,
          language,
          coverPreset,
          learningObjectives: objectives.filter((o) => o.trim().length > 0),
          prerequisites: prerequisites.filter((p) => p.trim().length > 0),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create course');
      }

      onCreated(data.course);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0a0a0a] border border-white/[0.12] rounded-3xl p-6 sm:p-10 shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
          <div>
            <span className="text-[10px] tech-label text-emerald-400">INSTRUCTOR PORTAL</span>
            <h2 className="font-headline text-2xl sm:text-3xl text-white font-medium mt-1">
              Create New Masterclass Course
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 tech-label">
              COURSE TITLE *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Systems: Consensus & Fault Tolerance"
              className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-[#EBEBEB] focus:outline-none focus:border-emerald-500/50 font-sans"
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 tech-label">
              SHORT SYNOPSIS (CATALOG SUMMARY) *
            </label>
            <input
              type="text"
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="A concise, punchy description appearing on catalog cards..."
              className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-[#EBEBEB] focus:outline-none focus:border-emerald-500/50 font-sans"
            />
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 tech-label">
              FULL COURSE DESCRIPTION & SCOPE
            </label>
            <textarea
              rows={4}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Elaborate on curriculum goals, architectural focus, and background theory..."
              className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-sm text-[#EBEBEB] focus:outline-none focus:border-emerald-500/50 font-sans"
            ></textarea>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] tech-label text-zinc-400 mb-1.5">CATEGORY</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#111]">{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] tech-label text-zinc-400 mb-1.5">LEVEL</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50"
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl} className="bg-[#111]">{lvl}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] tech-label text-zinc-400 mb-1.5">LANGUAGE</label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Cover Artwork Preset Picker */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3 tech-label">
              SELECT BUNDLED COVER ARTWORK
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COVER_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => setCoverPreset(preset.id)}
                  className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all ${
                    coverPreset === preset.id
                      ? 'border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <CourseCoverImage presetId={preset.id} className="w-full h-20" />
                  <div className="p-2 bg-white/[0.02] text-center">
                    <div className="text-[11px] font-medium text-white truncate">{preset.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Objectives */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider tech-label">
                LEARNING OBJECTIVES
              </label>
              <button
                type="button"
                onClick={handleAddObjective}
                className="text-xs text-emerald-400 font-mono flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Objective</span>
              </button>
            </div>

            <div className="space-y-2">
              {objectives.map((obj, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={obj}
                    onChange={(e) => handleObjectiveChange(i, e.target.value)}
                    placeholder={`Objective ${i + 1} (e.g. Master consensus protocols)`}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50"
                  />
                  {objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveObjective(i)}
                      className="p-2 text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-6 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-white/[0.05] border border-white/10 text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              {loading ? (
                <span>Creating draft...</span>
              ) : (
                <>
                  <span>Create Course Draft</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
