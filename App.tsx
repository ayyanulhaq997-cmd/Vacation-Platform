
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Menu, X, Search, User as UserIcon, LogOut, LayoutDashboard, Heart, 
  MessageCircle, Moon, Sun, Filter, Star, MapPin, 
  ChevronRight, Calendar, CreditCard, PieChart, Plus, Settings as SettingsIcon, CheckCircle,
  Phone, Video, MoreVertical, Trash2, Edit, Home, Users, BarChart3, Lock,
  Upload, CheckSquare, Clock, Paperclip, Send, Globe, DollarSign,
  Share, Wifi, Waves, Wind, Tv, Utensils, Car, ShieldAlert, ShieldCheck, AlertCircle, Eye,
  Paperclip as AttachmentIcon, Smile, ChevronLeft, ChevronRight as ChevronRightIcon,
  Activity, TrendingUp, CreditCard as CardIcon, Zap, Wallet, Info, FileText, Image as ImageIcon,
  Coffee, Bath, Laptop, Snowflake
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserRole, User as UserType, Property, SiteConfig, Booking, ChatThread, ChatMessage, VerificationRequest 
} from './types';
import { 
  INITIAL_SITE_CONFIG, MOCK_USERS, MOCK_PROPERTIES, CATEGORIES 
} from './constants';
import { getPropertyAiAdvice, generateSmartDescription } from './services/geminiService';

// --- Context ---
interface AppContextType {
  user: UserType | null;
  setUser: (u: UserType | null) => void;
  siteConfig: SiteConfig;
  setSiteConfig: (c: SiteConfig) => void;
  isDark: boolean;
  toggleTheme: () => void;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  allUsers: UserType[];
  setAllUsers: React.Dispatch<React.SetStateAction<UserType[]>>;
  verifications: VerificationRequest[];
  addVerification: (v: VerificationRequest) => void;
  updateVerification: (id: string, status: 'approved' | 'rejected') => void;
  chatThreads: ChatThread[];
  setChatThreads: React.Dispatch<React.SetStateAction<ChatThread[]>>;
  chatMessages: ChatMessage[];
  sendChatMessage: (threadId: string, text: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// --- Global Components ---

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl glass-card p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden bg-white dark:bg-slate-900 border-none">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={24} /></button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const Lightbox = ({ images, initialIndex, isOpen, onClose }: { images: string[], initialIndex: number, isOpen: boolean, onClose: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-black/95 flex flex-col items-center justify-center p-4 lg:p-20"
    >
      <button onClick={onClose} className="absolute top-8 right-8 text-white p-4 hover:bg-white/10 rounded-full transition-all z-[310]">
        <X size={32} />
      </button>

      <div className="relative w-full max-w-6xl h-full flex items-center justify-center">
        <button 
          onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
          className="absolute left-0 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all z-[310]"
        >
          <ChevronLeft size={32} />
        </button>

        <motion.img 
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          src={images[currentIndex]} 
          className="max-h-[80vh] w-auto rounded-3xl shadow-2xl object-contain" 
        />

        <button 
          onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
          className="absolute right-0 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all z-[310]"
        >
          <ChevronRightIcon size={32} />
        </button>
      </div>
    </motion.div>
  );
};

