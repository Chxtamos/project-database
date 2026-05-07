import React from 'react';
import UserLayout from '../../components/UserLayout';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const movies = [
  { id: 1, title: "Inception", price: "$12.99", img: "https://api.dicebear.com/7.x/shapes/svg?seed=1" },
  { id: 2, title: "The Matrix", price: "$14.99", img: "https://api.dicebear.com/7.x/shapes/svg?seed=2" },
  { id: 3, title: "Interstellar", price: "$10.99", img: "https://api.dicebear.com/7.x/shapes/svg?seed=3" },
  { id: 4, title: "The Dark Knight", price: "$12.99", img: "https://api.dicebear.com/7.x/shapes/svg?seed=4" },
  { id: 5, title: "Avatar", price: "$15.99", img: "https://api.dicebear.com/7.x/shapes/svg?seed=5" },
  { id: 6, title: "Tenet", price: "$11.99", img: "https://api.dicebear.com/7.x/shapes/svg?seed=6" },
];

const Home = () => {
  const navigate = useNavigate();
  return (
    <UserLayout pageTitle="Discover Movies">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {movies.map(movie => (
          <div key={movie.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
            <div className="aspect-[2/3] relative overflow-hidden cursor-pointer" onClick={() => navigate(`/user/movie/${movie.id}`)}>
              <img src={movie.img} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-3">
              <h3 className="font-bold text-sm truncate">{movie.title}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-figma-blue font-bold text-sm">{movie.price}</span>
                <button className="p-1.5 bg-figma-blue text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <ShoppingCart size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </UserLayout>
  );
};

export default Home;
