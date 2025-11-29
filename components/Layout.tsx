import React, { useState } from 'react';
import { Menu, X, Phone, MapPin, Activity, Lock, User, LogOut } from 'lucide-react';
import { CLINIC_NAME, CLINIC_PHONE } from '../constants';
import { User as UserType } from '../types';
import { logoutUser } from '../services/dbService';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  isAdminMode?: boolean;
  currentUser: UserType | null;
  onUserLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentPage, 
  onNavigate, 
  isAdminMode = false,
  currentUser,
  onUserLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Accueil' },
    { id: 'services', label: 'Services' },
    { id: 'doctors', label: 'Docteurs' },
    { id: 'appointment', label: 'Rendez-vous' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNav = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logoutUser();
    onUserLogout();
    handleNav('home');
  };

  // Layout différent pour l'Admin
  if (isAdminMode) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <header className="bg-slate-900 text-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2 font-bold text-xl">
              <Activity className="text-emerald-500" />
              <span>Admin - {CLINIC_NAME}</span>
            </div>
            <button 
              onClick={() => onNavigate('home')}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Retour au site public
            </button>
          </div>
        </header>
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    );
  }

  // Layout Public Standard
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Bar */}
      <div className="bg-emerald-700 text-white text-sm py-2 px-4 hidden md:block">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-2"><Phone size={14} /> {CLINIC_PHONE}</span>
            <span className="flex items-center gap-2"><MapPin size={14} /> Lomé, Togo</span>
          </div>
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <span className="font-medium text-emerald-100">Bonjour, {currentUser.name}</span>
            ) : (
              <>
                <span>Urgences 24/7</span>
                <span>Laboratoire Ouvert</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div 
            className="flex items-center gap-2 text-emerald-700 font-bold text-xl cursor-pointer"
            onClick={() => handleNav('home')}
          >
            <Activity size={28} />
            <span>{CLINIC_NAME}</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`font-medium transition-colors ${
                  currentPage === item.id 
                    ? 'text-emerald-600 border-b-2 border-emerald-600' 
                    : 'text-slate-600 hover:text-emerald-600'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Auth Buttons */}
            <div className="pl-4 border-l border-gray-200 flex items-center gap-3">
              {currentUser ? (
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-600 hover:text-red-600 font-medium text-sm transition-colors"
                >
                  <LogOut size={16} />
                  Déconnexion
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => handleNav('login')}
                    className="text-slate-600 hover:text-emerald-600 font-medium text-sm transition-colors"
                  >
                    Connexion
                  </button>
                  <button 
                    onClick={() => handleNav('register')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm transition-colors"
                  >
                    S'inscrire
                  </button>
                </>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-slate-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`block w-full text-left px-6 py-3 font-medium ${
                  currentPage === item.id 
                    ? 'text-emerald-700 bg-emerald-50' 
                    : 'text-slate-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-2 px-6 pb-4 flex flex-col gap-3">
              {currentUser ? (
                <button 
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-red-600 font-medium flex items-center gap-2"
                >
                  <LogOut size={16} /> Déconnexion ({currentUser.name})
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => handleNav('login')}
                    className="w-full text-center py-2 text-slate-600 font-medium border border-gray-200 rounded-lg"
                  >
                    Se connecter
                  </button>
                  <button 
                    onClick={() => handleNav('register')}
                    className="w-full text-center py-2 bg-emerald-600 text-white font-medium rounded-lg"
                  >
                    Créer un compte
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
              <Activity size={24} />
              <span>{CLINIC_NAME}</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Engagement envers l'excellence médicale et les soins compatissants pour la communauté de Lomé et au-delà.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Liens Rapides</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => handleNav('doctors')} className="hover:text-emerald-400">Nos Spécialistes</button></li>
              <li><button onClick={() => handleNav('services')} className="hover:text-emerald-400">Services Médicaux</button></li>
              <li><button onClick={() => handleNav('appointment')} className="hover:text-emerald-400">Prendre Rendez-vous</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <span>145 Blvd du 13 Janvier,<br/>Lomé, Togo</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="flex-shrink-0" />
                <span>{CLINIC_PHONE}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-8 border-t border-slate-800 text-center text-xs flex justify-between items-center">
          <span>© {new Date().getFullYear()} {CLINIC_NAME}. Tous droits réservés.</span>
          <button 
            onClick={() => onNavigate('admin')} 
            className="text-slate-700 hover:text-slate-500 flex items-center gap-1 transition-colors"
          >
            <Lock size={12} /> Accès Personnel
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Layout;