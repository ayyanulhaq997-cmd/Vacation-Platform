
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
  Activity, TrendingUp, CreditCard as CardIcon, Zap, Wallet, Info, FileText, Image as ImageIcon
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

      <div className="mt-8 flex gap-4 overflow-x-auto p-4 custom-scrollbar max-w-full">
        {images.map((img, idx) => (
          <button 
            key={idx} 
            onClick={() => setCurrentIndex(idx)}
            className={`relative flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all ${currentIndex === idx ? 'border-pink-500 scale-110 shadow-lg' : 'border-transparent opacity-50'}`}
          >
            <img src={img} className="w-full h-full object-cover" />
          </button>
        ))}
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
                    <SettingsIcon size={16} /> Configuración
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

// --- Dashboard Sidebar ---

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
    { icon: <Users size={20} />, label: 'Usuarios', path: `/admin/users`, adminOnly: true },
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

// --- Dashboard Home ---

const DashboardHome = () => {
  const { user, properties, bookings } = useApp();
  const isAdmin = user?.role === UserRole.SUPERADMIN;
  
  const totalRevenue = bookings.reduce((acc, b) => acc + b.totalPrice, 0);
  const activeBookings = bookings.filter(b => b.status === 'paid' || b.status === 'approved').length;

  return (
    <div className="flex-1 p-12 bg-slate-50/50 dark:bg-slate-950/50 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">{isAdmin ? 'Master Admin Panel' : 'Host Manager Panel'}</h1>
          <p className="text-slate-500 font-bold">Bienvenido de nuevo, {user?.name}</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white dark:bg-slate-800 p-4 rounded-[1.5rem] shadow-sm flex items-center gap-3">
              <Activity className="text-pink-500" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Sistema Online</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-8 mb-12">
        <div className="glass-card p-8 rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
          <p className="text-indigo-100 font-black text-[10px] uppercase tracking-widest mb-4">Ingresos Totales</p>
          <p className="text-4xl font-black mb-2">€{totalRevenue.toLocaleString()}</p>
          <p className="text-xs font-bold text-indigo-200">+12% vs mes anterior</p>
        </div>
        <div className="glass-card p-8 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900">
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-4">Propiedades {isAdmin ? 'Globales' : 'Propias'}</p>
          <p className="text-4xl font-black mb-2">{properties.length}</p>
          <p className="text-xs font-bold text-green-500 flex items-center gap-1"><CheckCircle size={12}/> 100% Activas</p>
        </div>
        <div className="glass-card p-8 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900">
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-4">Reservas Confirmadas</p>
          <p className="text-4xl font-black mb-2">{activeBookings}</p>
          <p className="text-xs font-bold text-slate-500">3 pendientes</p>
        </div>
        <div className="glass-card p-8 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900">
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-4">Tasa de Ocupación</p>
          <p className="text-4xl font-black mb-2">84%</p>
          <p className="text-xs font-bold text-pink-500">Alta demanda</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 glass-card p-10 rounded-[3rem] shadow-2xl border-none">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black">Actividad Reciente</h2>
            <Link to={isAdmin ? "/admin/properties" : "/host/properties"} className="text-pink-500 font-bold text-sm hover:underline">Gestionar Propiedades</Link>
          </div>
          <div className="space-y-6">
            {properties.slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center gap-6 p-6 rounded-[2rem] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                <img src={p.images[0]} className="w-24 h-20 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform" alt="" />
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{p.title}</h4>
                  <p className="text-xs text-slate-500 font-bold flex items-center gap-1"><MapPin size={12}/> {p.location}</p>
                </div>
                <div className="text-right">
                   <p className="font-black text-xl">€{p.pricePerNight}</p>
                   <p className="text-[10px] text-green-500 font-black uppercase tracking-tighter">Disponible</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-10 rounded-[3rem] shadow-2xl border-none flex flex-col">
          <h2 className="text-2xl font-black mb-8">Estado de Canal</h2>
          <div className="flex-1 space-y-8">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-500"><TrendingUp size={24} /></div>
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-1">
                    <p className="text-sm font-black">Demanda de Villas</p>
                    <span className="text-[10px] font-bold text-pink-500">ALTA</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full"><div className="bg-pink-500 h-full rounded-full shadow-lg shadow-pink-500/30" style={{width: '75%'}}></div></div>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500"><Globe size={24} /></div>
                <div className="flex-1">
                   <div className="flex justify-between items-end mb-1">
                      <p className="text-sm font-black">Alcance Global</p>
                      <span className="text-[10px] font-bold text-indigo-500">92%</span>
                   </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full"><div className="bg-indigo-500 h-full rounded-full shadow-lg shadow-indigo-500/30" style={{width: '92%'}}></div></div>
                </div>
             </div>
          </div>
          <div className="mt-auto pt-8 border-t dark:border-slate-800">
             <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl flex items-center gap-4">
                <div className="bg-white dark:bg-slate-700 p-2.5 rounded-xl shadow-sm"><Info className="text-indigo-600" size={18}/></div>
                <p className="text-xs font-bold text-slate-500 leading-relaxed">Tu tasa de conversión es 4% superior a la media local.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Verification Queue View ---

const AdminVerificationsView = () => {
  const { verifications, updateVerification, allUsers, user } = useApp();
  const isAdmin = user?.role === UserRole.SUPERADMIN;
  
  // Rule: Admin sees all, Host sees only their isolated requests
  const filtered = verifications.filter(v => isAdmin || v.hostId === user?.id);

  return (
    <div className="flex-1 p-12 overflow-y-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-black mb-2">Cola de Verificaciones</h1>
        <p className="text-slate-400 font-bold">
          {isAdmin ? 'Gestiona todas las solicitudes de identidad del sistema.' : 'Verifica los inquilinos que desean rentar tus propiedades.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filtered.map(v => {
          const applicant = allUsers.find(u => u.id === v.userId);
          return (
            <div key={v.id} className="glass-card p-8 rounded-[3rem] shadow-xl border-none flex items-center gap-8 group">
              <div className="relative">
                <img src={applicant?.avatar} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-lg" alt="" />
                <div className={`absolute -top-2 -right-2 p-1.5 rounded-lg text-white shadow-md ${v.status === 'pending' ? 'bg-orange-500' : v.status === 'approved' ? 'bg-green-500' : 'bg-red-500'}`}>
                  {v.status === 'pending' ? <Clock size={14}/> : v.status === 'approved' ? <CheckCircle size={14}/> : <X size={14}/>}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-black text-xl">{applicant?.name}</h3>
                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">GUEST</span>
                </div>
                <p className="text-slate-500 text-sm font-bold mb-4">{applicant?.email}</p>
                <div className="flex gap-4">
                  <a href={v.documentUrl} target="_blank" className="flex items-center gap-2 text-indigo-600 font-black text-xs hover:underline"><FileText size={16}/> Ver Documento ID</a>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enviado: {v.submittedAt}</span>
                </div>
              </div>

              {v.status === 'pending' && (
                <div className="flex gap-3">
                  <button onClick={() => updateVerification(v.id, 'rejected')} className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 font-black text-sm hover:bg-red-50 transition-all">Rechazar</button>
                  <button onClick={() => updateVerification(v.id, 'approved')} className="px-8 py-3 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-xl hover:bg-indigo-700 transition-all">Aprobar</button>
                </div>
              )}
              {v.status !== 'pending' && (
                <div className="px-8 py-3 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800 text-slate-300 font-black text-sm italic">
                  Solicitud {v.status === 'approved' ? 'Finalizada' : 'Denegada'}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-40 text-center">
            <ShieldCheck size={80} className="mx-auto text-slate-100 dark:text-slate-800 mb-6" />
            <p className="text-slate-400 font-black text-2xl">No hay verificaciones pendientes</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Admin Properties View ---

const AdminPropertiesView = () => {
  const { properties, setProperties, user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === UserRole.SUPERADMIN;

  // New Property Form State
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    pricePerNight: '',
    category: 'Villa',
    maxGuests: '4',
    description: '',
    images: [] as string[]
  });

  const filtered = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.location.toLowerCase().includes(searchTerm.toLowerCase());
    const belongsToUser = isAdmin || p.hostId === user?.id;
    return matchesSearch && belongsToUser;
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("¿Seguro que quieres eliminar esta propiedad? Esta acción no se puede deshacer.")) {
      setProperties(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, reader.result as string]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalImages = formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1000'];

    if (editingId) {
      setProperties(prev => prev.map(p => p.id === editingId ? { 
        ...p, 
        title: formData.title, 
        location: formData.location, 
        pricePerNight: Number(formData.pricePerNight), 
        category: formData.category,
        maxGuests: Number(formData.maxGuests),
        description: formData.description,
        images: finalImages
      } : p));
    } else {
      const newProperty: Property = {
        id: 'p' + Math.random().toString(36).substr(2, 5),
        hostId: user?.id || 'u-host',
        title: formData.title,
        location: formData.location,
        pricePerNight: Number(formData.pricePerNight),
        category: formData.category,
        maxGuests: Number(formData.maxGuests),
        description: formData.description,
        images: finalImages,
        rating: 4.5,
        reviewsCount: 0,
        amenities: ['WiFi', 'Cocina'],
        status: 'available',
        taxRate: 0.1
      };
      setProperties(prev => [newProperty, ...prev]);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ title: '', location: '', pricePerNight: '', category: 'Villa', maxGuests: '4', description: '', images: [] });
  };

  const openEdit = (e: React.MouseEvent, p: Property) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(p.id);
    setFormData({
      title: p.title,
      location: p.location,
      pricePerNight: p.pricePerNight.toString(),
      category: p.category,
      maxGuests: p.maxGuests.toString(),
      description: p.description,
      images: p.images
    });
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 p-12 overflow-y-auto">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black">Gestionar Propiedades</h1>
        <button onClick={() => { setEditingId(null); setFormData({ title: '', location: '', pricePerNight: '', category: 'Villa', maxGuests: '4', description: '', images: [] }); setIsModalOpen(true); }} className="bg-pink-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:bg-pink-600 transition-all transform hover:scale-105 active:scale-95">
          <Plus size={20} /> Nueva Propiedad
        </button>
      </div>

      <div className="mb-8 relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} type="text" placeholder="Buscar por nombre o ubicación..." className="w-full py-6 pl-16 pr-8 rounded-[2rem] glass-card border-none outline-none font-bold text-lg shadow-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(p => (
          <div key={p.id} className="glass-card rounded-[3rem] overflow-hidden shadow-2xl flex flex-col group border-none">
            <div className="relative h-48 overflow-hidden">
               <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
               <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={(e) => openEdit(e, p)} className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors shadow-lg"><Edit size={18}/></button>
                  <button onClick={(e) => handleDelete(e, p.id)} className="p-2.5 rounded-xl bg-red-500/80 backdrop-blur-md text-white hover:bg-red-600 transition-colors shadow-lg"><Trash2 size={18}/></button>
               </div>
               <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest">{p.category}</div>
            </div>
            <div className="p-8 flex-1">
              <h3 className="text-xl font-black mb-1">{p.title}</h3>
              <p className="text-slate-500 font-bold text-xs mb-4 flex items-center gap-1"><MapPin size={12}/> {p.location}</p>
              <div className="flex justify-between items-center mt-auto">
                 <p className="text-2xl font-black">€{p.pricePerNight} <span className="text-xs text-slate-400 font-bold">/noche</span></p>
                 <Link to={`/property/${p.id}`} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-colors"><Eye size={20}/></Link>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 font-bold text-xl">No se encontraron propiedades.</div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Propiedad' : 'Crear Nueva Propiedad'}>
        <form onSubmit={handleSave} className="space-y-8 p-2">
           <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Nombre Comercial</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold shadow-inner" placeholder="Villa Marítima Deluxe" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Ubicación</label>
                <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold shadow-inner" placeholder="Ibiza, España" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Categoría</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold shadow-inner appearance-none">
                  {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Precio por Noche (€)</label>
                <input required type="number" value={formData.pricePerNight} onChange={e => setFormData({...formData, pricePerNight: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold shadow-inner" placeholder="250" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Huéspedes Máximos</label>
                <input required type="number" value={formData.maxGuests} onChange={e => setFormData({...formData, maxGuests: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold shadow-inner" placeholder="4" />
              </div>
              
              <div className="col-span-2">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Imágenes de la Propiedad</label>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img src={img} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all"
                    >
                      <Plus size={24} />
                      <span className="text-[10px] font-black uppercase mt-1">Añadir</span>
                    </button>
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                  {formData.images.length === 0 && (
                    <p className="text-[10px] text-slate-400 italic">Sube al menos una imagen real de tu propiedad.</p>
                  )}
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Descripción Detallada</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-none outline-none font-medium text-sm shadow-inner min-h-[150px]" placeholder="Describe los encantos de tu propiedad..."></textarea>
              </div>
           </div>
           <button type="submit" className="w-full py-5 rounded-[2rem] bg-indigo-600 text-white font-black text-xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95">
             <CheckSquare size={24} /> {editingId ? 'Guardar Cambios' : 'Lanzar Propiedad'}
           </button>
        </form>
      </Modal>
    </div>
  );
};

// --- Admin Bookings View ---

const AdminBookingsView = () => {
  const { bookings, properties } = useApp();
  const [filter, setFilter] = useState('all');

  const filtered = bookings.filter(b => filter === 'all' || b.status === filter);

  return (
    <div className="flex-1 p-12 overflow-y-auto">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black">Historial de Reservas</h1>
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
           {['all', 'pending', 'approved', 'paid'].map(f => (
             <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
               {f === 'all' ? 'Todas' : f}
             </button>
           ))}
        </div>
      </div>

      <div className="space-y-6">
        {filtered.map(b => {
          const prop = properties.find(p => p.id === b.propertyId);
          return (
            <div key={b.id} className="glass-card p-8 rounded-[3rem] shadow-xl flex items-center gap-8 border-none group hover:border-indigo-500/30 transition-all">
               <img src={prop?.images[0]} className="w-24 h-24 rounded-3xl object-cover shadow-lg" alt="" />
               <div className="flex-1">
                  <h4 className="font-black text-xl mb-1">{prop?.title}</h4>
                  <p className="text-slate-400 font-bold text-xs mb-4 flex items-center gap-1"><Calendar size={12}/> {b.checkIn} - {b.checkOut}</p>
                  <div className="flex gap-4">
                     <span className="px-4 py-1 rounded-full bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500">{b.guestsCount} Huéspedes</span>
                     <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${b.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>{b.status}</span>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Cobrado</p>
                  <p className="text-3xl font-black">€{b.totalPrice.toFixed(0)}</p>
               </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-center py-20 font-bold text-slate-400 text-xl">No hay reservas registradas.</p>}
      </div>
    </div>
  );
};

// --- Landing Page ---

const LandingPage = () => {
  const { siteConfig, properties, setProperties } = useApp();
  const [activeCategory, setActiveCategory] = useState('Todos');

  const filtered = activeCategory === 'Todos' ? properties : properties.filter(p => p.category === activeCategory);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    setProperties(prev => prev.map(p => p.id === id ? { ...p, isWatchlisted: !p.isWatchlisted } : p));
  };

  return (
    <div className="pb-20">
      <div className="relative h-[650px] flex items-center justify-center text-white overflow-hidden">
        <motion.img initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse' }} src={siteConfig.heroBgImage} className="absolute inset-0 w-full h-full object-cover brightness-[0.45]" />
        <div className="relative z-10 text-center max-w-4xl px-6">
          <motion.h1 initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-7xl font-black mb-8 leading-[1.1] tracking-tighter drop-shadow-2xl">{siteConfig.heroTitle}</motion.h1>
          <motion.p initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-2xl font-medium mb-12 text-slate-200/90 drop-shadow-lg">{siteConfig.heroSubtitle}</motion.p>
          <div className="flex items-center gap-4 bg-white/15 backdrop-blur-2xl p-5 rounded-[3rem] border border-white/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] max-w-2xl mx-auto">
             <div className="flex-1 flex items-center gap-4 px-6">
                <Search className="text-slate-300" />
                <input type="text" placeholder="¿A dónde quieres ir?" className="bg-transparent border-none outline-none w-full text-white font-bold placeholder:text-slate-400 text-lg" />
             </div>
             <button className="bg-pink-500 hover:bg-pink-600 px-12 py-5 rounded-[2rem] font-black text-lg transition-all shadow-xl hover:shadow-pink-500/25 active:scale-95">Buscar</button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-12 mt-16">
        <div className="flex items-center gap-4 overflow-x-auto pb-6 mb-16 custom-scrollbar">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)} className={`px-10 py-4 rounded-[2rem] font-black text-sm tracking-widest uppercase transition-all whitespace-nowrap border-2 ${activeCategory === c ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl scale-105' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-pink-500/50'}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {filtered.map(p => (
            <Link key={p.id} to={`/property/${p.id}`} className="group">
              <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden mb-6 shadow-2xl">
                <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
                <button onClick={(e) => toggleFavorite(e, p.id)} className="absolute top-6 right-6 p-3.5 bg-white/25 backdrop-blur-xl rounded-full text-white hover:bg-pink-500 transition-all z-10 shadow-lg active:scale-90">
                  <Heart size={22} className={p.isWatchlisted ? 'fill-pink-500 text-pink-500' : ''} />
                </button>
                <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md px-5 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
                   {p.category}
                </div>
              </div>
              <div className="px-2">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-xl group-hover:text-pink-500 transition-colors">{p.title}</h3>
                  <div className="flex items-center gap-1.5 font-black bg-yellow-400/10 text-yellow-600 px-3 py-1 rounded-xl text-xs">
                    <Star size={14} fill="currentColor" /> {p.rating}
                  </div>
                </div>
                <p className="text-slate-500 font-bold text-sm mb-4 flex items-center gap-1.5 opacity-75"><MapPin size={16} /> {p.location}</p>
                <p className="text-2xl font-black tracking-tighter">€{p.pricePerNight} <span className="text-slate-400 font-bold text-sm tracking-normal">/ noche</span></p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Auth Page ---

const AuthPage = ({ mode }: { mode: 'login' | 'register' }) => {
  const { setUser } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = MOCK_USERS.find(u => u.email === email && (u.password === password || password === 'demo'));
    if (found) {
      setUser(found);
      if (found.role === UserRole.SUPERADMIN) navigate('/admin');
      else if (found.role === UserRole.HOST) navigate('/host');
      else navigate('/');
    } else {
      setError('Credenciales inválidas. Prueba con los datos de demo.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md glass-card p-12 rounded-[4rem] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.15)] border-none">
        <div className="text-center mb-10">
          <div className="bg-gradient-to-br from-pink-500 to-indigo-600 w-20 h-20 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl transform rotate-3"><Lock size={40} /></div>
          <h2 className="text-4xl font-black mb-3 tracking-tight">{mode === 'login' ? 'Bienvenido' : 'Crea tu Cuenta'}</h2>
          <p className="text-slate-500 font-bold text-sm">Gestiona tus experiencias en Havenly</p>
        </div>
        {error && <p className="bg-red-50 text-red-500 p-5 rounded-[1.5rem] mb-8 text-sm font-bold shadow-sm">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" className="w-full p-5 rounded-[1.5rem] border-2 border-transparent focus:border-indigo-600/20 bg-slate-50 dark:bg-slate-900 outline-none font-bold transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest">Contraseña</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full p-5 rounded-[1.5rem] border-2 border-transparent focus:border-indigo-600/20 bg-slate-50 dark:bg-slate-900 outline-none font-bold transition-all" />
          </div>
          <button type="submit" className="w-full py-6 rounded-[2rem] bg-indigo-600 text-white font-black text-xl shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 transform">Entrar</button>
        </form>
        <div className="mt-10 text-center text-sm font-bold text-slate-400">
           {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
           <Link to={mode === 'login' ? '/register' : '/login'} className="text-pink-500 hover:underline">Solicita Acceso</Link>
        </div>
      </motion.div>
    </div>
  );
};

// --- Property Detail Page ---

const PropertyDetailPage = () => {
  const { id } = useParams();
  const { properties, user, verifications, addVerification } = useApp();
  const navigate = useNavigate();
  const [advice, setAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const property = properties.find(p => p.id === id);

  const hostVerification = user ? verifications.find(v => v.userId === user.id && v.hostId === property?.hostId) : null;
  const isVerifiedForThisHost = hostVerification?.status === 'approved';
  const hasPendingVerification = hostVerification?.status === 'pending';

  const handleGetAdvice = async () => {
    if (!property) return;
    setLoadingAdvice(true);
    const result = await getPropertyAiAdvice(property.title, "Busco una estancia relajante con buenas vistas y céntrica.");
    setAdvice(result || "Disculpa, mi cerebro de IA está en mantenimiento.");
    setLoadingAdvice(false);
  };

  const handleSubmitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !property) return;
    
    addVerification({
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      hostId: property.hostId,
      status: 'pending',
      documentUrl: 'https://cdn.pixabay.com/photo/2013/07/12/15/41/passport-150247_1280.png',
      submittedAt: new Date().toLocaleDateString()
    });
    setIsVerificationModalOpen(false);
  };

  if (!property) return <div className="p-40 text-center font-black text-5xl opacity-10">404</div>;

  return (
    <div className="max-w-[1440px] mx-auto px-12 py-16 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-6 h-[600px]">
            <motion.img 
              initial={{ scale: 1.05, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              src={property.images[0]} 
              className="w-full h-full rounded-[3.5rem] cursor-pointer hover:opacity-95 transition-opacity col-span-2 object-cover shadow-2xl"
              onClick={() => { setLightboxIndex(0); setIsLightboxOpen(true); }}
            />
          </div>
          <Lightbox images={property.images} initialIndex={lightboxIndex} isOpen={isLightboxOpen} onClose={() => setIsLightboxOpen(false)} />
        </div>

        <div className="space-y-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-pink-100 text-pink-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{property.category}</span>
              <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">ID: {property.id}</span>
            </div>
            <h1 className="text-6xl font-black mb-6 tracking-tight leading-none">{property.title}</h1>
            <div className="flex items-center gap-6 text-slate-500 font-bold text-lg">
              <span className="flex items-center gap-2 text-yellow-500 bg-yellow-400/10 px-4 py-2 rounded-2xl"><Star size={20} fill="currentColor" /> {property.rating}</span>
              <span className="flex items-center gap-2"><MapPin size={24} /> {property.location}</span>
            </div>
          </div>

          <div className="glass-card p-12 rounded-[4rem] shadow-2xl bg-white dark:bg-slate-900 border-none flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-black mb-1">€{property.pricePerNight}</p>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Por Noche</p>
              </div>

              {isVerifiedForThisHost ? (
                <button 
                  onClick={() => alert('¡Funcionalidad de reserva próximamente!')}
                  className="px-12 py-6 rounded-[2.5rem] bg-pink-500 text-white font-black text-2xl shadow-2xl shadow-pink-500/30 hover:bg-pink-600 transition-all active:scale-95 flex items-center gap-3"
                >
                  <Calendar size={28} /> Reservar
                </button>
              ) : (
                <button 
                  onClick={() => {
                    if (!user) navigate('/login');
                    else setIsVerificationModalOpen(true);
                  }}
                  disabled={hasPendingVerification}
                  className={`px-8 py-5 rounded-[2rem] font-black text-lg shadow-xl transition-all flex items-center gap-2 ${hasPendingVerification ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'}`}
                >
                  {hasPendingVerification ? <><Clock size={20}/> Pendiente de Host</> : <><ShieldAlert size={20}/> Verificar Identidad</>}
                </button>
              )}
            </div>
            
            {!isVerifiedForThisHost && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl flex items-center gap-4 border border-dashed border-slate-200 dark:border-slate-700">
                <ShieldAlert className="text-indigo-600" size={24}/>
                <p className="text-xs font-bold text-slate-500 leading-relaxed">
                  {hasPendingVerification 
                    ? "Tu solicitud está siendo revisada por el anfitrión de esta propiedad." 
                    : "Este anfitrión requiere que verifiques tu identidad antes de permitirte realizar una reserva."}
                </p>
              </div>
            )}
            {isVerifiedForThisHost && (
              <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl flex items-center gap-3 border border-green-200">
                <ShieldCheck className="text-green-600" size={20}/>
                <p className="text-xs font-black text-green-700 uppercase tracking-widest">Verificado para este anfitrión</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h3 className="text-3xl font-black tracking-tight">Sobre este lugar</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xl font-medium">{property.description}</p>
          </div>

          <div className="glass-card p-10 rounded-[3.5rem] bg-indigo-600 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform"><Zap size={120} /></div>
            <div className="relative z-10">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black flex items-center gap-3"><Zap size={28} /> Consejos del Concierge IA</h3>
                  {!advice && (
                    <button 
                      onClick={handleGetAdvice} 
                      disabled={loadingAdvice}
                      className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-100 transition-colors disabled:opacity-50 shadow-xl"
                    >
                      {loadingAdvice ? 'Analizando...' : 'Consultar Asistente'}
                    </button>
                  )}
               </div>
               {advice ? (
                 <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="italic text-indigo-50 font-medium text-lg leading-relaxed">"{advice}"</motion.p>
               ) : (
                 <p className="text-indigo-200 font-bold">Pulsa para obtener una recomendación personalizada basada en esta propiedad.</p>
               )}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isVerificationModalOpen} onClose={() => setIsVerificationModalOpen(false)} title="Verificación de Identidad Requerida">
        <div className="p-2">
           <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl">
              <p className="text-sm font-bold text-slate-500 leading-relaxed">
                Para rentar propiedades de <strong>Host Manager</strong>, debes subir una copia de tu ID oficial. 
                Esta verificación es aislada: si rentas con otro host diferente en el futuro, deberás repetir este proceso con él.
              </p>
           </div>
           <form onSubmit={handleSubmitVerification} className="space-y-8">
              <div className="border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-12 text-center group hover:border-indigo-500/30 transition-all cursor-pointer">
                 <Upload size={48} className="mx-auto text-slate-300 group-hover:text-indigo-500 mb-4" />
                 <p className="font-black text-lg">Sube tu Pasaporte o DNI</p>
                 <p className="text-xs text-slate-400 font-bold mt-2">Formatos aceptados: JPG, PNG, PDF (Max 5MB)</p>
              </div>
              <button type="submit" className="w-full py-5 rounded-[2rem] bg-indigo-600 text-white font-black text-xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95">
                Enviar para Aprobación
              </button>
           </form>
        </div>
      </Modal>
    </div>
  );
};

// --- Chat Page ---

const ChatPage = () => {
  const { user, chatThreads, chatMessages, sendChatMessage, allUsers } = useApp();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  
  // Rule: Participants only see threads involving them
  const visibleThreads = chatThreads.filter(t => {
      if (user?.role === UserRole.SUPERADMIN) return true;
      if (user?.role === UserRole.HOST) return t.participantId.includes('host') || t.participantId === 'u-guest';
      return t.participantId === 'u-host' || t.participantId === 'u-admin';
  });

  const activeThread = chatThreads.find(t => t.id === activeThreadId);
  const activeMessages = chatMessages.filter(m => {
      if (!activeThreadId) return false;
      return true; 
  });

  const handleSend = () => {
    if (!messageText.trim() || !activeThreadId) return;
    sendChatMessage(activeThreadId, messageText);
    setMessageText('');
  };

  const getParticipantInfo = (participantId: string) => {
      return allUsers.find(u => u.id === participantId) || { name: 'Usuario', avatar: `https://i.pravatar.cc/150?u=${participantId}` };
  };

  return (
    <div className="flex-1 flex h-[calc(100vh-80px)] overflow-hidden bg-white dark:bg-slate-900">
      <div className="w-96 border-r border-slate-100 dark:border-slate-800 flex flex-col h-full">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-3xl font-black mb-6">Mensajes</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Buscar chats..." className="w-full py-4 pl-12 pr-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold text-sm shadow-inner" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {visibleThreads.map(t => {
            const pInfo = getParticipantInfo(t.participantId);
            return (
              <button key={t.id} onClick={() => setActiveThreadId(t.id)} className={`w-full flex items-center gap-4 p-5 rounded-[2rem] transition-all ${activeThreadId === t.id ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'}`}>
                <div className="relative">
                  <img src={pInfo.avatar} className="w-14 h-14 rounded-2xl object-cover shadow-md" alt="" />
                  {t.unreadCount > 0 && <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">{t.unreadCount}</div>}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex justify-between items-center mb-1">
                    <p className={`font-black ${activeThreadId === t.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{pInfo.name}</p>
                    <span className={`text-[10px] font-bold ${activeThreadId === t.id ? 'text-indigo-200' : 'text-slate-400'}`}>{t.timestamp}</span>
                  </div>
                  <p className={`text-xs truncate ${activeThreadId === t.id ? 'text-indigo-100' : 'text-slate-400'}`}>{t.lastMessage}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50">
        {activeThreadId ? (
          <>
            <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={getParticipantInfo(activeThread!.participantId).avatar} className="w-12 h-12 rounded-2xl object-cover shadow-lg" alt="" />
                <div>
                  <h3 className="font-black text-lg">{getParticipantInfo(activeThread!.participantId).name}</h3>
                  <p className="text-xs text-green-500 font-black uppercase tracking-widest flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> En línea</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <button className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"><Phone size={20}/></button>
                 <button className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"><Video size={20}/></button>
                 <button className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"><MoreVertical size={20}/></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {activeMessages.map((m) => {
                const isMe = m.senderId === user?.id;
                const senderInfo = isMe ? user : getParticipantInfo(m.senderId);
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] flex gap-4 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <img src={senderInfo.avatar} className="w-10 h-10 rounded-xl object-cover shadow-md shrink-0 self-end" alt="" />
                      <div className={`p-6 rounded-[2rem] shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none'}`}>
                        <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                        <p className={`text-[9px] mt-2 font-black uppercase tracking-widest ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>{m.timestamp}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-2 rounded-[2.5rem] shadow-inner">
                <button className="p-4 rounded-full text-slate-400 hover:text-indigo-600 transition-colors"><AttachmentIcon size={22} /></button>
                <input 
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSend()}
                  type="text" 
                  placeholder="Escribe un mensaje..." 
                  className="flex-1 bg-transparent border-none outline-none font-bold text-slate-700 dark:text-white px-2" 
                />
                <button className="p-4 rounded-full text-slate-400 hover:text-pink-500 transition-colors"><Smile size={22} /></button>
                <button onClick={handleSend} className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all active:scale-90"><Send size={22} /></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
            <div className="bg-white dark:bg-slate-800 p-10 rounded-[4rem] shadow-2xl mb-10 transform rotate-3">
               <MessageCircle size={80} className="text-pink-500" />
            </div>
            <h2 className="text-4xl font-black mb-4 tracking-tight">Tu Inbox está esperando</h2>
            <p className="text-slate-400 font-bold max-w-sm mx-auto">Selecciona una conversación para empezar a chatear manualmente con anfitriones o invitados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Settings Page ---

const SettingsPage = () => {
  const { user, siteConfig, setSiteConfig } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-12 py-24 animate-in fade-in duration-500">
      <h1 className="text-6xl font-black mb-16 tracking-tight">Tu Cuenta</h1>
      
      <div className="space-y-10">
        <section className="glass-card p-12 rounded-[4rem] shadow-2xl bg-white dark:bg-slate-900 border-none">
          <h2 className="text-2xl font-black mb-10 flex items-center gap-4"><UserIcon className="text-pink-500" size={28}/> Información de Perfil</h2>
          <div className="flex items-center gap-10">
            <div className="relative">
               <img src={user?.avatar} className="w-32 h-32 rounded-[2.5rem] border-4 border-white shadow-2xl object-cover" />
               <button className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3 rounded-2xl shadow-xl hover:bg-indigo-700 transition-colors"><Upload size={20}/></button>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-8">
                 <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Nombre Completo</label>
                    <input type="text" defaultValue={user?.name} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold outline-none" />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Email</label>
                    <input type="email" defaultValue={user?.email} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-bold outline-none" />
                 </div>
              </div>
              <div className="mt-6">
                 <span className="px-4 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 text-[10px] font-black uppercase tracking-widest">{user?.role}</span>
              </div>
            </div>
          </div>
        </section>

        {user?.role === UserRole.SUPERADMIN && (
          <section className="glass-card p-12 rounded-[4rem] shadow-2xl bg-white dark:bg-slate-900 border-none">
            <h2 className="text-2xl font-black mb-10 flex items-center gap-4"><SettingsIcon className="text-indigo-500" size={28}/> Ajustes Globales de Havenly</h2>
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Nombre de la Plataforma</label>
                <input 
                  type="text" 
                  value={siteConfig.siteName} 
                  onChange={e => setSiteConfig({...siteConfig, siteName: e.target.value})}
                  className="w-full p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-none outline-none font-black text-xl shadow-inner"
                />
              </div>
              <div className="flex items-center justify-between p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 shadow-inner">
                <div>
                   <p className="font-black text-lg">Modo Mantenimiento</p>
                   <p className="text-sm text-slate-400 font-bold">Oculta el sitio a los invitados públicos.</p>
                </div>
                <button 
                  onClick={() => setSiteConfig({...siteConfig, maintenanceMode: !siteConfig.maintenanceMode})}
                  className={`w-16 h-8 rounded-full relative transition-all shadow-md ${siteConfig.maintenanceMode ? 'bg-pink-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${siteConfig.maintenanceMode ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

// --- App Root & Provider ---

const AppProvider = ({ children }: { children?: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(INITIAL_SITE_CONFIG);
  const [isDark, setIsDark] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([
    { id: 'b1', propertyId: 'p1', guestId: 'u-guest', checkIn: '2024-06-01', checkOut: '2024-06-05', totalPrice: 1000, taxAmount: 100, commissionAmount: 50, status: 'paid', guestsCount: 2 }
  ]);
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  
  // Real-time chat state within session
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([
    { id: 't1', participantId: 'u-host', lastMessage: '¿Cuándo llegas?', timestamp: '10:30 AM', unreadCount: 0 },
    { id: 't2', participantId: 'u-admin', lastMessage: 'Verificación aprobada', timestamp: 'Yesterday', unreadCount: 0 },
  ]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'm1', senderId: 'u-host', text: 'Hola! ¿Tienes alguna duda sobre la villa?', timestamp: '10:00 AM', type: 'text' },
    { id: 'm2', senderId: 'u-guest', text: 'Hola, sí. ¿Hay cuna disponible?', timestamp: '10:05 AM', type: 'text' },
    { id: 'm3', senderId: 'u-host', text: '¡Sí! Podemos prepararla sin coste adicional.', timestamp: '10:10 AM', type: 'text' },
  ]);

  const addVerification = (v: VerificationRequest) => setVerifications(prev => [...prev, v]);
  const updateVerification = (id: string, status: 'approved' | 'rejected') => {
    setVerifications(prev => prev.map(v => v.id === id ? { ...v, status } : v));
  };

  const sendChatMessage = (threadId: string, text: string) => {
      if (!user) return;
      const newMessage: ChatMessage = {
          id: 'm' + Date.now(),
          senderId: user.id,
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text'
      };
      setChatMessages(prev => [...prev, newMessage]);
      setChatThreads(prev => prev.map(t => t.id === threadId ? { ...t, lastMessage: text, timestamp: 'Now' } : t));
  };

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  return (
    <AppContext.Provider value={{ 
      user, setUser, siteConfig, setSiteConfig, isDark, toggleTheme: () => setIsDark(!isDark),
      bookings, setBookings, properties, setProperties, allUsers: MOCK_USERS,
      verifications, addVerification, updateVerification,
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
          {/* Master Admin Routes */}
          <Route path="/admin/*" element={
            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
              <AdminSidebar />
              <Routes>
                <Route index element={<DashboardHome />} />
                <Route path="properties" element={<AdminPropertiesView />} />
                <Route path="bookings" element={<AdminBookingsView />} />
                <Route path="users" element={<div className="p-20 text-center"><h1 className="text-3xl font-black">Módulo de Usuarios</h1><p className="text-slate-400 font-bold">Listado completo de cuentas registradas.</p></div>} />
                <Route path="verifications" element={<AdminVerificationsView />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="config" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/admin" />} />
              </Routes>
            </div>
          } />

          {/* Host Manager Routes */}
          <Route path="/host/*" element={
            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
              <AdminSidebar />
              <Routes>
                <Route index element={<DashboardHome />} />
                <Route path="properties" element={<AdminPropertiesView />} />
                <Route path="bookings" element={<AdminBookingsView />} />
                <Route path="verifications" element={<AdminVerificationsView />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="*" element={<Navigate to="/host" />} />
              </Routes>
            </div>
          } />

          {/* Guest/Public Routes */}
          <Route path="*" element={
            <div className="min-h-screen transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
              <Navbar />
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/property/:id" element={<PropertyDetailPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/login" element={<AuthPage mode="login" />} />
                <Route path="/register" element={<AuthPage mode="register" />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          } />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
