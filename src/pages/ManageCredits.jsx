import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import ConfirmModal from '../components/ConfirmModal';
import { Filter, Pencil, Plus, Search, Trash2, UserRound, BookOpen } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const CREDIT_SECTIONS = [
  {
    key: 'actors',
    title: 'Actors',
    singular: 'Actor',
    idKey: 'actor_id',
    nameKey: 'actor_name',
    icon: UserRound,
    accent: 'blue',
  },
  {
    key: 'authors',
    title: 'Authors',
    singular: 'Author',
    idKey: 'author_id',
    nameKey: 'author_name',
    icon: BookOpen,
    accent: 'emerald',
  },
];

const ManageCredits = () => {
  const [actors, setActors] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');
  const [forms, setForms] = useState({ actors: '', authors: '' });
  const [editing, setEditing] = useState({ type: '', id: null });
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const token = localStorage.getItem('token');

  const fetchCredits = async () => {
    setLoading(true);
    setError('');
    try {
      const [actorRes, authorRes] = await Promise.all([
        fetch(`${API_BASE}/credits/actors`),
        fetch(`${API_BASE}/credits/authors`),
      ]);
      const [actorData, authorData] = await Promise.all([actorRes.json(), authorRes.json()]);
      if (actorData.success) setActors(actorData.data);
      if (authorData.success) setAuthors(authorData.data);
    } catch (err) {
      console.error('Fetch credits error:', err);
      setError('Cannot load actors and authors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  const dataByType = useMemo(() => ({ actors, authors }), [actors, authors]);

  const filteredData = (type, nameKey) => {
    const q = searchTerm.toLowerCase();
    return dataByType[type]
      .filter(item => item[nameKey]?.toLowerCase().includes(q))
      .sort((a, b) => {
        const nameCompare = (a[nameKey] || '').localeCompare(b[nameKey] || '', ['th', 'en'], { sensitivity: 'base' });
        const moviesA = Number(a.movie_count || 0);
        const moviesB = Number(b.movie_count || 0);
        if (sortBy === 'name_desc') return -nameCompare;
        if (sortBy === 'movies_asc') return moviesA - moviesB;
        if (sortBy === 'movies_desc') return moviesB - moviesA;
        return nameCompare;
      });
  };

  const resetForm = (type) => {
    setForms(prev => ({ ...prev, [type]: '' }));
    if (editing.type === type) {
      setEditing({ type: '', id: null });
    }
  };

  const handleSubmit = async (e, section) => {
    e.preventDefault();
    const name = forms[section.key].trim();
    if (!name) return;

    const isEditing = editing.type === section.key && editing.id;
    const url = isEditing
      ? `${API_BASE}/credits/${section.key}/${editing.id}`
      : `${API_BASE}/credits/${section.key}`;

    try {
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || `Cannot save ${section.singular.toLowerCase()}.`);
        return;
      }

      resetForm(section.key);
      setError('');
      fetchCredits();
    } catch (err) {
      console.error('Save credit error:', err);
      setError(`Cannot save ${section.singular.toLowerCase()}.`);
    }
  };

  const startEdit = (section, item) => {
    setForms(prev => ({ ...prev, [section.key]: item[section.nameKey] }));
    setEditing({ type: section.key, id: item[section.idKey] });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API_BASE}/credits/${deleteTarget.type}/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Cannot delete item.');
        return;
      }

      setDeleteTarget(null);
      setError('');
      fetchCredits();
    } catch (err) {
      console.error('Delete credit error:', err);
      setError('Cannot delete item.');
    }
  };

  return (
    <Layout pageTitle="Manage Actor & Author" pageDescription="Add, edit, and remove movie credits used in Edit Movie.">
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-gray-900">Credit Database</p>
            <p className="text-xs text-gray-500 mt-1">Actors and authors added here will appear in the Edit Movie dropdown.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search actor or author..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={18} className="text-gray-400" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full md:w-56 px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-figma-blue outline-none text-sm">
              <option value="name_asc">Name A-Z / ก-ฮ</option>
              <option value="name_desc">Name Z-A / ฮ-ก</option>
              <option value="movies_desc">Movies most to least</option>
              <option value="movies_asc">Movies least to most</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {CREDIT_SECTIONS.map(section => (
            <CreditPanel
              key={section.key}
              section={section}
              items={filteredData(section.key, section.nameKey)}
              loading={loading}
              formValue={forms[section.key]}
              isEditing={editing.type === section.key}
              onFormChange={value => setForms(prev => ({ ...prev, [section.key]: value }))}
              onSubmit={handleSubmit}
              onCancel={() => resetForm(section.key)}
              onEdit={startEdit}
              onDelete={(item) => setDeleteTarget({
                type: section.key,
                id: item[section.idKey],
                name: item[section.nameKey],
                label: section.singular,
              })}
            />
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete ${deleteTarget?.label || 'Item'}`}
        message={`Are you sure you want to delete "${deleteTarget?.name || ''}"? Movie links for this item will also be removed.`}
        confirmLabel="Delete"
        confirmColor="red"
      />
    </Layout>
  );
};

const CreditPanel = ({
  section,
  items,
  loading,
  formValue,
  isEditing,
  onFormChange,
  onSubmit,
  onCancel,
  onEdit,
  onDelete,
}) => {
  const Icon = section.icon;
  const accentClasses = section.accent === 'emerald'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
    : 'bg-blue-50 text-figma-blue border-blue-100';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${accentClasses}`}>
            <Icon size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-gray-900">{section.title}</h2>
            <p className="text-xs text-gray-500">{items.length} records</p>
          </div>
        </div>
      </div>

      <form className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3" onSubmit={e => onSubmit(e, section)}>
        <input
          type="text"
          required
          value={formValue}
          onChange={e => onFormChange(e.target.value)}
          placeholder={`${isEditing ? 'Edit' : 'Add'} ${section.singular.toLowerCase()} name...`}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg outline-none text-sm focus:ring-2 focus:ring-figma-blue"
        />
        {isEditing && (
          <button type="button" onClick={onCancel} className="px-4 py-2.5 text-gray-600 font-bold border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
        )}
        <button type="submit" className="px-5 py-2.5 bg-figma-blue text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700">
          <Plus size={16} />
          {isEditing ? 'Update' : 'Add'}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 text-xs uppercase">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Movies</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="3" className="px-5 py-8 text-center text-gray-400">Loading...</td>
              </tr>
            ) : items.length > 0 ? (
              items.map(item => (
                <tr key={item[section.idKey]} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-bold text-gray-900">{item[section.nameKey]}</td>
                  <td className="px-5 py-3 text-gray-500">{item.movie_count || 0}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => onEdit(section, item)} className="p-2 text-figma-blue bg-blue-50 hover:bg-blue-100 rounded-lg">
                        <Pencil size={15} />
                      </button>
                      <button type="button" onClick={() => onDelete(item)} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-5 py-8 text-center text-gray-400">No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageCredits;
