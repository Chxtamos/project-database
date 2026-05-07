import React from 'react';
import UserLayout from '../../components/UserLayout';
import { Plus } from 'lucide-react';

const Library = () => {
  const ownedMovies = [
    { id: 1, title: "Inception", img: "https://api.dicebear.com/7.x/shapes/svg?seed=1" },
    { id: 2, title: "The Matrix", img: "https://api.dicebear.com/7.x/shapes/svg?seed=2" },
  ];
  return (
    <UserLayout pageTitle="My Library">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {ownedMovies.map(movie => (
          <div key={movie.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
            <div className="aspect-[2/3] relative overflow-hidden">
              <img src={movie.img} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="bg-white text-figma-blue p-2 rounded-full shadow-xl hover:scale-110 transition-transform">
                  <Plus size={20} />
                </button>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-sm truncate">{movie.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </UserLayout>
  );
};

export default Library;
