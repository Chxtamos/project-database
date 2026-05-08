import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Search } from 'lucide-react';

import { useApp } from '../context/AppContext';

const UserLayout = ({ children, pageTitle }) => {
  const { cartMovies } = useApp();

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <div className="min-h-screen bg-figma-bg font-inter text-figma-dark">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link to="/user/home" className="text-2xl font-bold text-figma-blue">FilmHub</Link>
              <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                <Link to="/user/home" className="hover:text-figma-blue transition-colors">Browse</Link>
                <Link to="/user/library" className="hover:text-figma-blue transition-colors">My Library</Link>
                <Link to="/user/playlists" className="hover:text-figma-blue transition-colors">Playlists</Link>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search movies..." 
                  className="pl-9 pr-4 py-1.5 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-figma-blue outline-none w-64 transition-all" 
                />
              </div>
              <Link to="/user/cart" className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative transition-colors">
                <ShoppingCart size={20} />
                {cartMovies && cartMovies.length > 0 && (
                  <span className="absolute top-0 right-0 bg-figma-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {cartMovies.length}
                  </span>
                )}
              </Link>
              <Link to="/user/profile" className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2">
                <User size={20} />
                {user && <span className="text-sm font-bold hidden sm:block">{user.username}</span>}
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {pageTitle && <h1 className="text-3xl font-bold mb-8">{pageTitle}</h1>}
        {children}
      </main>
    </div>
  );
};

export default UserLayout;
