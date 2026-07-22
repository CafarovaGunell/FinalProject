// src/components/AuthModal.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, X, Heart } from 'lucide-react';

const AuthModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center relative space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bağlama düyməsi */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl transition-colors"
        >
          <X size={18} />
        </button>

        {/* İkon */}
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Heart size={32} className="fill-rose-500/20 stroke-[2.5]" />
        </div>

        {/* Mətnlər */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-slate-900">Hesabınıza daxil olun</h3>
          <p className="text-slate-500 text-xs leading-relaxed px-2">
            Bəyəndiyiniz heyvanları sevimlilərə əlavə etmək və daha sonra onlara baxmaq üçün hesabınıza daxil olmalısınız.
          </p>
        </div>

        {/* Düymələr */}
        <div className="space-y-2 pt-2">
          <Link
            to="/login"
            onClick={onClose}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <LogIn size={16} />
            <span>Daxil Ol</span>
          </Link>

          <Link
            to="/register"
            onClick={onClose}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <UserPlus size={16} />
            <span>Qeydiyyatdan Keç</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;