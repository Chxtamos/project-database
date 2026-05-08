import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Film, CreditCard, Star, Users, FileText, LogOut, UserRoundCog } from 'lucide-react';

const Layout = ({ children, pageTitle, pageDescription }) => {
  return (
    <div className="flex h-screen bg-figma-bg font-inter text-figma-dark">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 text-2xl font-bold text-figma-blue">FilmHubAdmin</div>
        <nav className="flex-1 px-4 space-y-2">
          <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem to="/movies" icon={<Film size={20} />} label="Manage Movies" />
          <NavItem to="/payments" icon={<CreditCard size={20} />} label="Manage Payments" />
          <NavItem to="/reviews" icon={<Star size={20} />} label="Manage Reviews" />
          <NavItem to="/users" icon={<Users size={20} />} label="Manage Users" />
          <NavItem to="/credits" icon={<UserRoundCog size={20} />} label="Manage Actor & Author" />
          <NavItem to="/report" icon={<FileText size={20} />} label="System Report" />
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Link to="/" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">{pageTitle}</h1>
            {pageDescription && <p className="text-xs text-gray-500">{pageDescription}</p>}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-figma-blue rounded-full"></div>
            <span className="text-sm font-medium">Admin User</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, label }) => (
  <Link to={to} className="flex items-center gap-3 p-3 text-gray-600 hover:bg-figma-blue hover:text-white rounded-lg transition-all duration-200 group">
    <span className="group-hover:scale-110 transition-transform">{icon}</span>
    <span className="font-medium">{label}</span>
  </Link>
);

export default Layout;
