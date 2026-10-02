import React, { useEffect, useState, useMemo } from 'react';
import { 
  FolderTree, 
  Plus, 
  Edit3, 
  Archive, 
  Check, 
  X, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2,
  ChevronRight,
  Code,
  Tag,
  FolderPlus,
  Search,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Layers,
  RotateCcw,
  Briefcase,
  HelpCircle,
  Hash,
  Eye,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle,
  FileCode,
  ExternalLink
} from 'lucide-react';
import { adminApi } from '../../api';

interface AdminTaxonomyProps {
  initialFocus?: 'categories' | 'roles' | 'skills';
}

export const AdminTaxonomy: React.FC<AdminTaxonomyProps> = ({ initialFocus = 'categories' }) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'roles' | 'skills'>(initialFocus);

  useEffect(() => {
    setActiveTab(initialFocus);
  }, [initialFocus]);

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Category View Filters & Display State ---
  const [categoryViewMode, setCategoryViewMode] = useState<'grid' | 'table'>('grid');
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryStatusFilter, setCategoryStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [categorySortBy, setCategorySortBy] = useState<'name-asc' | 'name-desc' | 'roles-desc' | 'skills-desc'>('name-asc');
  const [inspectingCategory, setInspectingCategory] = useState<any | null>(null);

  // --- Global Roles View Filters State ---
  const [globalRoleSearch, setGlobalRoleSearch] = useState('');
  const [globalRoleCategoryFilter, setGlobalRoleCategoryFilter] = useState('all');
  const [globalRoleStatusFilter, setGlobalRoleStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [globalRoleSortBy, setGlobalRoleSortBy] = useState<'name-asc' | 'name-desc' | 'category-asc'>('name-asc');

  // --- Global Skills View Filters State ---
  const [globalSkillSearch, setGlobalSkillSearch] = useState('');
  const [globalSkillCategoryFilter, setGlobalSkillCategoryFilter] = useState('all');
  const [globalSkillStatusFilter, setGlobalSkillStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [globalSkillSortBy, setGlobalSkillSortBy] = useState<'name-asc' | 'name-desc' | 'category-asc'>('name-asc');

  // --- Modals / Forms ---
  const [categoryModal, setCategoryModal] = useState<{ isEdit: boolean; data: any } | null>(null);
  const [roleModal, setRoleModal] = useState<{ isEdit: boolean; categoryId: string; data?: any } | null>(null);
  const [skillModal, setSkillModal] = useState<{ isEdit: boolean; categoryId: string; data?: any } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadTaxonomy = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getCategories(true);
      setCategories(data || []);
      if (inspectingCategory) {
        const updated = (data || []).find((c: any) => c.id === inspectingCategory.id);
        if (updated) setInspectingCategory(updated);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaxonomy();
  }, []);

  // Flattened All Roles list with category context
  const allFlattenedRoles = useMemo(() => {
    const list: any[] = [];
    categories.forEach((cat) => {
      if (cat.roles && Array.isArray(cat.roles)) {
        cat.roles.forEach((r: any) => {
          list.push({
            ...r,
            categoryId: cat.id,
            categoryName: cat.name,
            categorySlug: cat.slug,
            categoryArchived: cat.isArchived
          });
        });
      }
    });
    return list;
  }, [categories]);

  // Flattened All Skills list with category context
  const allFlattenedSkills = useMemo(() => {
    const list: any[] = [];
    categories.forEach((cat) => {
      if (cat.skills && Array.isArray(cat.skills)) {
        cat.skills.forEach((s: any) => {
          list.push({
            ...s,
            categoryId: cat.id,
            categoryName: cat.name,
            categorySlug: cat.slug,
            categoryArchived: cat.isArchived
          });
        });
      }
    });
    return list;
  }, [categories]);

  // --- Filtered Categories (for Categories View) ---
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        if (categoryStatusFilter === 'active' && cat.isArchived) return false;
        if (categoryStatusFilter === 'archived' && !cat.isArchived) return false;

        if (categorySearch.trim()) {
          const q = categorySearch.toLowerCase().trim();
          const matchName = cat.name?.toLowerCase().includes(q);
          const matchSlug = cat.slug?.toLowerCase().includes(q);
          const matchDesc = cat.description?.toLowerCase().includes(q);
          if (!matchName && !matchSlug && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (categorySortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
        if (categorySortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
        if (categorySortBy === 'roles-desc') {
          const aRoles = a.rolesCount || a.roles?.length || 0;
          const bRoles = b.rolesCount || b.roles?.length || 0;
          return bRoles - aRoles;
        }
        if (categorySortBy === 'skills-desc') {
          const aSkills = a.skillsCount || a.skills?.length || 0;
          const bSkills = b.skillsCount || b.skills?.length || 0;
          return bSkills - aSkills;
        }
        return 0;
      });
  }, [categories, categorySearch, categoryStatusFilter, categorySortBy]);

  // --- Filtered Global Roles (for Roles View) ---
  const filteredGlobalRoles = useMemo(() => {
    return allFlattenedRoles
      .filter((r) => {
        if (globalRoleStatusFilter === 'active' && r.isArchived) return false;
        if (globalRoleStatusFilter === 'archived' && !r.isArchived) return false;

        if (globalRoleCategoryFilter !== 'all' && r.categoryId !== globalRoleCategoryFilter) return false;

        if (globalRoleSearch.trim()) {
          const q = globalRoleSearch.toLowerCase().trim();
          const matchName = r.name?.toLowerCase().includes(q);
          const matchSlug = r.slug?.toLowerCase().includes(q);
          const matchDesc = r.description?.toLowerCase().includes(q);
          const matchCat = r.categoryName?.toLowerCase().includes(q);
          if (!matchName && !matchSlug && !matchDesc && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (globalRoleSortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
        if (globalRoleSortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
        if (globalRoleSortBy === 'category-asc') return (a.categoryName || '').localeCompare(b.categoryName || '');
        return 0;
      });
  }, [allFlattenedRoles, globalRoleSearch, globalRoleCategoryFilter, globalRoleStatusFilter, globalRoleSortBy]);

  // --- Filtered Global Skills (for Skills View) ---
  const filteredGlobalSkills = useMemo(() => {
    return allFlattenedSkills
      .filter((s) => {
        if (globalSkillStatusFilter === 'active' && s.isArchived) return false;
        if (globalSkillStatusFilter === 'archived' && !s.isArchived) return false;

        if (globalSkillCategoryFilter !== 'all' && s.categoryId !== globalSkillCategoryFilter) return false;

        if (globalSkillSearch.trim()) {
          const q = globalSkillSearch.toLowerCase().trim();
          const matchName = s.name?.toLowerCase().includes(q);
          const matchSlug = s.slug?.toLowerCase().includes(q);
          const matchCat = s.categoryName?.toLowerCase().includes(q);
          if (!matchName && !matchSlug && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (globalSkillSortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
        if (globalSkillSortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
        if (globalSkillSortBy === 'category-asc') return (a.categoryName || '').localeCompare(b.categoryName || '');
        return 0;
      });
  }, [allFlattenedSkills, globalSkillSearch, globalSkillCategoryFilter, globalSkillStatusFilter, globalSkillSortBy]);

  // Actions
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryModal) return;
    try {
      await adminApi.saveCategory(categoryModal.data);
      setToastMessage(`Category "${categoryModal.data.name}" saved successfully.`);
      setTimeout(() => setToastMessage(null), 4000);
      setCategoryModal(null);
      loadTaxonomy();
    } catch (err: any) {
      alert(err.message || 'Failed to save category');
    }
  };

  const handleToggleArchiveCategory = async (id: string) => {
    try {
      await adminApi.toggleArchiveCategory(id);
      loadTaxonomy();
    } catch (err: any) {
      alert(err.message || 'Failed to archive category');
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleModal) return;
    try {
      await adminApi.saveRole(roleModal.data);
      setToastMessage(`Role "${roleModal.data.name}" saved successfully.`);
      setTimeout(() => setToastMessage(null), 4000);
      setRoleModal(null);
      loadTaxonomy();
    } catch (err: any) {
      alert(err.message || 'Failed to save role');
    }
  };

  const handleToggleArchiveRole = async (id: string) => {
    try {
      await adminApi.toggleArchiveRole(id);
      loadTaxonomy();
    } catch (err: any) {
      alert(err.message || 'Failed to archive role');
    }
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillModal) return;
    try {
      await adminApi.saveSkill(skillModal.data);
      setToastMessage(`Skill "${skillModal.data.name}" saved.`);
      setTimeout(() => setToastMessage(null), 4000);
      setSkillModal(null);
      loadTaxonomy();
    } catch (err: any) {
      alert(err.message || 'Failed to save skill');
    }
  };

  const handleToggleArchiveSkill = async (id: string) => {
    try {
      await adminApi.toggleArchiveSkill(id);
      loadTaxonomy();
    } catch (err: any) {
      alert(err.message || 'Failed to archive skill');
    }
  };

  const activeCategoriesCount = useMemo(() => categories.filter((c) => !c.isArchived).length, [categories]);
  const isCategoryFilterActive = categorySearch !== '' || categoryStatusFilter !== 'all' || categorySortBy !== 'name-asc';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-700 text-emerald-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Tab Navigation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
              {activeTab === 'categories' && (
                <>
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <FolderTree className="w-5 h-5" />
                  </div>
                  <span>Marketplace Categories Directory</span>
                </>
              )}
              {activeTab === 'roles' && (
                <>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Tag className="w-5 h-5" />
                  </div>
                  <span>Standardized Job Roles Registry</span>
                </>
              )}
              {activeTab === 'skills' && (
                <>
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Code className="w-5 h-5" />
                  </div>
                  <span>Validated Skills & Capabilities Matrix</span>
                </>
              )}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'categories' && 'Configure marketplace classification branches, dynamic requirements schemas, and taxonomy structures.'}
              {activeTab === 'roles' && 'Manage all specialized profession titles, job classifications, and category assignments across the platform.'}
              {activeTab === 'skills' && 'Standardize filterable capability tags, technical skills, and creative competencies.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'categories' && (
              <button
                onClick={() => setCategoryModal({ isEdit: false, data: { name: '', slug: '', description: '', icon: 'Folder', dynamicSchemaJson: '[]' } })}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition shrink-0"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            )}
            {activeTab === 'roles' && (
              <button
                onClick={() => setRoleModal({ isEdit: false, categoryId: categories[0]?.id || '', data: { categoryId: categories[0]?.id || '', name: '', slug: '', description: '' } })}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Job Role</span>
              </button>
            )}
            {activeTab === 'skills' && (
              <button
                onClick={() => setSkillModal({ isEdit: false, categoryId: categories[0]?.id || '', data: { categoryId: categories[0]?.id || '', name: '', slug: '' } })}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Skill Tag</span>
              </button>
            )}
          </div>
        </div>

        {/* Top Tab Switcher */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                : 'bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'roles'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                : 'bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Roles ({allFlattenedRoles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'skills'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                : 'bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Skills ({allFlattenedSkills.length})</span>
          </button>
        </div>
      </div>

      {loading && categories.length === 0 ? (
        <div className="p-16 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
          <RefreshCw className="w-6 h-6 animate-spin text-rose-500 mx-auto mb-2" />
          <p className="text-xs">Loading marketplace taxonomy data...</p>
        </div>
      ) : (
        <>
          {/* ============================================================== */}
          {/* SCREEN 1: CATEGORIES WORKSPACE (NEAT, CRISP & SPACIOUS)        */}
          {/* ============================================================== */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Summary Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Categories</span>
                  <p className="text-2xl font-bold text-white mt-1">{categories.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Active Branches</span>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{activeCategoriesCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Standardized Roles</span>
                  <p className="text-2xl font-bold text-amber-400 mt-1">{allFlattenedRoles.length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Validated Skill Tags</span>
                  <p className="text-2xl font-bold text-indigo-400 mt-1">{allFlattenedSkills.length}</p>
                </div>
              </div>

              {/* Filtering & Layout Toolbar */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Left: Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      placeholder="Search categories by name, slug, or description..."
                      className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition"
                    />
                    {categorySearch && (
                      <button onClick={() => setCategorySearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Right: Status Pills, Sort, View Toggle, Reset */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Status filter pills */}
                    <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                      <button
                        onClick={() => setCategoryStatusFilter('all')}
                        className={`px-3 py-1 rounded-lg font-semibold transition ${
                          categoryStatusFilter === 'all' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        All ({categories.length})
                      </button>
                      <button
                        onClick={() => setCategoryStatusFilter('active')}
                        className={`px-3 py-1 rounded-lg font-semibold transition ${
                          categoryStatusFilter === 'active' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Active ({activeCategoriesCount})
                      </button>
                      <button
                        onClick={() => setCategoryStatusFilter('archived')}
                        className={`px-3 py-1 rounded-lg font-semibold transition ${
                          categoryStatusFilter === 'archived' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Archived ({categories.length - activeCategoriesCount})
                      </button>
                    </div>

                    {/* Sort Dropdown */}
                    <select
                      value={categorySortBy}
                      onChange={(e) => setCategorySortBy(e.target.value as any)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                    >
                      <option value="name-asc">Sort: Name (A → Z)</option>
                      <option value="name-desc">Sort: Name (Z → A)</option>
                      <option value="roles-desc">Sort: Most Roles</option>
                      <option value="skills-desc">Sort: Most Skills</option>
                    </select>

                    {/* View Mode Toggle */}
                    <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl">
                      <button
                        onClick={() => setCategoryViewMode('grid')}
                        className={`p-1.5 rounded-lg transition ${categoryViewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        title="Grid View"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setCategoryViewMode('table')}
                        className={`p-1.5 rounded-lg transition ${categoryViewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        title="Table View"
                      >
                        <TableIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {isCategoryFilterActive && (
                      <button
                        onClick={() => {
                          setCategorySearch('');
                          setCategoryStatusFilter('all');
                          setCategorySortBy('name-asc');
                        }}
                        className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Categories Cards Grid View */}
              {filteredCategories.length === 0 ? (
                <div className="p-16 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 space-y-3">
                  <FolderTree className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">No categories found matching your filters</p>
                  <p className="text-xs text-slate-500">Try adjusting your search keywords or resetting filters.</p>
                </div>
              ) : categoryViewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredCategories.map((cat) => {
                    const rolesCount = cat.rolesCount || cat.roles?.length || 0;
                    const skillsCount = cat.skillsCount || cat.skills?.length || 0;
                    let schemaFieldsCount = 0;
                    try {
                      const schema = JSON.parse(cat.dynamicSchemaJson || '[]');
                      if (Array.isArray(schema)) schemaFieldsCount = schema.length;
                    } catch {}

                    return (
                      <div
                        key={cat.id}
                        className={`p-5 rounded-2xl border transition shadow-lg flex flex-col justify-between group ${
                          cat.isArchived
                            ? 'bg-slate-900/60 border-slate-800/80 opacity-70'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:shadow-xl'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                                <FolderTree className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-bold text-white text-sm truncate">{cat.name}</h3>
                                <p className="text-[11px] font-mono text-slate-400 truncate">/{cat.slug}</p>
                              </div>
                            </div>

                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${
                              cat.isArchived ? 'bg-rose-950/50 border border-rose-800/60 text-rose-300' : 'bg-emerald-950/50 border border-emerald-800/60 text-emerald-300'
                            }`}>
                              {cat.isArchived ? 'Archived' : 'Active'}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {cat.description || 'No description configured for this marketplace category.'}
                          </p>

                          {/* Metric Tags */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button
                              onClick={() => {
                                setGlobalRoleCategoryFilter(cat.id);
                                setActiveTab('roles');
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-amber-300 text-[11px] font-medium transition"
                              title="View roles under this category"
                            >
                              <Tag className="w-3 h-3 text-amber-400" />
                              <span>{rolesCount} Roles</span>
                            </button>

                            <button
                              onClick={() => {
                                setGlobalSkillCategoryFilter(cat.id);
                                setActiveTab('skills');
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-indigo-300 text-[11px] font-medium transition"
                              title="View skills under this category"
                            >
                              <Code className="w-3 h-3 text-indigo-400" />
                              <span>{skillsCount} Skills</span>
                            </button>

                            {schemaFieldsCount > 0 && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-[11px]">
                                <FileCode className="w-3 h-3 text-cyan-400" />
                                <span>{schemaFieldsCount} Custom Fields</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Actions Footer */}
                        <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setInspectingCategory(cat)}
                            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect Branch</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setCategoryModal({ isEdit: true, data: { ...cat } })}
                              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                              title="Edit Category"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleArchiveCategory(cat.id)}
                              className={`p-1.5 rounded-lg transition ${
                                cat.isArchived ? 'text-emerald-400 hover:bg-emerald-950/40' : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                              }`}
                              title={cat.isArchived ? 'Unarchive Category' : 'Archive Category'}
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Table View */
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          <th className="py-3.5 px-4">Category Name & Slug</th>
                          <th className="py-3.5 px-4">Description</th>
                          <th className="py-3.5 px-4">Sub-Taxonomy</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                        {filteredCategories.map((cat) => (
                          <tr key={cat.id} className="hover:bg-slate-850/50 transition">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                                  <FolderTree className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="font-bold text-white text-xs">{cat.name}</p>
                                  <p className="text-[11px] font-mono text-slate-500">/{cat.slug}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 max-w-sm">
                              <p className="text-slate-400 line-clamp-1">{cat.description || '—'}</p>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                                  <Tag className="w-3 h-3 text-amber-400" />
                                  {cat.rolesCount || cat.roles?.length || 0} Roles
                                </span>
                                <span className="inline-flex items-center gap-1 text-indigo-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                                  <Code className="w-3 h-3 text-indigo-400" />
                                  {cat.skillsCount || cat.skills?.length || 0} Skills
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                cat.isArchived ? 'bg-rose-950/50 border border-rose-800/60 text-rose-300' : 'bg-emerald-950/50 border border-emerald-800/60 text-emerald-300'
                              }`}>
                                {cat.isArchived ? 'Archived' : 'Active'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setInspectingCategory(cat)}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                                >
                                  <Eye className="w-3.5 h-3.5 text-rose-400" />
                                  <span>Inspect</span>
                                </button>
                                <button
                                  onClick={() => setCategoryModal({ isEdit: true, data: { ...cat } })}
                                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                                  title="Edit Category"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleToggleArchiveCategory(cat.id)}
                                  className={`p-1.5 rounded-lg transition ${
                                    cat.isArchived ? 'text-emerald-400 hover:bg-emerald-950/40' : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                                  }`}
                                  title={cat.isArchived ? 'Unarchive Category' : 'Archive Category'}
                                >
                                  <Archive className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* SCREEN 2: STANDARDIZED ROLES DIRECTORY (ACROSS ALL CATEGORIES) */}
          {/* ============================================================== */}
          {activeTab === 'roles' && (
            <div className="space-y-4">
              {/* Filter Card for Roles */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Tag className="w-4 h-4 text-amber-400" />
                      Job Roles Registry ({filteredGlobalRoles.length} of {allFlattenedRoles.length})
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Standardized specialist positions available across all marketplace categories
                    </p>
                  </div>

                  {(globalRoleSearch || globalRoleCategoryFilter !== 'all' || globalRoleStatusFilter !== 'all' || globalRoleSortBy !== 'name-asc') && (
                    <button
                      onClick={() => {
                        setGlobalRoleSearch('');
                        setGlobalRoleCategoryFilter('all');
                        setGlobalRoleStatusFilter('all');
                        setGlobalRoleSortBy('name-asc');
                      }}
                      className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1.5 self-start md:self-auto transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Role Filters
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={globalRoleSearch}
                      onChange={(e) => setGlobalRoleSearch(e.target.value)}
                      placeholder="Search roles or slugs..."
                      className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition"
                    />
                    {globalRoleSearch && (
                      <button onClick={() => setGlobalRoleSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Category Filter */}
                  <div>
                    <select
                      value={globalRoleCategoryFilter}
                      onChange={(e) => setGlobalRoleCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="all">All Categories ({categories.length})</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <select
                      value={globalRoleStatusFilter}
                      onChange={(e) => setGlobalRoleStatusFilter(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="all">All Statuses ({allFlattenedRoles.length})</option>
                      <option value="active">Active Roles ({allFlattenedRoles.filter(r => !r.isArchived).length})</option>
                      <option value="archived">Archived Roles ({allFlattenedRoles.filter(r => r.isArchived).length})</option>
                    </select>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <select
                      value={globalRoleSortBy}
                      onChange={(e) => setGlobalRoleSortBy(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="name-asc">Sort: Role Name (A → Z)</option>
                      <option value="name-desc">Sort: Role Name (Z → A)</option>
                      <option value="category-asc">Sort: By Category</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Roles Cards Grid */}
              {filteredGlobalRoles.length === 0 ? (
                <div className="p-16 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 space-y-3">
                  <Tag className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">No Job Roles Match Your Filters</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try loosening your search query or selecting "All Categories".
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredGlobalRoles.map((r) => (
                    <div
                      key={r.id}
                      className={`p-5 rounded-2xl border transition shadow-lg flex flex-col justify-between ${
                        r.isArchived 
                          ? 'bg-slate-900/60 border-slate-800/80 opacity-70' 
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-bold text-white text-sm truncate">{r.name}</h3>
                            <p className="text-[11px] font-mono text-slate-500 truncate">/{r.slug}</p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setRoleModal({ isEdit: true, categoryId: r.categoryId, data: { ...r } })}
                              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                              title="Edit Role"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleArchiveRole(r.id)}
                              className={`p-1.5 rounded-lg transition ${
                                r.isArchived 
                                  ? 'text-emerald-400 hover:bg-emerald-950/40' 
                                  : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                              }`}
                              title={r.isArchived ? 'Unarchive Role' : 'Archive Role'}
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Category Badge */}
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-semibold">
                          <FolderTree className="w-3 h-3" />
                          <span>{r.categoryName}</span>
                        </div>

                        {r.description ? (
                          <p className="text-xs text-slate-400 line-clamp-2 pt-1">{r.description}</p>
                        ) : (
                          <p className="text-xs text-slate-600 italic pt-1">No description configured.</p>
                        )}
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Status: <strong className={r.isArchived ? 'text-rose-400' : 'text-emerald-400'}>{r.isArchived ? 'Archived' : 'Active'}</strong></span>
                        <span className="font-mono text-[10px]">ID: {r.id?.substring(0, 8)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* SCREEN 3: VALIDATED SKILLS TAGS MATRIX (ACROSS ALL CATEGORIES)  */}
          {/* ============================================================== */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              {/* Filter Card for Skills */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Code className="w-4 h-4 text-indigo-400" />
                      Validated Skills Matrix ({filteredGlobalSkills.length} of {allFlattenedSkills.length})
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Standardized capability keywords and verification tags indexed across all categories
                    </p>
                  </div>

                  {(globalSkillSearch || globalSkillCategoryFilter !== 'all' || globalSkillStatusFilter !== 'all' || globalSkillSortBy !== 'name-asc') && (
                    <button
                      onClick={() => {
                        setGlobalSkillSearch('');
                        setGlobalSkillCategoryFilter('all');
                        setGlobalSkillStatusFilter('all');
                        setGlobalSkillSortBy('name-asc');
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 self-start md:self-auto transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Skill Filters
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={globalSkillSearch}
                      onChange={(e) => setGlobalSkillSearch(e.target.value)}
                      placeholder="Search skills or tags..."
                      className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                    {globalSkillSearch && (
                      <button onClick={() => setGlobalSkillSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Category Filter */}
                  <div>
                    <select
                      value={globalSkillCategoryFilter}
                      onChange={(e) => setGlobalSkillCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all">All Categories ({categories.length})</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <select
                      value={globalSkillStatusFilter}
                      onChange={(e) => setGlobalSkillStatusFilter(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all">All Statuses ({allFlattenedSkills.length})</option>
                      <option value="active">Active Tags ({allFlattenedSkills.filter(s => !s.isArchived).length})</option>
                      <option value="archived">Archived Tags ({allFlattenedSkills.filter(s => s.isArchived).length})</option>
                    </select>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <select
                      value={globalSkillSortBy}
                      onChange={(e) => setGlobalSkillSortBy(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="name-asc">Sort: Skill Name (A → Z)</option>
                      <option value="name-desc">Sort: Skill Name (Z → A)</option>
                      <option value="category-asc">Sort: By Category</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Skills Tags Grid / Cloud */}
              {filteredGlobalSkills.length === 0 ? (
                <div className="p-16 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 space-y-3">
                  <Code className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">No Skill Tags Match Your Filters</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try clearing search criteria or choosing a different category.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
                    <span>Displaying <strong className="text-white">{filteredGlobalSkills.length}</strong> standardized skill tags</span>
                    <span className="text-[11px] text-slate-500">Click any skill to edit or archive</span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {filteredGlobalSkills.map((s) => (
                      <div
                        key={s.id}
                        className={`group px-3.5 py-2 rounded-xl border text-xs flex items-center gap-2.5 transition shadow-sm ${
                          s.isArchived
                            ? 'bg-slate-950/40 border-slate-800 text-slate-500 line-through'
                            : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-indigo-500/80 hover:bg-slate-900'
                        }`}
                      >
                        <span className="font-semibold text-white group-hover:text-indigo-300 transition">{s.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.2 rounded bg-slate-800/80 border border-slate-700/60">
                          {s.categoryName}
                        </span>

                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition pl-1">
                          <button
                            onClick={() => setSkillModal({ isEdit: true, categoryId: s.categoryId, data: { ...s } })}
                            className="text-slate-400 hover:text-white"
                            title="Edit Skill Tag"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleToggleArchiveSkill(s.id)}
                            className={s.isArchived ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-400 hover:text-rose-400'}
                            title={s.isArchived ? 'Unarchive Skill' : 'Archive Skill'}
                          >
                            {s.isArchived ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: INSPECT CATEGORY SUB-TAXONOMY BRANCH DRAWER/MODAL     */}
      {/* ============================================================== */}
      {inspectingCategory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-rose-400 tracking-wider">
                  Category Branch Inspection
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">{inspectingCategory.name}</h2>
                <p className="text-xs font-mono text-slate-400">/{inspectingCategory.slug}</p>
                <p className="text-xs text-slate-300 mt-2">{inspectingCategory.description}</p>
              </div>

              <button
                onClick={() => setInspectingCategory(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Roles Section in Inspector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" />
                  Standardized Roles ({inspectingCategory.roles?.length || 0})
                </h3>

                <button
                  onClick={() => {
                    setRoleModal({ isEdit: false, categoryId: inspectingCategory.id, data: { categoryId: inspectingCategory.id, name: '', slug: '', description: '' } });
                  }}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add Role</span>
                </button>
              </div>

              {(!inspectingCategory.roles || inspectingCategory.roles.length === 0) ? (
                <div className="p-6 text-center bg-slate-950/60 border border-slate-800 rounded-xl text-slate-500 text-xs">
                  No roles added to this category branch yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inspectingCategory.roles.map((r: any) => (
                    <div key={r.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-white text-xs">{r.name}</p>
                        <p className="text-[10px] font-mono text-slate-500">/{r.slug}</p>
                        {r.description && <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{r.description}</p>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setRoleModal({ isEdit: true, categoryId: inspectingCategory.id, data: { ...r, categoryId: inspectingCategory.id } })}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleToggleArchiveRole(r.id)}
                          className={r.isArchived ? 'text-emerald-400' : 'text-slate-500 hover:text-rose-400'}
                        >
                          <Archive className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Skills Section in Inspector */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-400" />
                  Validated Skill Tags ({inspectingCategory.skills?.length || 0})
                </h3>

                <button
                  onClick={() => {
                    setSkillModal({ isEdit: false, categoryId: inspectingCategory.id, data: { categoryId: inspectingCategory.id, name: '', slug: '' } });
                  }}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Add Skill</span>
                </button>
              </div>

              {(!inspectingCategory.skills || inspectingCategory.skills.length === 0) ? (
                <div className="p-6 text-center bg-slate-950/60 border border-slate-800 rounded-xl text-slate-500 text-xs">
                  No skill tags added to this category branch yet.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {inspectingCategory.skills.map((s: any) => (
                    <div key={s.id} className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs flex items-center gap-2">
                      <span className="font-medium text-slate-200">{s.name}</span>
                      <button onClick={() => handleToggleArchiveSkill(s.id)} className="text-slate-500 hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectingCategory(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODALS: CATEGORY, ROLE, SKILL                                  */}
      {/* ============================================================== */}

      {/* Category Edit / Add Modal */}
      {categoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveCategory} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white">
              {categoryModal.isEdit ? 'Edit Category' : 'Add New Category'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Name *</label>
              <input
                type="text"
                required
                value={categoryModal.data.name}
                onChange={(e) => setCategoryModal({ ...categoryModal, data: { ...categoryModal.data, name: e.target.value, slug: categoryModal.isEdit ? categoryModal.data.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') } })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Slug *</label>
              <input
                type="text"
                required
                value={categoryModal.data.slug}
                onChange={(e) => setCategoryModal({ ...categoryModal, data: { ...categoryModal.data, slug: e.target.value } })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                rows={2}
                value={categoryModal.data.description || ''}
                onChange={(e) => setCategoryModal({ ...categoryModal, data: { ...categoryModal.data, description: e.target.value } })}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setCategoryModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Role Modal */}
      {roleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveRole} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white">
              {roleModal.isEdit ? 'Edit Job Role' : 'Add Taxonomy Role'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Parent Category *</label>
              <select
                value={roleModal.data.categoryId || roleModal.categoryId}
                onChange={(e) => setRoleModal({ ...roleModal, categoryId: e.target.value, data: { ...roleModal.data, categoryId: e.target.value } })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Role Title *</label>
              <input
                type="text"
                required
                value={roleModal.data.name}
                onChange={(e) => setRoleModal({ ...roleModal, data: { ...roleModal.data, name: e.target.value, slug: roleModal.isEdit ? roleModal.data.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') } })}
                placeholder="e.g. YouTube Thumbnail Designer"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Slug *</label>
              <input
                type="text"
                required
                value={roleModal.data.slug}
                onChange={(e) => setRoleModal({ ...roleModal, data: { ...roleModal.data, slug: e.target.value } })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                rows={2}
                value={roleModal.data.description || ''}
                onChange={(e) => setRoleModal({ ...roleModal, data: { ...roleModal.data, description: e.target.value } })}
                placeholder="Brief summary of skills and deliverables expected for this role..."
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRoleModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold"
              >
                Save Role
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Skill Modal */}
      {skillModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveSkill} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-white">
              {skillModal.isEdit ? 'Edit Skill Tag' : 'Add Skill Tag'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Parent Category *</label>
              <select
                value={skillModal.data.categoryId || skillModal.categoryId}
                onChange={(e) => setSkillModal({ ...skillModal, categoryId: e.target.value, data: { ...skillModal.data, categoryId: e.target.value } })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Skill Name *</label>
              <input
                type="text"
                required
                value={skillModal.data.name}
                onChange={(e) => setSkillModal({ ...skillModal, data: { ...skillModal.data, name: e.target.value, slug: skillModal.isEdit ? skillModal.data.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') } })}
                placeholder="e.g. DaVinci Resolve, Next.js, SEO"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSkillModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold"
              >
                Save Tag
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
