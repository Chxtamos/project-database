import React, { useState } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { MoreVertical, Plus, Search, Filter, ImagePlus, Upload } from 'lucide-react';

const ManageMovies = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(null);

  const movies = [
    ["Inception", "Sci-Fi", "2010", "Published"],
    ["The Matrix", "Sci-Fi", "1999", "Published"],
    ["Interstellar", "Sci-Fi", "2014", "Draft"],
  ];

  const handleEdit = (id) => {
    setSelectedId(id);
    setIsEditOpen(true);
  };

  const handleDelete = (id) => {
    setSelectedId(id);
    setIsDeleteOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingImage(URL.createObjectURL(file));
    }
  };

  return (
    <Layout pageTitle="Manage Movies" pageDescription="Library of all movies in the system.">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" />
            </div>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter size={18} />
            </button>
          </div>
          <button onClick={() => { setUploadingImage(null); setIsAddOpen(true); }} className="px-4 py-2 bg-figma-blue text-white rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95">
            <Plus size={18} />
            Add New
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Movie Title</th>
                <th className="px-6 py-4">Genre</th>
                <th className="px-6 py-4">Release Year</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {movies.map((movie, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600 font-medium cursor-pointer hover:text-figma-blue" onClick={() => handleEdit(idx)}>{movie[0]}</td>
                  <td className="px-6 py-4 text-gray-600">{movie[1]}</td>
                  <td className="px-6 py-4 text-gray-600">{movie[2]}</td>
                  <td className="px-6 py-4 text-gray-600">{movie[3]}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative group">
                      <button className="p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors">
                        <MoreVertical size={16} />
                      </button>
                      <div className="absolute right-0 top-8 w-32 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-10 hidden group-hover:block animate-in fade-in slide-in-from-top-2">
                        <button onClick={() => handleEdit(idx)} className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-figma-blue transition-colors">Edit</button>
                        <button onClick={() => handleDelete(idx)} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">Delete</button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Movie">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative group overflow-hidden h-48" onClick={() => document.getElementById('file-upload').click()}>
            {uploadingImage ? (
              <img src={uploadingImage} alt="upload-preview" className="w-full h-full object-cover absolute inset-0" />
            ) : (
              <div className="flex flex-col items-center text-gray-400">
                <ImagePlus size={40} className="mb-2" />
                <p className="text-sm font-medium">Click to upload movie poster</p>
                <p className="text-xs">PNG, JPG up to 5MB</p>
              </div>
            )}
            <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            {uploadingImage && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">
                <Upload size={24} className="mr-2" /> Change Image
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-gray-700">Movie Title</label>
              <input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" placeholder="Enter movie title..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Genre</label>
              <input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" placeholder="Enter genre..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Release Year</label>
              <input type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" placeholder="Enter year..." />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm">
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-figma-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200">Save Changes</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Movie">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Movie Title</label>
            <input type="text" defaultValue={movies[selectedId]?.[0]} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Genre</label>
            <input type="text" defaultValue={movies[selectedId]?.[1]} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" placeholder="Enter genre..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Release Year</label>
            <input type="text" defaultValue={movies[selectedId]?.[2]} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <input type="text" defaultValue={movies[selectedId]?.[3]} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-figma-blue outline-none transition-all text-sm" />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-figma-blue text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200">Update Changes</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={() => { console.log("Deleted ID:", selectedId); setIsDeleteOpen(false); }} title="Delete Movie" message="Are you sure you want to delete this movie? This action cannot be undone." />
    </Layout>
  );
};

export default ManageMovies;
