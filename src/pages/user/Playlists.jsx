import React from 'react';
import UserLayout from '../../components/UserLayout';
import { Plus, Play } from 'lucide-react';

const Playlists = () => {
  const playlists = [
    { id: 1, name: "Sci-Fi Favorites", count: 12 },
    { id: 2, name: "Weekend Binge", count: 5 },
    { id: 3, name: "All-time Classics", count: 20 },
  ];
  return (
    <UserLayout pageTitle="My Playlists">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map(pl => (
          <div key={pl.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-figma-blue transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-figma-blue text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                <Play size={24} fill="currentColor" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{pl.name}</h3>
                <p className="text-sm text-gray-400">{pl.count} movies</p>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-figma-blue transition-colors">
              <Plus size={20} />
            </button>
          </div>
        ))}
        <button className="border-2 border-dashed border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-figma-blue hover:text-figma-blue transition-all group">
          <Plus size={32} className="mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Create New Playlist</span>
        </button>
      </div>
    </UserLayout>
  );
};

export default Playlists;
