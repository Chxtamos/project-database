import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { Pencil, Trash2, Plus, Search, Filter, ImagePlus, Upload, Star, Link as LinkIcon, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const ManageMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actors, setActors] = useState([]);
  const [authors, setAuthors] = useState([]);

  const [formData, setFormData] = useState({ 
    movie_id: '', movie_name: '', genre_ids: [], actor_ids: [], author_ids: [], movie_cost: '', movie_releasedate: '', status: 'Published', poster_url: '', video_url: '', detail: ''
  });

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/movies?limit=100`);
      const data = await res.json();
      if (data.success) {
        setMovies(data.data);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActors = async () => {
    try {
      const res = await fetch(`${API_BASE}/movies/actors/all`);
      const data = await res.json();
      if (data.success) {
        setActors(data.data);
      }
    } catch (err) {
      console.error('Fetch actors error:', err);
    }
  };

  const fetchAuthors = async () => {
    try {
      const res = await fetch(`${API_BASE}/movies/authors/all`);
      const data = await res.json();
      if (data.success) {
        setAuthors(data.data);
      }
    } catch (err) {
      console.error('Fetch authors error:', err);
    }
  };

  useEffect(() => {
    fetchMovies();
    fetchActors();
    fetchAuthors();
  }, []);

  const handleEdit = (movie) => {
    setSelectedId(movie.movie_id);
    const isDraft = new Date(movie.movie_releasedate) > new Date();
    setFormData({
      movie_name: movie.movie_name,
      movie_cost: movie.movie_cost,
      movie_releasedate: movie.movie_releasedate ? movie.movie_releasedate.split('T')[0] : '',
      status: isDraft ? 'Draft' : 'Published',
      poster_url: (movie.movie_poster && movie.movie_poster.startsWith('http')) ? movie.movie_poster : '',
      genre_ids: movie.genres ? movie.genres.map(g => g.genre_id) : [],
      actor_ids: movie.actors ? movie.actors.map(a => a.actor_id) : [],
      author_ids: movie.authors ? movie.authors.map(a => a.author_id) : [],
      video_url: movie.video_url || '',
      detail: movie.detail || ''
    });
    const posterSrc = movie.movie_poster 
      ? (movie.movie_poster.startsWith('/') ? `${API_BASE.replace('/api', '')}${movie.movie_poster}` : movie.movie_poster)
      : '';
    setUploadingImage(posterSrc);
    setImageFile(null);
    setIsEditOpen(true);
  };

  const handleDelete = (id) => {
    setSelectedId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`${API_BASE}/movies/${selectedId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchMovies();
        setIsDeleteOpen(false);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    const data = new FormData();
    data.append('movie_name', formData.movie_name);
    data.append('movie_cost', formData.movie_cost);
    data.append('movie_releasedate', formData.movie_releasedate);
    data.append('genre_ids', formData.genre_ids.join(','));
    data.append('actor_ids', formData.actor_ids.join(','));
    data.append('author_ids', formData.author_ids.join(','));
    data.append('video_url', formData.video_url || '');
    data.append('detail', formData.detail);
    if (formData.poster_url) data.append('poster_url', formData.poster_url);
    if (imageFile) data.append('poster', imageFile);

    const url = type === 'add' ? `${API_BASE}/movies` : `${API_BASE}/movies/${selectedId}`;
    const method = type === 'add' ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: data
      });
      if (res.ok) {
        fetchMovies();
        setIsAddOpen(false);
        setIsEditOpen(false);
      }
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const toggleGenre = (genreId) => {
    setFormData(prev => ({
      ...prev,
      genre_ids: prev.genre_ids.includes(genreId)
        ? prev.genre_ids.filter(id => id !== genreId)
        : [...prev.genre_ids, genreId]
    }));
  };

  const toggleActor = (actorId) => {
    setFormData(prev => ({
      ...prev,
      actor_ids: prev.actor_ids.includes(actorId)
        ? prev.actor_ids.filter(id => id !== actorId)
        : [...prev.actor_ids, actorId]
    }));
  };

  const toggleAuthor = (authorId) => {
    setFormData(prev => ({
      ...prev,
      author_ids: prev.author_ids.includes(authorId)
        ? prev.author_ids.filter(id => id !== authorId)
        : [...prev.author_ids, authorId]
    }));
  };

  const ALL_GENRES = [
    { id: 1, name: "Action" }, { id: 2, name: "Comedy" }, { id: 3, name: "Drama" },
    { id: 4, name: "Sci-Fi" }, { id: 5, name: "Horror" }, { id: 6, name: "Romance" },
    { id: 7, name: "Thriller" }, { id: 8, name: "Animation" }, { id: 9, name: "Documentary" }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setUploadingImage(URL.createObjectURL(file));
      setFormData({ ...formData, poster_url: '' }); // Clear URL if file is picked
    }
  };

  const filteredMovies = movies.filter(m => 
    m.movie_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPosterSrc = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_BASE.replace('/api', '')}${path}`;
  };

  return (
    <Layout pageTitle="Manage Movies" pageDescription="Update, add, or remove titles from your streaming library.">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Total Movies</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-black text-gray-900">{movies.length}</p>
            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">+12%</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Active Titles</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-black text-gray-900">{movies.filter(m => new Date(m.movie_releasedate) <= new Date()).length}</p>
            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">Live</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Average Rating</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-black text-gray-900 flex items-center gap-2">
              {(movies.reduce((acc, m) => acc + (m.movie_rating || 0), 0) / (movies.length || 1)).toFixed(1)} <Star className="text-yellow-500 fill-yellow-500" size={24} />
            </p>
            <span className="text-xs font-bold text-gray-500">Platform Avg</span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search movies..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" 
            />
          </div>
          <button onClick={() => { setUploadingImage(null); setFormData({ movie_name: '', genre_ids: [], actor_ids: [], author_ids: [], movie_cost: '', movie_releasedate: new Date().toISOString().split('T')[0], status: 'Published', poster_url: '', video_url: '', detail: '' }); setIsAddOpen(true); }} className="w-full sm:w-auto px-5 py-2.5 bg-figma-blue text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-sm">
            <Plus size={18} />
            Add New Movie
          </button>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="animate-spin mb-2" size={40} />
              <p>Loading movies from database...</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Thumbnail</th>
                  <th className="px-6 py-4">Movie Name</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Release Date</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMovies.map((movie) => {
                  const isDraft = new Date(movie.movie_releasedate) > new Date();
                  return (
                    <tr key={movie.movie_id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-gray-400">#{movie.movie_id}</td>
                      <td className="px-6 py-4">
                        <div className="w-12 h-16 bg-gray-200 rounded overflow-hidden shadow-sm">
                          <img src={getPosterSrc(movie.movie_poster)} alt={movie.movie_name} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 text-base mb-1 cursor-pointer hover:text-figma-blue" onClick={() => handleEdit(movie)}>
                          {movie.movie_name} {isDraft && <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full uppercase">Draft</span>}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">{movie.genres ? movie.genres.map(g => g.genre_name).join(' • ') : 'No Genre'}</p>
                        {movie.actors && movie.actors.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">Actors: {movie.actors.map(a => a.actor_name).join(', ')}</p>
                        )}
                        {movie.authors && movie.authors.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">Authors: {movie.authors.map(a => a.author_name).join(', ')}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-figma-blue">฿{movie.movie_cost}</td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{formatDate(movie.movie_releasedate)}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleEdit(movie)} className="p-1.5 text-figma-blue bg-white border border-blue-200 hover:bg-blue-50 rounded-lg shadow-sm">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete(movie.movie_id)} className="p-1.5 text-red-500 bg-white border border-red-200 hover:bg-red-50 rounded-lg shadow-sm">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Movie" maxWidth="max-w-4xl">
        <form className="space-y-6" onSubmit={(e) => handleSubmit(e, 'add')}>
          {/* Image Selection Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100 cursor-pointer relative overflow-hidden h-40" onClick={() => document.getElementById('file-upload').click()}>
              {uploadingImage ? (
                <img src={uploadingImage} alt="preview" className="w-full h-full object-cover absolute inset-0" />
              ) : (
                <div className="text-center text-gray-400">
                  <ImagePlus size={32} className="mx-auto mb-2" />
                  <p className="text-xs font-bold">Upload File</p>
                </div>
              )}
              <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
            
            <div className="flex flex-col justify-center space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <LinkIcon size={14} /> Or Paste Image URL
              </label>
              <textarea 
                placeholder="https://example.com/poster.jpg"
                className="w-full h-24 p-3 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none resize-none"
                value={formData.poster_url}
                onChange={(e) => {
                  setFormData({...formData, poster_url: e.target.value});
                  setUploadingImage(e.target.value);
                  setImageFile(null);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Movie Name</label>
              <input type="text" required value={formData.movie_name} onChange={e => setFormData({...formData, movie_name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-sm" />
            </div>
            <div className="col-span-1 space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Cost (฿)</label>
              <input type="number" step="0.01" required value={formData.movie_cost} onChange={e => setFormData({...formData, movie_cost: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-sm" />
            </div>
            <div className="col-span-1 space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Release Date</label>
              <input type="date" required value={formData.movie_releasedate} onChange={e => setFormData({...formData, movie_releasedate: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-sm" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Synopsis (Detail)</label>
              <textarea rows="3" value={formData.detail} onChange={e => setFormData({...formData, detail: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-sm resize-none" placeholder="Movie synopsis..."></textarea>
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Video Link</label>
              <input
                type="url"
                value={formData.video_url}
                onChange={e => setFormData({...formData, video_url: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-sm"
                placeholder="https://example.com/movie.mp4 or YouTube link"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Genres</label>
              <div className="flex flex-wrap gap-2">
                {ALL_GENRES.map(g => (
                  <button type="button" key={g.id} onClick={() => toggleGenre(g.id)} className={`px-3 py-1 text-xs font-bold rounded border ${formData.genre_ids.includes(g.id) ? 'bg-gray-900 text-white' : 'bg-white text-gray-600'}`}>
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
            <MultiSelectDropdown
              label="Actors"
              items={actors}
              selectedIds={formData.actor_ids}
              idKey="actor_id"
              nameKey="actor_name"
              placeholder="Search actors..."
              emptyText="No actors found."
              onToggle={toggleActor}
            />
            <MultiSelectDropdown
              label="Authors"
              items={authors}
              selectedIds={formData.author_ids}
              idKey="author_id"
              nameKey="author_name"
              placeholder="Search authors..."
              emptyText="No authors found."
              onToggle={toggleAuthor}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setIsAddOpen(false)} className="px-5 py-2 text-gray-600 font-bold border rounded-lg">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-figma-blue text-white font-bold rounded-lg shadow-sm">Save to Database</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Movie" maxWidth="max-w-4xl">
        <form className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6" onSubmit={(e) => handleSubmit(e, 'edit')}>
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100 cursor-pointer relative overflow-hidden h-[460px]" onClick={() => document.getElementById('file-upload-edit').click()}>
              {uploadingImage ? (
                <img src={uploadingImage} alt="preview" className="w-full h-full object-contain absolute inset-0" />
              ) : (
                <div className="text-center text-gray-400">
                  <ImagePlus size={32} className="mx-auto mb-2" />
                  <p className="text-xs font-bold">Upload File</p>
                </div>
              )}
              <input id="file-upload-edit" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <LinkIcon size={14} /> Or Paste Image URL
              </label>
              <textarea
                placeholder="https://example.com/poster.jpg"
                className="w-full h-24 p-3 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none resize-none"
                value={formData.poster_url}
                onChange={(e) => {
                  setFormData({...formData, poster_url: e.target.value});
                  setUploadingImage(e.target.value);
                  setImageFile(null);
                }}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Movie Name</label>
                <input type="text" required value={formData.movie_name} onChange={e => setFormData({...formData, movie_name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Cost (฿)</label>
                <input type="number" step="0.01" required value={formData.movie_cost} onChange={e => setFormData({...formData, movie_cost: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Release Date</label>
                <input type="date" required value={formData.movie_releasedate} onChange={e => setFormData({...formData, movie_releasedate: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-sm" />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Synopsis (Detail)</label>
                <textarea rows="3" value={formData.detail} onChange={e => setFormData({...formData, detail: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-sm resize-none" placeholder="Movie synopsis..."></textarea>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Video Link</label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={e => setFormData({...formData, video_url: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none text-sm"
                  placeholder="https://example.com/movie.mp4 or YouTube link"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Genres</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_GENRES.map(g => (
                    <button type="button" key={g.id} onClick={() => toggleGenre(g.id)} className={`px-3 py-1 text-xs font-bold rounded border ${formData.genre_ids.includes(g.id) ? 'bg-gray-900 text-white' : 'bg-white text-gray-600'}`}>
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
              <MultiSelectDropdown
                label="Actors"
                items={actors}
                selectedIds={formData.actor_ids}
                idKey="actor_id"
                nameKey="actor_name"
                placeholder="Search actors..."
                emptyText="No actors found."
                onToggle={toggleActor}
              />
              <MultiSelectDropdown
                label="Authors"
                items={authors}
                selectedIds={formData.author_ids}
                idKey="author_id"
                nameKey="author_name"
                placeholder="Search authors..."
                emptyText="No authors found."
                onToggle={toggleAuthor}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setIsEditOpen(false)} className="px-5 py-2 text-gray-600 font-bold border rounded-lg">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-figma-blue text-white font-bold rounded-lg shadow-sm">Update Database</button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={confirmDelete} title="Delete Movie" message="Are you sure you want to delete this movie? This will be permanent in the database." />
    </Layout>
  );
};

const MultiSelectDropdown = ({ label, items, selectedIds, idKey, nameKey, placeholder, emptyText, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedItems = items.filter(item => selectedIds.includes(item[idKey]));
  const filteredItems = items.filter(item =>
    item[nameKey].toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="col-span-2 space-y-1.5">
      <label className="text-sm font-bold text-gray-700">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(open => !open)}
          className="w-full min-h-[42px] px-3 py-2 border border-gray-300 rounded-lg bg-white text-left text-sm flex items-center justify-between gap-3"
        >
          <span className="text-gray-700 truncate">
            {selectedItems.length > 0
              ? selectedItems.map(item => item[nameKey]).join(', ')
              : `Select ${label.toLowerCase()}`}
          </span>
          <span className="text-xs font-bold text-gray-400">{selectedItems.length}</span>
        </button>

        {isOpen && (
          <div className="relative z-30 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="p-2 border-b border-gray-100">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none text-sm focus:ring-2 focus:ring-figma-blue"
              />
            </div>
            <div className="max-h-44 overflow-y-auto py-1">
              {filteredItems.map(item => {
                const selected = selectedIds.includes(item[idKey]);
                return (
                  <label
                    key={item[idKey]}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => onToggle(item[idKey])}
                      className="h-4 w-4 rounded border-gray-300 text-figma-blue focus:ring-figma-blue"
                    />
                    <span className="truncate">{item[nameKey]}</span>
                  </label>
                );
              })}
              {filteredItems.length === 0 && (
                <p className="px-3 py-3 text-xs text-gray-400">{emptyText}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMovies;
