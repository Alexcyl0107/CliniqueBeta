
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { LoginPage, RegisterPage } from './components/Auth';
import { 
  ArrowRight, 
  CheckCircle2, 
  XCircle,
  Calendar, 
  Clock, 
  Stethoscope, 
  Baby, 
  Heart, 
  Ambulance, 
  FlaskConical, 
  ScanLine,
  LogOut,
  Search,
  Lock,
} from 'lucide-react';
import { MOCK_DOCTORS, MOCK_SERVICES } from './constants';
import { 
  createAppointment, 
  getAppointments, 
  updateAppointmentStatus, 
  checkAdminAuth,
  getCurrentUser
} from './services/dbService';
import { Appointment, User as UserType } from './types';

// Icons mapping helper
const IconMap: Record<string, React.ReactNode> = {
  Stethoscope: <Stethoscope size={32} />,
  Baby: <Baby size={32} />,
  Heart: <Heart size={32} />,
  Ambulance: <Ambulance size={32} />,
  FlaskConical: <FlaskConical size={32} />,
  ScanLine: <ScanLine size={32} />
};

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  useEffect(() => {
    // Check for logged in user on load
    const user = getCurrentUser();
    if (user) setCurrentUser(user);
  }, []);

  // Router logic
  const renderPage = () => {
    switch(currentPage) {
      // Public Routes
      case 'home': return <HomePage onNavigate={setCurrentPage} />;
      case 'services': return <ServicesPage />;
      case 'doctors': return <DoctorsPage />;
      case 'appointment': return <AppointmentPage currentUser={currentUser} onNavigate={setCurrentPage} />;
      case 'contact': return <ContactPage />;
      
      // Auth Routes
      case 'login': return <LoginPage onSuccess={(u) => { setCurrentUser(u); setCurrentPage('home'); }} onNavigate={setCurrentPage} />;
      case 'register': return <RegisterPage onSuccess={(u) => { setCurrentUser(u); setCurrentPage('home'); }} onNavigate={setCurrentPage} />;

      // Admin Routes
      case 'admin': 
        return isAdminAuthenticated 
          ? <AdminDashboard onLogout={() => setIsAdminAuthenticated(false)} /> 
          : <AdminLoginPage onLogin={() => setIsAdminAuthenticated(true)} />;
      
      default: return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  const isAdminRoute = currentPage === 'admin';

  return (
    <Layout 
      currentPage={currentPage} 
      onNavigate={setCurrentPage}
      isAdminMode={isAdminRoute && isAdminAuthenticated}
      currentUser={currentUser}
      onUserLogout={() => setCurrentUser(null)}
    >
      {renderPage()}
    </Layout>
  );
}

// --- ADMIN COMPONENTS ---

const AdminLoginPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const isValid = await checkAdminAuth(password);
      if (isValid) {
        onLogin();
      } else {
        setError('Mot de passe incorrect');
      }
    } catch (e) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Espace Personnel</h2>
          <p className="text-slate-500 text-sm mt-2">Accès réservé au personnel médical.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe Admin</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          
          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Vérification...' : 'Accéder au Dashboard'}
          </button>
          <div className="text-center text-xs text-slate-400 mt-4">
             Mot de passe démo : <strong>espoir2024</strong>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const refreshData = async () => {
    setLoading(true);
    const data = await getAppointments();
    setAppointments(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: 'confirmed' | 'cancelled') => {
    // Optimistic update
    setAppointments(prev => prev.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    ));
    await updateAppointmentStatus(id, newStatus);
    // Silent background refresh
    const data = await getAppointments();
    setAppointments(data);
  };

  const filteredAppointments = appointments.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.id.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    today: appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length
  };

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de Bord</h1>
          <p className="text-slate-500">Gestion des rendez-vous et planning.</p>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
        >
          <LogOut size={16} /> Déconnexion
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-slate-500 text-sm font-medium mb-1">En Attente</div>
          <div className="text-3xl font-bold text-orange-500">{stats.pending}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-slate-500 text-sm font-medium mb-1">Rendez-vous Aujourd'hui</div>
          <div className="text-3xl font-bold text-emerald-600">{stats.today}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-slate-500 text-sm font-medium mb-1">Total Dossiers</div>
          <div className="text-3xl font-bold text-slate-800">{stats.total}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {(['all', 'pending', 'confirmed', 'cancelled'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap ${
                filter === f 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'all' ? 'Tous' : f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un patient..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Chargement des données...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Aucun rendez-vous trouvé.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-gray-100 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Patient</th>
                  <th className="px-6 py-4 font-semibold">Date & Heure</th>
                  <th className="px-6 py-4 font-semibold">Docteur</th>
                  <th className="px-6 py-4 font-semibold">Motif</th>
                  <th className="px-6 py-4 font-semibold">Statut</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{app.patientName}</div>
                      <div className="text-xs text-slate-500">{app.patientPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900">{app.date}</div>
                      <div className="text-xs text-slate-500">Créé le: {new Date(app.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {MOCK_DOCTORS.find(d => d.id === app.doctorId)?.name || 'Non spécifié'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" title={app.reason}>
                      {app.reason}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${app.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          app.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-orange-100 text-orange-800'}`}>
                        {app.status === 'pending' ? 'En attente' : 
                         app.status === 'confirmed' ? 'Confirmé' : 'Annulé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {app.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(app.id, 'confirmed')}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Confirmer"
                          >
                            <CheckCircle2 size={20} />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(app.id, 'cancelled')}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Annuler"
                          >
                            <XCircle size={20} />
                          </button>
                        </>
                      )}
                      {app.status !== 'pending' && (
                        <span className="text-xs text-slate-400 italic">Traité</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};


// --- PUBLIC PAGE COMPONENTS ---

const HomePage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => (
  <div className="flex flex-col">
    {/* Hero Section */}
    <section className="relative bg-emerald-900 text-white py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-40 z-0"></div>
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center mix-blend-overlay" 
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }}
      ></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Votre Santé, <br/>Notre Priorité Absolue
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-emerald-100 font-light">
            Soins médicaux de classe mondiale au cœur de Lomé. Une équipe dévouée à votre bien-être.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => onNavigate('appointment')}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Calendar size={20} />
              Prendre Rendez-vous
            </button>
            <button 
              onClick={() => onNavigate('services')}
              className="px-8 py-4 bg-transparent border-2 border-white hover:bg-white hover:text-emerald-900 text-white rounded-lg font-semibold transition-all"
            >
              Nos Services
            </button>
          </div>
        </div>
      </div>
    </section>

    {/* Features Grid */}
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Clock size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-800">Urgences 24/7</h3>
            <p className="text-slate-600">
              Notre service d'urgence est ouvert tous les jours. Une équipe réactive prête à intervenir à tout moment.
            </p>
          </div>
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-800">Experts Qualifiés</h3>
            <p className="text-slate-600">
              Des médecins spécialistes formés dans les meilleures institutions, apportant leur expertise au Togo.
            </p>
          </div>
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <FlaskConical size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-800">Technologie Moderne</h3>
            <p className="text-slate-600">
              Équipements de diagnostic de pointe pour des résultats précis et rapides.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* CTA Banner */}
    <section className="bg-emerald-50 py-16">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Besoin d'une consultation ?</h2>
          <p className="text-slate-600 text-lg">Réservez votre créneau en ligne dès maintenant.</p>
        </div>
        <button 
          onClick={() => onNavigate('appointment')}
          className="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-lg transition-colors flex items-center gap-2"
        >
          Réserver maintenant <ArrowRight size={20} />
        </button>
      </div>
    </section>
  </div>
);

const ServicesPage: React.FC = () => (
  <div className="py-12 bg-slate-50 min-h-full">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center text-slate-900 mb-4">Nos Services Médicaux</h2>
      <p className="text-center text-slate-600 max-w-2xl mx-auto mb-12">
        Nous offrons une gamme complète de soins pour toute la famille, de la pédiatrie à la gériatrie.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_SERVICES.map((service) => (
          <div key={service.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className="p-8">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                {IconMap[service.icon]}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {service.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const DoctorsPage: React.FC = () => (
  <div className="py-12 bg-white min-h-full">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Notre Équipe Médicale</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_DOCTORS.map((doctor) => (
          <div key={doctor.id} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shadow-sm">
            <img 
              src={doctor.image} 
              alt={doctor.name} 
              className="w-full h-64 object-cover object-top"
            />
            <div className="p-6">
              <div className="text-emerald-600 font-semibold text-sm mb-1 uppercase tracking-wide">{doctor.specialty}</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">{doctor.name}</h3>
              <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                {doctor.bio}
              </p>
              <div className="pt-4 border-t border-slate-200">
                <span className="text-xs font-semibold text-slate-500 block mb-2">DISPONIBILITÉ</span>
                <div className="flex flex-wrap gap-2">
                  {doctor.availability.map((day, idx) => (
                    <span key={idx} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700">
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AppointmentPage: React.FC<{ currentUser: UserType | null, onNavigate: (page: string) => void }> = ({ currentUser, onNavigate }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    doctorId: '',
    date: '',
    reason: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        patientName: currentUser.name,
        patientEmail: currentUser.email,
        patientPhone: currentUser.phone
      }));
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await createAppointment({
        ...formData,
        userId: currentUser?.id
      });
      setStatus('success');
      // Reset only non-user fields if logged in, else reset all
      if (currentUser) {
        setFormData(prev => ({ ...prev, doctorId: '', date: '', reason: '' }));
      } else {
        setFormData({ patientName: '', patientEmail: '', patientPhone: '', doctorId: '', date: '', reason: '' });
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (status === 'success') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Demande Envoyée !</h2>
          <p className="text-slate-600 mb-6">
            Votre demande de rendez-vous a bien été enregistrée. 
            Notre secrétariat vous contactera sous peu pour confirmer l'heure exacte.
          </p>
          <button 
            onClick={() => setStatus('idle')}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Nouveau Rendez-vous
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-slate-50 min-h-full">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Prendre Rendez-vous</h2>
            {!currentUser && (
              <button 
                onClick={() => onNavigate('login')}
                className="text-sm text-emerald-600 hover:underline"
              >
                Déjà patient ? Se connecter
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom Complet</label>
                <input
                  required
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ex: Koffi Mensah"
                  disabled={!!currentUser} // Lock if logged in
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                <input
                  required
                  type="tel"
                  name="patientPhone"
                  value={formData.patientPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="+228 XX XX XX XX"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  required
                  type="email"
                  name="patientEmail"
                  value={formData.patientEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="email@exemple.com"
                  disabled={!!currentUser} // Lock if logged in
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date Souhaitée</label>
                <input
                  required
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Médecin (Optionnel)</label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">-- Aucun médecin spécifique --</option>
                {MOCK_DOCTORS.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialty}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Motif de consultation</label>
              <textarea
                required
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                placeholder="Décrivez brièvement vos symptômes..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {status === 'submitting' ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Traitement...
                </>
              ) : 'Confirmer le Rendez-vous'}
            </button>
            <p className="text-xs text-center text-slate-500 mt-4">
              En confirmant, vous acceptez que vos données soient traitées par la clinique.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

const ContactPage: React.FC = () => (
  <div className="py-12 bg-white min-h-full">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold text-slate-900 mb-8">Nous Contacter</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
        <div className="bg-emerald-50 p-8 rounded-2xl">
          <h3 className="text-xl font-bold mb-4 text-emerald-800">Coordonnées</h3>
          <p className="mb-2"><strong>Adresse:</strong> 145 Blvd du 13 Janvier, Lomé</p>
          <p className="mb-2"><strong>Téléphone:</strong> +228 22 21 00 00</p>
          <p className="mb-2"><strong>Email:</strong> contact@clinique-espoir-lome.tg</p>
        </div>
        <div className="bg-slate-50 p-8 rounded-2xl">
          <h3 className="text-xl font-bold mb-4 text-slate-800">Heures d'Ouverture</h3>
          <p className="mb-2"><strong>Urgences:</strong> 24h/24, 7j/7</p>
          <p className="mb-2"><strong>Consultations:</strong> Lun - Ven: 08:00 - 18:00</p>
          <p className="mb-2"><strong>Samedi:</strong> 08:00 - 13:00</p>
        </div>
      </div>
      <div className="mt-12 bg-gray-200 h-64 rounded-xl flex items-center justify-center">
         <p className="text-gray-500">Intégration Google Maps ici</p>
      </div>
    </div>
  </div>
);

export default App;