const Navbar = () => {
  const { user, setUser, isDark, toggleTheme, siteConfig } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isPanel = location.pathname.startsWith('/admin') || location.pathname.startsWith('/host');

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-slate-100 dark:border-slate-800 px-6 py-3">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-pink-500 p-1.5 rounded-lg">
              <Home className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-indigo-950 dark:text-white">
              {siteConfig.siteName}
              {isPanel && <span className="ml-2 text-xs font-normal text-slate-400 capitalize">{user?.role.toLowerCase()} Panel</span>}
            </span>
          </Link>
          {!isPanel && (
            <div className="hidden lg:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium hover:text-pink-500 transition-colors font-bold">Inicio</Link>
              <Link to="/chat" className="text-sm font-medium hover:text-pink-500 transition-colors font-bold">Mensajes</Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-6">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-sm font-semibold">{user.name}</span>
                <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-slate-200 object-cover" alt="avatar" />
              </div>
              <div className="group relative">
                <button className="p-1"><ChevronRight size={16} className="rotate-90" /></button>
                <div className="absolute right-0 top-full mt-2 w-56 glass-card border rounded-2xl overflow-hidden shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link to="/settings" className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
                    <UserIcon size={16} /> Mi Panel
                  </Link>
                  {user.role === UserRole.SUPERADMIN && (
                    <Link to="/admin" className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
                      <LayoutDashboard size={16} /> Master Panel
                    </Link>
                  )}
                  {user.role === UserRole.HOST && (
                    <Link to="/host" className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
                      <LayoutDashboard size={16} /> Host Panel
                    </Link>
                  )}
                  <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2" />
                  <button onClick={() => { setUser(null); navigate('/'); }} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium text-red-600">
                    <LogOut size={16} /> Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
               <Link to="/login" className="text-sm font-bold px-4 py-2 hover:text-pink-500 transition-colors">Entrar</Link>
               <Link to="/register" className="px-6 py-2.5 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg">Registrarse</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// --- Sidebar ---

const AdminSidebar = () => {
  const { user, setUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === UserRole.SUPERADMIN;
  const prefix = isAdmin ? '/admin' : '/host';

  const menuItems = [
    { icon: <BarChart3 size={20} />, label: 'Resumen', path: prefix },
    { icon: <Home size={20} />, label: 'Propiedades', path: `${prefix}/properties` },
    { icon: <Calendar size={20} />, label: 'Reservas', path: `${prefix}/bookings` },
    { icon: <ShieldCheck size={20} />, label: 'Verificaciones', path: `${prefix}/verifications` },
    { icon: <MessageCircle size={20} />, label: 'Mensajes', path: `${prefix}/chat` },
    { icon: <SettingsIcon size={20} />, label: 'Ajustes Sitio', path: `/admin/config`, adminOnly: true },
  ];

  return (
    <aside className="w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col p-8 bg-white dark:bg-slate-900 shrink-0 h-screen sticky top-0 overflow-y-auto custom-scrollbar">
      <div className="mb-12 flex items-center gap-3">
        <div className="bg-pink-500 p-2 rounded-xl text-white shadow-lg"><Home size={24} /></div>
        <span className="text-2xl font-black">StayHub</span>
      </div>
      <nav className="flex-1 space-y-2">
        {menuItems.filter(i => !i.adminOnly || isAdmin).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${isActive ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-pink-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
              {item.icon}{item.label}
            </Link>
          );
        })}
      </nav>
      <button onClick={() => { setUser(null); navigate('/'); }} className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all mt-8"><LogOut size={20} />Cerrar Sesión</button>
    </aside>
  );
};

// --- Views ---

const DashboardHome = () => {
  const { user, properties, bookings } = useApp();
  const isAdmin = user?.role === UserRole.SUPERADMIN;
  const totalRevenue = bookings.reduce((acc, b) => acc + b.totalPrice, 0);
  const activeBookings = bookings.filter(b => b.status === 'paid' || b.status === 'approved').length;

  return (
    <div className="flex-1 p-12 bg-slate-50/50 dark:bg-slate-950/50 overflow-y-auto">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">{isAdmin ? 'Master Admin Panel' : 'Host Manager Panel'}</h1>
          <p className="text-slate-500 font-bold">Bienvenido de nuevo, {user?.name}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="glass-card p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-xl">
           <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Ingresos</p>
           <p className="text-4xl font-black">€{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="glass-card p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-xl">
           <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">Propiedades</p>
           <p className="text-4xl font-black">{properties.length}</p>
        </div>
        <div className="glass-card p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-xl">
           <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">Reservas</p>
           <p className="text-4xl font-black">{activeBookings}</p>
        </div>
        <div className="glass-card p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-xl">
           <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">Ocupación</p>
           <p className="text-4xl font-black">84%</p>
        </div>
      </div>
    </div>
  );
};

const AdminVerificationsView = () => {
  const { verifications, updateVerification, allUsers, user } = useApp();
  const isAdmin = user?.role === UserRole.SUPERADMIN;
  const filtered = verifications.filter(v => isAdmin || v.hostId === user?.id);

  return (
    <div className="flex-1 p-12 overflow-y-auto">
      <h1 className="text-4xl font-black mb-12">Verificaciones</h1>
      <div className="space-y-6">
        {filtered.map(v => {
          const applicant = allUsers.find(u => u.id === v.userId);
          return (
            <div key={v.id} className="glass-card p-8 rounded-[3rem] shadow-xl border-none flex items-center gap-8">
              <img src={applicant?.avatar} className="w-16 h-16 rounded-2xl object-cover shadow-lg" alt="" />
              <div className="flex-1">
                <h3 className="font-black text-xl">{applicant?.name}</h3>
                <a href={v.documentUrl} download={`id_${v.userId}.png`} className="text-indigo-600 font-bold text-xs flex items-center gap-1 mt-1"><FileText size={14}/> Descargar Documento ID</a>
              </div>
              {v.status === 'pending' ? (
                <div className="flex gap-2">
                  <button onClick={() => updateVerification(v.id, 'rejected')} className="px-6 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-black text-xs">Rechazar</button>
                  <button onClick={() => updateVerification(v.id, 'approved')} className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-black text-xs">Aprobar</button>
                </div>
              ) : (
                <span className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${v.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {v.status}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AdminPropertiesView = () => {
  const { properties, setProperties, user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = user?.role === UserRole.SUPERADMIN;

  const [formData, setFormData] = useState({
    title: '', location: '', pricePerNight: '', category: 'Villa', maxGuests: '4', description: '', images: [] as string[]
  });

  const filtered = properties.filter(p => (isAdmin || p.hostId === user?.id) && (p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.location.toLowerCase().includes(searchTerm.toLowerCase())));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => setFormData(prev => ({ ...prev, images: [...prev.images, reader.result as string] }));
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setProperties(prev => prev.map(p => p.id === editingId ? { ...p, ...formData, pricePerNight: Number(formData.pricePerNight), maxGuests: Number(formData.maxGuests) } : p));
    } else {
      setProperties(prev => [{ ...formData, id: 'p'+Math.random(), hostId: user!.id, rating: 4.5, reviewsCount: 0, amenities: ['WiFi', 'Cocina'], status: 'available', taxRate: 0.1, pricePerNight: Number(formData.pricePerNight), maxGuests: Number(formData.maxGuests) } as any, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 p-12 overflow-y-auto">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black">Propiedades</h1>
        <button onClick={() => { setEditingId(null); setFormData({ title: '', location: '', pricePerNight: '', category: 'Villa', maxGuests: '4', description: '', images: [] }); setIsModalOpen(true); }} className="bg-pink-500 text-white px-8 py-4 rounded-2xl font-black shadow-xl">Nueva Propiedad</button>
      </div>
      <div className="mb-8 relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} type="text" placeholder="Buscar..." className="w-full py-6 pl-16 pr-8 rounded-[2rem] glass-card outline-none font-bold text-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(p => (
          <div key={p.id} className="glass-card rounded-[3rem] overflow-hidden shadow-2xl flex flex-col group border-none">
            <div className="relative h-48">
               <img src={p.images[0]} className="w-full h-full object-cover" alt="" />
               <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => { setEditingId(p.id); setFormData({ ...p, pricePerNight: p.pricePerNight.toString(), maxGuests: p.maxGuests.toString() }); setIsModalOpen(true); }} className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md text-white"><Edit size={18}/></button>
                  <button onClick={() => setProperties(prev => prev.filter(x => x.id !== p.id))} className="p-2.5 rounded-xl bg-red-500/80 backdrop-blur-md text-white"><Trash2 size={18}/></button>
               </div>
            </div>
            <div className="p-8">
              <h3 className="text-xl font-black">{p.title}</h3>
              <p className="text-slate-500 font-bold text-xs mb-4">{p.location}</p>
              <p className="text-2xl font-black">€{p.pricePerNight}</p>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar' : 'Crear'}>
        <form onSubmit={handleSave} className="space-y-6">
           <input required type="text" placeholder="Nombre" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-none font-bold" />
           <input required type="text" placeholder="Ubicación" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-none font-bold" />
           <div className="grid grid-cols-2 gap-4">
              <input required type="number" placeholder="Precio" value={formData.pricePerNight} onChange={e => setFormData({...formData, pricePerNight: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-none font-bold" />
              <input required type="number" placeholder="Huéspedes" value={formData.maxGuests} onChange={e => setFormData({...formData, maxGuests: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-none font-bold" />
           </div>
           <textarea placeholder="Descripción" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-none font-medium min-h-[100px]" />
           <div className="flex items-center gap-4">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-black text-xs"><Upload size={16}/> Subir Fotos</button>
              <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
              <p className="text-xs font-bold text-slate-400">{formData.images.length} fotos seleccionadas</p>
           </div>
           <button type="submit" className="w-full py-5 rounded-[2rem] bg-indigo-600 text-white font-black text-xl shadow-xl">Guardar</button>
        </form>
      </Modal>
    </div>
  );
};

// --- Landing & Details ---

const LandingPage = () => {
  const { properties, setProperties } = useApp();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchText, setSearchText] = useState('');

  const filtered = properties.filter(p => 
    (activeCategory === 'Todos' || p.category === activeCategory) &&
    (p.title.toLowerCase().includes(searchText.toLowerCase()) || p.location.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <div className="pb-20">
      <div className="relative h-[650px] flex items-center justify-center text-white overflow-hidden">
        <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000" className="absolute inset-0 w-full h-full object-cover brightness-[0.45]" alt="" />
        <div className="relative z-10 text-center max-w-4xl px-6">
          <h1 className="text-7xl font-black mb-8 leading-[1.1] tracking-tighter">Experimenta lo extraordinario</h1>
          <div className="flex items-center gap-4 bg-white/15 backdrop-blur-2xl p-5 rounded-[3rem] border border-white/20 shadow-2xl max-w-2xl mx-auto">
             <div className="flex-1 flex items-center gap-4 px-6">
                <Search className="text-slate-300" />
                <input type="text" value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="¿A dónde quieres ir?" className="bg-transparent border-none outline-none w-full text-white font-bold placeholder:text-slate-400 text-lg" />
             </div>
             <button className="bg-pink-500 px-12 py-5 rounded-[2rem] font-black text-lg">Buscar</button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-12 mt-16">
        <div className="flex items-center gap-4 overflow-x-auto pb-6 mb-16">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)} className={`px-10 py-4 rounded-[2rem] font-black text-sm uppercase transition-all whitespace-nowrap border-2 ${activeCategory === c ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {filtered.map(p => (
            <Link key={p.id} to={`/property/${p.id}`} className="group">
              <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden mb-6 shadow-2xl">
                <img src={p.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setProperties(prev => prev.map(x => x.id === p.id ? {...x, isWatchlisted: !x.isWatchlisted} : x)); }} className="absolute top-6 right-6 p-3.5 bg-white/25 backdrop-blur-xl rounded-full text-white hover:bg-pink-500 transition-all shadow-lg">
                  <Heart size={22} className={p.isWatchlisted ? 'fill-pink-500 text-pink-500' : ''} />
                </button>
              </div>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-xl">{p.title}</h3>
                  <div className="flex items-center gap-1 font-black text-yellow-500 px-2 py-1 rounded-xl bg-yellow-400/10 text-xs">
                    <Star size={14} fill="currentColor" /> {p.rating}
                  </div>
                </div>
                <p className="text-slate-500 font-bold text-sm mb-4"><MapPin size={16} className="inline mr-1" /> {p.location}</p>
                <p className="text-2xl font-black">€{p.pricePerNight} <span className="text-slate-400 font-bold text-sm">/ noche</span></p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

const PropertyDetailPage = () => {
  const { id } = useParams();
  const { properties, user, verifications, addVerification, setBookings } = useApp();
  const navigate = useNavigate();
  const [advice, setAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docBase64, setDocBase64] = useState<string | null>(null);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestsCount, setGuestsCount] = useState(1);

  const property = properties.find(p => p.id === id);

  const hostVerification = user ? verifications.find(v => v.userId === user.id && v.hostId === property?.hostId) : null;
  const isVerifiedForThisHost = hostVerification?.status === 'approved';
  const hasPendingVerification = hostVerification?.status === 'pending';

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut || !property) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights * property.pricePerNight : 0;
  };

  const handleBooking = () => {
    if (!user) return navigate('/login');
    const total = calculateTotalPrice();
    if (total <= 0) return alert('Selecciona fechas válidas.');
    
    setBookings(prev => [...prev, { id: 'b-'+Math.random(), propertyId: property!.id, guestId: user.id, checkIn, checkOut, totalPrice: total, taxAmount: total*0.1, commissionAmount: total*0.05, status: 'pending', guestsCount }]);
    alert('¡Reserva solicitada!');
    navigate('/settings');
  };

  const handleGetAdvice = async () => {
    if (!property) return;
    setLoadingAdvice(true);
    try {
      const result = await getPropertyAiAdvice(property.title, "Interesado en una escapada tranquila.");
      setAdvice(result || "Parece un lugar fantástico para ti.");
    } catch (e) {
      setAdvice("No pude conectar con el asistente ahora.");
    } finally {
      setLoadingAdvice(false);
    }
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setDocBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docBase64) return alert('Sube el documento por favor.');
    addVerification({ id: 'v'+Math.random(), userId: user!.id, hostId: property!.hostId, status: 'pending', documentUrl: docBase64, submittedAt: new Date().toLocaleDateString() });
    setIsVerificationModalOpen(false);
    setDocBase64(null);
  };

  if (!property) return <div className="p-40 text-center font-black text-5xl opacity-10">404</div>;

  return (
    <div className="max-w-[1440px] mx-auto px-12 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-8">
           <img src={property.images[0]} onClick={() => setIsLightboxOpen(true)} className="w-full aspect-[4/3] rounded-[3.5rem] object-cover shadow-2xl cursor-pointer" alt="" />
           <div className="grid grid-cols-4 gap-4">
             {property.images.slice(1).map((img, i) => (
               <img key={i} src={img} onClick={() => { setLightboxIndex(i+1); setIsLightboxOpen(true); }} className="w-full aspect-square rounded-3xl object-cover cursor-pointer hover:opacity-80 transition-opacity" alt="" />
             ))}
           </div>
           <Lightbox images={property.images} initialIndex={lightboxIndex} isOpen={isLightboxOpen} onClose={() => setIsLightboxOpen(false)} />
        </div>

        <div className="space-y-12">
          <div>
            <h1 className="text-6xl font-black mb-6 tracking-tight">{property.title}</h1>
            <p className="text-xl text-slate-500 font-bold mb-8">{property.location}</p>
            <div className="flex flex-wrap gap-4">
               {['Piscina', 'WiFi', 'Aire Acondicionado', 'Cocina', 'Estacionamiento'].map(a => (
                 <span key={a} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-black uppercase">
                   {a === 'Piscina' && <Waves size={16}/>}
                   {a === 'WiFi' && <Wifi size={16}/>}
                   {a === 'Aire Acondicionado' && <Snowflake size={16}/>}
                   {a === 'Cocina' && <Utensils size={16}/>}
                   {a === 'Estacionamiento' && <Car size={16}/>}
                   {a}
                 </span>
               ))}
            </div>
          </div>

          <div className="glass-card p-12 rounded-[4rem] shadow-2xl bg-white dark:bg-slate-900 flex flex-col gap-8">
            <div className="flex justify-between items-end">
               <div>
                  <p className="text-4xl font-black">€{property.pricePerNight}</p>
                  <p className="text-xs font-black uppercase text-slate-400">por noche</p>
               </div>
               <div className="text-right">
                  <p className="text-2xl font-black text-indigo-600">Total: €{calculateTotalPrice()}</p>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-none font-bold" />
               <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-none font-bold" />
               <select value={guestsCount} onChange={e => setGuestsCount(Number(e.target.value))} className="col-span-2 w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-none font-bold appearance-none">
                 {[...Array(property.maxGuests)].map((_, i) => <option key={i+1} value={i+1}>{i+1} Huéspedes</option>)}
               </select>
            </div>
            {isVerifiedForThisHost ? (
              <button onClick={handleBooking} className="w-full py-6 rounded-[2.5rem] bg-pink-500 text-white font-black text-2xl shadow-xl hover:bg-pink-600 active:scale-95 transition-all">Reservar ahora</button>
            ) : (
              <button onClick={() => user ? setIsVerificationModalOpen(true) : navigate('/login')} disabled={hasPendingVerification} className="w-full py-6 rounded-[2.5rem] bg-indigo-600 text-white font-black text-xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50">
                {hasPendingVerification ? 'Verificación Pendiente' : 'Verifica tu identidad para reservar'}
              </button>
            )}
          </div>

          <div className="space-y-6">
            <h3 className="text-3xl font-black">Información detallada</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xl leading-relaxed">{property.description}</p>
          </div>

          <div className="glass-card p-10 rounded-[3.5rem] bg-indigo-600 text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black flex items-center gap-3"><Zap size={28} /> Consejos de IA</h3>
                  <button onClick={handleGetAdvice} disabled={loadingAdvice} className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-xs hover:bg-slate-100 transition-colors disabled:animate-pulse">
                    {loadingAdvice ? 'Analizando...' : 'Consultar'}
                  </button>
               </div>
               {advice && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="italic font-medium text-lg leading-relaxed">"{advice}"</motion.p>}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isVerificationModalOpen} onClose={() => setIsVerificationModalOpen(false)} title="Verificación">
        <form onSubmit={handleSubmitVerification} className="space-y-8 p-4">
           <div onClick={() => fileInputRef.current?.click()} className={`border-4 border-dashed rounded-[2.5rem] p-12 text-center cursor-pointer transition-all ${docBase64 ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-slate-100 dark:border-slate-800'}`}>
              {docBase64 ? <CheckCircle size={48} className="mx-auto text-green-500" /> : <Upload size={48} className="mx-auto text-slate-300" />}
              <p className="font-black text-lg mt-4">{docBase64 ? 'Listo para enviar' : 'Sube tu ID / Pasaporte'}</p>
           </div>
           <input ref={fileInputRef} type="file" accept="image/*" onChange={handleDocUpload} className="hidden" />
           <button type="submit" className="w-full py-5 rounded-[2rem] bg-indigo-600 text-white font-black text-xl">Enviar Documento</button>
        </form>
      </Modal>
    </div>
  );
};

// --- Auth ---

const AuthPage = ({ mode }: { mode: 'login' | 'register' }) => {
  const { setUser, allUsers, setAllUsers } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      const found = allUsers.find(u => u.email === email && (u.password === password || password === 'demo'));
      if (found) { setUser(found); navigate(found.role === UserRole.SUPERADMIN ? '/admin' : found.role === UserRole.HOST ? '/host' : '/'); }
      else setError('Credenciales inválidas.');
    } else {
      const newUser = { id: 'u-'+Math.random(), name, email, password, role: UserRole.GUEST, isOnline: true, idVerified: false, avatar: `https://i.pravatar.cc/150?u=${email}` };
      setAllUsers(prev => [...prev, newUser]);
      setUser(newUser);
      navigate('/');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md glass-card p-12 rounded-[4rem] shadow-2xl border-none">
        <h2 className="text-4xl font-black mb-10 text-center">{mode === 'login' ? 'Bienvenido' : 'Regístrate'}</h2>
        {error && <p className="bg-red-50 text-red-500 p-4 rounded-2xl mb-6 text-xs font-bold">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'register' && <input required type="text" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 outline-none font-bold" />}
          <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 outline-none font-bold" />
          <input required type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 outline-none font-bold" />
          <button type="submit" className="w-full py-6 rounded-[2rem] bg-indigo-600 text-white font-black text-xl shadow-xl">{mode === 'login' ? 'Entrar' : 'Registrarse'}</button>
        </form>
        <Link to={mode === 'login' ? '/register' : '/login'} className="block mt-8 text-center text-sm font-bold text-pink-500 hover:underline">{mode === 'login' ? 'Crea una cuenta' : 'Inicia sesión'}</Link>
      </motion.div>
    </div>
  );
};

// --- User Panel ---

const SettingsPage = () => {
  const { user, setUser, bookings, properties, setAllUsers } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  const userBookings = bookings.filter(b => b.guestId === user?.id);
  const userFavs = properties.filter(p => p.isWatchlisted);

  const handleAvatarUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatar = reader.result as string;
        const updatedUser = { ...user, avatar: newAvatar };
        setUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-12 py-24">
      <h1 className="text-6xl font-black mb-16 tracking-tight">Mi Panel</h1>
      
      <div className="flex gap-4 mb-12 overflow-x-auto pb-4">
        {['profile', 'bookings', 'favorites'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-10 py-4 rounded-[2rem] font-black text-xs uppercase transition-all whitespace-nowrap border-2 ${activeTab === t ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'}`}>
            {t === 'profile' ? 'Mi Perfil' : t === 'bookings' ? 'Mis Reservas' : 'Favoritos'}
          </button>
        ))}
      </div>

      <div className="space-y-10">
        {activeTab === 'profile' && (
          <section className="glass-card p-12 rounded-[4rem] shadow-2xl bg-white dark:bg-slate-900">
            <h2 className="text-2xl font-black mb-10 flex items-center gap-4"><UserIcon className="text-pink-500" size={28}/> Información Personal</h2>
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="relative group">
                 <img src={user?.avatar} className="w-40 h-40 rounded-[3rem] object-cover shadow-2xl border-4 border-white dark:border-slate-800" alt="" />
                 <label className="absolute bottom-2 right-2 bg-indigo-600 text-white p-3 rounded-2xl shadow-xl cursor-pointer hover:bg-indigo-700 transition-colors">
                    <Upload size={20}/>
                    <input type="file" accept="image/*" onChange={handleAvatarUpdate} className="hidden" />
                 </label>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nombre</label>
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold">{user?.name}</div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email</label>
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold">{user?.email}</div>
                 </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {userBookings.map(b => {
              const p = properties.find(x => x.id === b.propertyId);
              return (
                <div key={b.id} className="glass-card p-8 rounded-[3rem] shadow-xl bg-white dark:bg-slate-900 flex items-center gap-8">
                  <img src={p?.images[0]} className="w-24 h-24 rounded-3xl object-cover" alt="" />
                  <div className="flex-1">
                    <h4 className="font-black text-xl">{p?.title}</h4>
                    <p className="text-slate-400 font-bold text-xs">{b.checkIn} — {b.checkOut}</p>
                    <span className="mt-2 inline-block px-4 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 text-[10px] font-black uppercase">{b.status}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black">€{b.totalPrice}</p>
                  </div>
                </div>
              );
            })}
            {userBookings.length === 0 && <p className="text-center py-20 font-bold text-slate-400">Aún no tienes reservas.</p>}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {userFavs.map(p => (
              <Link key={p.id} to={`/property/${p.id}`} className="glass-card p-4 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-xl block">
                 <img src={p.images[0]} className="w-full h-40 rounded-3xl object-cover mb-4" alt="" />
                 <h4 className="font-black text-lg">{p.title}</h4>
                 <p className="text-slate-400 font-bold text-xs">{p.location}</p>
              </Link>
            ))}
            {userFavs.length === 0 && <p className="col-span-full text-center py-20 font-bold text-slate-400">Tu lista de favoritos está vacía.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Chat ---

const ChatPage = () => {
  const { user, chatThreads, chatMessages, sendChatMessage, allUsers } = useApp();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  
  const visibleThreads = chatThreads.filter(t => {
      if (user?.role === UserRole.SUPERADMIN) return true;
      if (user?.role === UserRole.HOST) return t.participantId.includes('host') || t.participantId === 'u-guest';
      // Guests can only see messages from hosts (not admins)
      return t.participantId !== 'u-admin';
  });

  const activeThread = chatThreads.find(t => t.id === activeThreadId);
  const activeMessages = chatMessages.filter(m => activeThreadId ? true : false);

  const handleSend = () => {
    if (!messageText.trim() || !activeThreadId) return;
    sendChatMessage(activeThreadId, messageText);
    setMessageText('');
  };

  return (
    <div className="flex-1 flex h-[calc(100vh-80px)] overflow-hidden bg-white dark:bg-slate-900">
      <div className="w-96 border-r dark:border-slate-800 flex flex-col h-full">
        <div className="p-8"><h2 className="text-3xl font-black">Mensajes</h2></div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {visibleThreads.map(t => {
            const p = allUsers.find(u => u.id === t.participantId);
            return (
              <button key={t.id} onClick={() => setActiveThreadId(t.id)} className={`w-full flex items-center gap-4 p-5 rounded-[2rem] ${activeThreadId === t.id ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'}`}>
                <img src={p?.avatar || `https://i.pravatar.cc/150?u=${t.id}`} className="w-12 h-12 rounded-2xl object-cover shadow-md" alt="" />
                <div className="text-left"><p className="font-black">{p?.name || 'Usuario'}</p><p className="text-xs truncate opacity-70">{t.lastMessage}</p></div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-950/50">
        {activeThreadId ? (
          <>
            <div className="p-6 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center gap-4">
               <img src={allUsers.find(u => u.id === activeThread?.participantId)?.avatar} className="w-10 h-10 rounded-xl object-cover shadow-lg" alt="" />
               <h3 className="font-black text-lg">{allUsers.find(u => u.id === activeThread?.participantId)?.name}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              {activeMessages.map(m => (
                <div key={m.id} className={`flex ${m.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-5 rounded-[2rem] max-w-[70%] shadow-sm ${m.senderId === user?.id ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 rounded-bl-none'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 bg-white dark:bg-slate-900 border-t dark:border-slate-800 flex gap-4">
              <input value={messageText} onChange={e => setMessageText(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Escribe un mensaje..." className="flex-1 p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-800 outline-none font-bold" />
              <button onClick={handleSend} className="bg-indigo-600 text-white p-5 rounded-full shadow-xl hover:bg-indigo-700"><Send size={24}/></button>
            </div>
          </>
        ) : <div className="flex-1 flex items-center justify-center font-bold text-slate-400">Selecciona un chat para empezar</div>}
      </div>
    </div>
  );
};

// --- App Root ---

const AppProvider = ({ children }: { children?: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(INITIAL_SITE_CONFIG);
  const [isDark, setIsDark] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [allUsers, setAllUsers] = useState<UserType[]>(MOCK_USERS);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([
    { id: 't1', participantId: 'u-host', lastMessage: '¿Dudas sobre la villa?', timestamp: '10:30 AM', unreadCount: 0 }
  ]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const sendChatMessage = (threadId: string, text: string) => {
      if (!user) return;
      const m = { id: 'm'+Date.now(), senderId: user.id, text, timestamp: new Date().toLocaleTimeString(), type: 'text' as const };
      setChatMessages(prev => [...prev, m]);
      setChatThreads(prev => prev.map(t => t.id === threadId ? { ...t, lastMessage: text } : t));
  };

  return (
    <AppContext.Provider value={{ 
      user, setUser, siteConfig, setSiteConfig, isDark, toggleTheme: () => setIsDark(!isDark),
      bookings, setBookings, properties, setProperties, allUsers, setAllUsers,
      verifications, addVerification: (v) => setVerifications(prev => [...prev, v]),
      updateVerification: (id, status) => setVerifications(prev => prev.map(v => v.id === id ? { ...v, status } : v)),
      chatThreads, setChatThreads, chatMessages, sendChatMessage
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/admin/*" element={<div className="flex min-h-screen bg-slate-50 dark:bg-slate-950"><AdminSidebar /><Routes><Route index element={<DashboardHome />} /><Route path="properties" element={<AdminPropertiesView />} /><Route path="verifications" element={<AdminVerificationsView />} /><Route path="chat" element={<ChatPage />} /><Route path="config" element={<SettingsPage />} /></Routes></div>} />
          <Route path="/host/*" element={<div className="flex min-h-screen bg-slate-50 dark:bg-slate-950"><AdminSidebar /><Routes><Route index element={<DashboardHome />} /><Route path="properties" element={<AdminPropertiesView />} /><Route path="verifications" element={<AdminVerificationsView />} /><Route path="chat" element={<ChatPage />} /></Routes></div>} />
          <Route path="*" element={<div className="min-h-screen dark:bg-slate-950 dark:text-slate-100"><Navbar /><Routes><Route path="/" element={<LandingPage />} /><Route path="/property/:id" element={<PropertyDetailPage />} /><Route path="/settings" element={<SettingsPage />} /><Route path="/login" element={<AuthPage mode="login" />} /><Route path="/register" element={<AuthPage mode="register" />} /><Route path="/chat" element={<ChatPage />} /><Route path="*" element={<Navigate to="/" />} /></Routes></div>} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
