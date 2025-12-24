
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Menu, X, Search, User as UserIcon, LogOut, LayoutDashboard, Heart, 
  MessageCircle, Moon, Sun, Filter, Star, MapPin, 
  ChevronRight, Calendar, CreditCard, PieChart, Plus, Settings as SettingsIcon, CheckCircle,
  Phone, Video, MoreVertical, Trash2, Edit, Home, Users, BarChart3, Lock,
  Upload, CheckSquare, Clock, Paperclip, Send, Globe, DollarSign,
  Share, Wifi, Waves, Wind, Tv, Utensils, Car, ShieldAlert, ShieldCheck, AlertCircle, Eye, EyeOff,
  Paperclip as AttachmentIcon, Smile, ChevronLeft, ChevronRight as ChevronRightIcon,
  Activity, TrendingUp, CreditCard as CardIcon, Zap, Wallet, Info, FileText, Image as ImageIcon,
  Coffee, Bath, Laptop, Snowflake, HelpCircle, MessageSquare, ShieldCheck as VerifiedIcon, CreditCard as PaymentIcon
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

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children?: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl glass-card p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden bg-white dark:bg-slate-900 border-none">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={24} className="text-slate-500" /></button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const PaymentModal = ({ isOpen, onClose, total, onPaymentSuccess }: { isOpen: boolean; onClose: () => void; total: number; onPaymentSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ card: '', expiry: '', cvc: '', name: '' });

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate payment gateway delay
    setTimeout(() => {
      setLoading(false);
      onPaymentSuccess();
      onClose();
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pasarela de Pago Segura">
      <div className="space-y-6">
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Total a Pagar</p>
            <p className="text-4xl font-black">€{total.toLocaleString()}</p>
          </div>
          <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md">
            <PaymentIcon size={32} />
          </div>
        </div>

        <form onSubmit={handlePay} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nombre en la Tarjeta</label>
            <input required placeholder="Juan Pérez" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none font-bold border dark:border-slate-700" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Número de Tarjeta</label>
            <div className="relative">
               <input required placeholder="0000 0000 0000 0000" maxLength={19} value={formData.card} onChange={e => setFormData({...formData, card: e.target.value})} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none font-bold border dark:border-slate-700 pr-14" />
               <CreditCard className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Vencimiento</label>
              <input required placeholder="MM/YY" maxLength={5} value={formData.expiry} onChange={e => setFormData({...formData, expiry: e.target.value})} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none font-bold border dark:border-slate-700" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">CVC</label>
              <input required placeholder="123" maxLength={3} value={formData.cvc} onChange={e => setFormData({...formData, cvc: e.target.value})} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none font-bold border dark:border-slate-700" />
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full py-6 rounded-[2rem] bg-indigo-600 text-white font-black text-xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3">
            {loading ? (
              <>
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                Procesando Pago...
              </>
            ) : `Pagar €${total}`}
          </button>
          <div className="flex items-center justify-center gap-2 opacity-40 text-[10px] font-black uppercase tracking-widest text-slate-500">
             <Lock size={12}/> Pago Cifrado de Extremo a Extremo
          </div>
        </form>
      </div>
    </Modal>
  );
};

const Lightbox = ({ images, initialIndex, isOpen, onClose }: { images: string[], initialIndex: number, isOpen: boolean, onClose: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  useEffect(() => { setCurrentIndex(initialIndex); }, [initialIndex]);
  if (!isOpen) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black/95 flex flex-col items-center justify-center p-4 lg:p-20">
      <button onClick={onClose} className="absolute top-8 right-8 text-white p-4 hover:bg-white/10 rounded-full transition-all z-[310]"><X size={32} /></button>
      <div className="relative w-full max-w-6xl h-full flex items-center justify-center">
        <button onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)} className="absolute left-0 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all z-[310]"><ChevronLeft size={32} /></button>
        <motion.img key={currentIndex} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} src={images[currentIndex]} className="max-h-[80vh] w-auto rounded-3xl shadow-2xl object-contain" />
        <button onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)} className="absolute right-0 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all z-[310]"><ChevronRightIcon size={32} /></button>
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
    <nav className="sticky top-0 z-50 glass-card border-b border-slate-100 dark:border-slate-800 px-6 py-3 bg-white/70 dark:bg-slate-900/70">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-pink-500 p-1.5 rounded-lg"><Home className="text-white" size={20} /></div>
            <span className="text-xl font-bold tracking-tight text-indigo-950 dark:text-white">
              {siteConfig.siteName}
              {isPanel && <span className="ml-2 text-xs font-normal text-slate-400 capitalize">{user?.role.toLowerCase()} Panel</span>}
            </span>
          </Link>
          {!isPanel && (
            <div className="hidden lg:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium hover:text-pink-500 transition-colors font-bold text-slate-700 dark:text-slate-300">Inicio</Link>
              <Link to="/chat" className="text-sm font-medium hover:text-pink-500 transition-colors font-bold text-slate-700 dark:text-slate-300">Mensajes</Link>
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
                <span className="hidden sm:inline text-sm font-semibold dark:text-white">{user.name}</span>
                <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 object-cover" alt="avatar" />
              </div>
              <div className="group relative">
                <button className="p-1 dark:text-white"><ChevronRight size={16} className="rotate-90" /></button>
                <div className="absolute right-0 top-full mt-2 w-56 glass-card border rounded-2xl overflow-hidden shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all bg-white dark:bg-slate-900">
                  <Link to="/settings" className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300"><UserIcon size={16} /> Mi Panel</Link>
                  {user.role === UserRole.SUPERADMIN && <Link to="/admin" className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300"><LayoutDashboard size={16} /> Master Panel</Link>}
                  {user.role === UserRole.HOST && <Link to="/host" className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300"><LayoutDashboard size={16} /> Host Panel</Link>}
                  <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2" />
                  <button onClick={() => { setUser(null); navigate('/'); }} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium text-red-600"><LogOut size={16} /> Cerrar Sesión</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
               <Link to="/login" state={{ from: location.pathname }} className="text-sm font-bold px-4 py-2 hover:text-pink-500 transition-colors dark:text-white">Entrar</Link>
               <Link to="/register" state={{ from: location.pathname }} className="px-6 py-2.5 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg">Registrarse</Link>
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
    { icon: <ShieldCheck size={20} />, label: 'Verificaciones', path: `${prefix}/verifications` },
    { icon: <MessageCircle size={20} />, label: 'Mensajes', path: `${prefix}/chat` },
    { icon: <SettingsIcon size={20} />, label: 'Ajustes Sitio', path: `/admin/config`, adminOnly: true },
  ];
  return (
    <aside className="w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col p-8 bg-white dark:bg-slate-900 shrink-0 h-screen sticky top-0 overflow-y-auto custom-scrollbar transition-colors">
      <div className="mb-12 flex items-center gap-3"><div className="bg-pink-500 p-2 rounded-xl text-white shadow-lg"><Home size={24} /></div><span className="text-2xl font-black dark:text-white">StayHub</span></div>
      <nav className="flex-1 space-y-2">
        {menuItems.filter(i => !i.adminOnly || isAdmin).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${isActive ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-pink-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>{item.icon}{item.label}</Link>
          );
        })}
      </nav>
      <button onClick={() => { setUser(null); navigate('/'); }} className="flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all mt-8"><LogOut size={20} />Cerrar Sesión</button>
    </aside>
  );
};

// --- Dashboard Views ---

const DashboardHome = () => {
  const { user, properties, bookings } = useApp();
  const isAdmin = user?.role === UserRole.SUPERADMIN;
  const totalRevenue = bookings.reduce((acc, b) => acc + (b.status === 'paid' ? b.totalPrice : 0), 0);
  const activeBookings = bookings.filter(b => b.status === 'paid' || b.status === 'approved').length;
  return (
    <div className="flex-1 p-12 bg-slate-50 dark:bg-slate-950 overflow-y-auto transition-colors">
      <h1 className="text-4xl font-black mb-2 tracking-tight dark:text-white">{isAdmin ? 'Master Admin Panel' : 'Host Manager Panel'}</h1>
      <p className="text-slate-500 font-bold mb-12">Bienvenido de nuevo, {user?.name}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="glass-card p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-xl border-none"><p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Ingresos Confirmados</p><p className="text-4xl font-black">€{totalRevenue.toLocaleString()}</p></div>
        <div className="glass-card p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-xl border-none"><p className="text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">Propiedades</p><p className="text-4xl font-black dark:text-white">{properties.length}</p></div>
        <div className="glass-card p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-xl border-none"><p className="text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">Reservas Activas</p><p className="text-4xl font-black dark:text-white">{activeBookings}</p></div>
        <div className="glass-card p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-xl border-none"><p className="text-[10px] font-black uppercase tracking-widest mb-2 text-slate-400">Ocupación Media</p><p className="text-4xl font-black dark:text-white">84%</p></div>
      </div>
    </div>
  );
};

const AdminBookingsView = () => {
  const { bookings, setBookings, properties, allUsers, user } = useApp();
  const isAdmin = user?.role === UserRole.SUPERADMIN;
  
  const filtered = bookings.filter(b => {
    if (isAdmin) return true;
    const property = properties.find(p => p.id === b.propertyId);
    return property?.hostId === user?.id;
  });

  const handleApprovePayment = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'paid' } : b));
  };

  const handleCancelBooking = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
  };

  return (
    <div className="flex-1 p-12 bg-slate-50 dark:bg-slate-950 overflow-y-auto transition-colors">
      <h1 className="text-4xl font-black mb-12 dark:text-white">Gestión de Reservas</h1>
      <div className="space-y-6">
        {filtered.map(b => {
          const property = properties.find(p => p.id === b.propertyId);
          const guest = allUsers.find(u => u.id === b.guestId);
          return (
            <div key={b.id} className="glass-card p-8 rounded-[3rem] shadow-xl border-none flex items-center gap-8 bg-white dark:bg-slate-900">
               <img src={property?.images[0]} className="w-24 h-24 rounded-[2rem] object-cover shadow-lg" alt="" />
               <div className="flex-1">
                 <h3 className="font-black text-xl dark:text-white">{property?.title}</h3>
                 <p className="text-slate-500 font-bold text-sm">Huésped: <span className="text-indigo-600">{guest?.name}</span></p>
                 <p className="text-xs text-slate-400 font-bold mt-1">{b.checkIn} a {b.checkOut}</p>
               </div>
               <div className="text-right px-8">
                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total</p>
                 <p className="text-2xl font-black dark:text-white">€{b.totalPrice}</p>
               </div>
               <div className="flex flex-col gap-2">
                 <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-center ${
                   b.status === 'paid' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 
                   b.status === 'pending' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' : 
                   'bg-red-100 text-red-600 dark:bg-red-900/30'
                 }`}>
                   {b.status === 'pending' ? 'Pago Pendiente' : b.status}
                 </span>
                 {b.status === 'pending' && (
                   <div className="flex gap-2 mt-2">
                     <button onClick={() => handleCancelBooking(b.id)} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-red-500 hover:bg-red-50"><Trash2 size={16}/></button>
                     <button onClick={() => handleApprovePayment(b.id)} className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-lg hover:bg-indigo-700">Aprobar Pago</button>
                   </div>
                 )}
               </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-center py-20 font-bold text-slate-400">No hay reservas registradas.</p>}
      </div>
    </div>
  );
};

const AdminVerificationsView = () => {
  const { verifications, updateVerification, allUsers, user } = useApp();
  const isAdmin = user?.role === UserRole.SUPERADMIN;
  const filtered = verifications.filter(v => isAdmin || v.hostId === user?.id);
  return (
    <div className="flex-1 p-12 bg-slate-50 dark:bg-slate-950 overflow-y-auto transition-colors">
      <h1 className="text-4xl font-black mb-12 dark:text-white">Verificaciones de ID</h1>
      <div className="space-y-6">
        {filtered.map(v => {
          const applicant = allUsers.find(u => u.id === v.userId);
          return (
            <div key={v.id} className="glass-card p-8 rounded-[3rem] shadow-xl border-none flex items-center gap-8 bg-white dark:bg-slate-900">
              <img src={applicant?.avatar} className="w-16 h-16 rounded-2xl object-cover shadow-lg" alt="" />
              <div className="flex-1"><h3 className="font-black text-xl dark:text-white">{applicant?.name}</h3><a href={v.documentUrl} download={`id_${v.userId}.png`} className="text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1 mt-1 hover:underline"><FileText size={14}/> Descargar Documento ID</a></div>
              {v.status === 'pending' ? (
                <div className="flex gap-2"><button onClick={() => updateVerification(v.id, 'rejected')} className="px-6 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-black text-xs hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400">Rechazar</button><button onClick={() => updateVerification(v.id, 'approved')} className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-lg hover:bg-indigo-700">Aprobar</button></div>
              ) : (
                <span className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${v.status === 'approved' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>{v.status}</span>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-center py-20 font-bold text-slate-400">No hay verificaciones pendientes.</p>}
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
  const [ruleInput, setRuleInput] = useState('');

  const [formData, setFormData] = useState({
    title: '', location: '', pricePerNight: '', category: 'Villa', maxGuests: '4', description: '', images: [] as string[], rules: [] as string[]
  });

  const filtered = properties.filter(p => (isAdmin || p.hostId === user?.id) && (p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.location.toLowerCase().includes(searchTerm.toLowerCase())));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
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

  const addRule = () => { if (ruleInput.trim()) { setFormData(prev => ({ ...prev, rules: [...prev.rules, ruleInput.trim()] })); setRuleInput(''); } };
  const removeRule = (idx: number) => { setFormData(prev => ({ ...prev, rules: prev.rules.filter((_, i) => i !== idx) })); };

  return (
    <div className="flex-1 p-12 bg-slate-50 dark:bg-slate-950 overflow-y-auto transition-colors">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black dark:text-white">Mis Propiedades</h1>
        <button onClick={() => { setEditingId(null); setFormData({ title: '', location: '', pricePerNight: '', category: 'Villa', maxGuests: '4', description: '', images: [], rules: [] }); setIsModalOpen(true); }} className="bg-pink-500 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-pink-600 transition-colors">Nueva Propiedad</button>
      </div>
      <div className="mb-8 relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} type="text" placeholder="Buscar por nombre o lugar..." className="w-full py-6 pl-16 pr-8 rounded-[2rem] bg-white dark:bg-slate-900 border-none outline-none font-bold text-lg shadow-xl dark:text-white transition-all focus:ring-2 ring-indigo-500" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(p => (
          <div key={p.id} className="glass-card rounded-[3rem] overflow-hidden shadow-2xl flex flex-col group border-none bg-white dark:bg-slate-900">
            <div className="relative h-48">
               <img src={p.images[0]} className="w-full h-full object-cover" alt="" />
               <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => { setEditingId(p.id); setFormData({ ...p, pricePerNight: p.pricePerNight.toString(), maxGuests: p.maxGuests.toString() }); setIsModalOpen(true); }} className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md text-white hover:bg-white/40"><Edit size={18}/></button>
                  <button onClick={() => setProperties(prev => prev.filter(x => x.id !== p.id))} className="p-2.5 rounded-xl bg-red-500/80 backdrop-blur-md text-white hover:bg-red-600"><Trash2 size={18}/></button>
               </div>
            </div>
            <div className="p-8"><h3 className="text-xl font-black dark:text-white">{p.title}</h3><p className="text-slate-500 font-bold text-xs mb-4">{p.location}</p><p className="text-2xl font-black dark:text-white">€{p.pricePerNight}</p></div>
          </div>
        ))}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Editar Propiedad' : 'Crear Propiedad'}>
        <form onSubmit={handleSave} className="space-y-6">
           <input required type="text" placeholder="Nombre Comercial" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-none font-bold dark:text-white border dark:border-slate-700" />
           <input required type="text" placeholder="Ubicación (Ciudad, País)" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-none font-bold dark:text-white border dark:border-slate-700" />
           <div className="grid grid-cols-2 gap-4">
              <input required type="number" placeholder="Precio / Noche" value={formData.pricePerNight} onChange={e => setFormData({...formData, pricePerNight: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-none font-bold dark:text-white border dark:border-slate-700" />
              <input required type="number" placeholder="Huéspedes Máx" value={formData.maxGuests} onChange={e => setFormData({...formData, maxGuests: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-none font-bold dark:text-white border dark:border-slate-700" />
           </div>
           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Reglas del Alojamiento</label>
              <div className="flex gap-2">
                 <input type="text" value={ruleInput} onChange={e => setRuleInput(e.target.value)} placeholder="Ej: No fumar" className="flex-1 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 dark:text-white font-bold outline-none border dark:border-slate-700" />
                 <button type="button" onClick={addRule} className="p-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"><Plus size={20}/></button>
              </div>
              <div className="flex flex-wrap gap-2">{formData.rules.map((r, i) => (<span key={i} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold dark:text-slate-300 flex items-center gap-2">{r} <button type="button" onClick={() => removeRule(i)} className="text-red-500"><X size={14}/></button></span>))}</div>
           </div>
           <textarea placeholder="Descripción del alojamiento..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 outline-none font-medium min-h-[100px] dark:text-white border dark:border-slate-700" />
           <div className="flex items-center gap-4"><button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-black text-xs hover:bg-indigo-700 transition-all"><Upload size={16}/> Subir Fotos</button><input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} /><p className="text-xs font-bold text-slate-400">{formData.images.length} fotos seleccionadas</p></div>
           <button type="submit" className="w-full py-5 rounded-[2rem] bg-indigo-600 text-white font-black text-xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">Guardar Propiedad</button>
        </form>
      </Modal>
    </div>
  );
};

// --- Landing & Listing ---

const LandingPage = () => {
  const { properties, setProperties } = useApp();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchText, setSearchText] = useState('');
  const filtered = properties.filter(p => (activeCategory === 'Todos' || p.category === activeCategory) && (p.title.toLowerCase().includes(searchText.toLowerCase()) || p.location.toLowerCase().includes(searchText.toLowerCase())));
  const handleSearchClick = () => { document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' }); };
  const toggleFav = (id: string) => { setProperties(prev => prev.map(p => p.id === id ? { ...p, isWatchlisted: !p.isWatchlisted } : p)); };

  return (
    <div className="pb-20 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="relative h-[650px] flex items-center justify-center text-white overflow-hidden">
        <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000" className="absolute inset-0 w-full h-full object-cover brightness-[0.45]" alt="" />
        <div className="relative z-10 text-center max-w-4xl px-6">
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-7xl font-black mb-8 leading-[1.1] tracking-tighter drop-shadow-2xl">Experimenta lo extraordinario</motion.h1>
          <div className="flex items-center gap-4 bg-white/15 backdrop-blur-2xl p-5 rounded-[3rem] border border-white/20 shadow-2xl max-w-2xl mx-auto">
             <div className="flex-1 flex items-center gap-4 px-6"><Search className="text-slate-300" /><input type="text" value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="¿A dónde quieres ir?" className="bg-transparent border-none outline-none w-full text-white font-bold placeholder:text-slate-400 text-lg" /></div>
             <button onClick={handleSearchClick} className="bg-pink-500 px-12 py-5 rounded-[2rem] font-black text-lg hover:bg-pink-600 transition-all active:scale-95">Buscar</button>
          </div>
        </div>
      </div>
      <div id="listings" className="max-w-[1440px] mx-auto px-12 mt-16">
        <div className="flex items-center gap-4 overflow-x-auto pb-6 mb-16 no-scrollbar">{CATEGORIES.map(c => (<button key={c} onClick={() => setActiveCategory(c)} className={`px-10 py-4 rounded-[2rem] font-black text-sm uppercase transition-all whitespace-nowrap border-2 ${activeCategory === c ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-105' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-pink-500/50'}`}>{c}</button>))}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {filtered.map(p => (
            <div key={p.id} className="group relative">
              <Link to={`/property/${p.id}`}>
                <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden mb-6 shadow-2xl"><img src={p.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" /><div className="absolute bottom-6 left-6 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-black uppercase text-white tracking-widest">{p.category}</div></div>
              </Link>
              <button onClick={() => toggleFav(p.id)} className="absolute top-6 right-6 p-3.5 bg-white/25 backdrop-blur-xl rounded-full text-white hover:bg-pink-500 transition-all shadow-lg active:scale-90 z-10"><Heart size={22} className={p.isWatchlisted ? 'fill-pink-500 text-pink-500' : ''} /></button>
              <div className="px-2"><div className="flex justify-between items-start mb-2"><h3 className="font-black text-xl group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors dark:text-white">{p.title}</h3><div className="flex items-center gap-1 font-black text-yellow-500 px-2 py-1 rounded-xl bg-yellow-400/10 text-xs"><Star size={14} fill="currentColor" /> {p.rating}</div></div><p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-4"><MapPin size={16} className="inline mr-1" /> {p.location}</p><p className="text-2xl font-black dark:text-white">€{p.pricePerNight} <span className="text-slate-400 font-bold text-sm">/ noche</span></p></div>
            </div>
          ))}
          {filtered.length === 0 && <div className="col-span-full py-40 text-center font-bold text-slate-400 text-2xl">No hay resultados para tu búsqueda.</div>}
        </div>
      </div>
    </div>
  );
};

const PropertyDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const { properties, user, verifications, addVerification, setBookings } = useApp();
  const navigate = useNavigate();
  const [advice, setAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docBase64, setDocBase64] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestsCount, setGuestsCount] = useState(1);
  const property = properties.find(p => p.id === id);

  useEffect(() => {
    setIsVerificationModalOpen(false);
    setIsPaymentModalOpen(false);
    setDocBase64(null);
    setCheckIn('');
    setCheckOut('');
    setGuestsCount(1);
    setAdvice('');
  }, [id]);

  const hostVerification = user && property ? verifications.find(v => v.userId === user.id && v.hostId === property.hostId) : null;
  const isActuallyVerified = user?.idVerified || hostVerification?.status === 'approved';
  const hasPendingVerification = !user?.idVerified && hostVerification?.status === 'pending';

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut || !property) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights * property.pricePerNight : 0;
  };

  const handleBookingClick = () => {
    if (!user) return navigate('/login', { state: { from: location.pathname } });
    const total = calculateTotalPrice();
    if (total <= 0) return alert('Por favor selecciona fechas válidas.');
    setIsPaymentModalOpen(true);
  };

  const onPaymentConfirmed = () => {
    const total = calculateTotalPrice();
    const newBooking: Booking = { 
      id: 'b-'+Math.random().toString(36).substr(2, 5), 
      propertyId: property!.id, 
      guestId: user!.id, 
      checkIn, 
      checkOut, 
      totalPrice: total, 
      taxAmount: total*0.1, 
      commissionAmount: total*0.05, 
      status: 'pending', 
      guestsCount 
    };
    setBookings(prev => [...prev, newBooking]);
    alert('¡Pago enviado con éxito! Tu reserva está ahora pendiente de aprobación por el anfitrión.');
    navigate('/settings');
  };

  const handleGetAdvice = async () => {
    if (!property) return;
    setLoadingAdvice(true);
    setAdvice('');
    try {
      const result = await getPropertyAiAdvice(property.title, "Busco una escapada cómoda y con encanto.");
      setAdvice(result || "Este lugar es ideal para tus necesidades.");
    } catch (e) { setAdvice("No pudimos conectar con el conserje en este momento."); } finally { setLoadingAdvice(false); }
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
    if (!docBase64) return alert('Debes subir un documento antes de enviar.');
    addVerification({ id: 'v'+Math.random().toString(36).substr(2, 9), userId: user!.id, hostId: property!.hostId, status: 'pending', documentUrl: docBase64, submittedAt: new Date().toLocaleDateString() });
    setIsVerificationModalOpen(false);
    setDocBase64(null);
  };

  if (!property) return <div className="p-40 text-center font-black text-5xl opacity-10">404</div>;

  return (
    <div className="max-w-[1440px] mx-auto px-12 py-16 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-8">
           <div className="relative group"><img src={property.images[0]} onClick={() => { setLightboxIndex(0); setIsLightboxOpen(true); }} className="w-full aspect-[4/3] rounded-[3.5rem] object-cover shadow-2xl cursor-pointer transition-transform group-hover:scale-[1.01]" alt="" /></div>
           <div className="grid grid-cols-4 gap-4">{property.images.slice(1, 5).map((img, i) => (<img key={i} src={img} onClick={() => { setLightboxIndex(i+1); setIsLightboxOpen(true); }} className="w-full aspect-square rounded-3xl object-cover cursor-pointer hover:opacity-80 transition-all border dark:border-slate-800" alt="" />))}</div>
           <Lightbox images={property.images} initialIndex={lightboxIndex} isOpen={isLightboxOpen} onClose={() => setIsLightboxOpen(false)} />
           <div className="glass-card p-10 rounded-[3rem] bg-white dark:bg-slate-900 shadow-xl space-y-6">
              <h3 className="text-2xl font-black dark:text-white">Reglas del alojamiento</h3>
              <ul className="space-y-4">
                {property.rules && property.rules.length > 0 ? (
                  property.rules.map((rule, idx) => (<li key={idx} className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-bold"><CheckCircle size={18} className="text-pink-500" /> {rule}</li>))
                ) : (<li className="text-slate-400 font-bold italic">No hay reglas específicas definidas por el anfitrión.</li>)}
              </ul>
           </div>
        </div>
        <div className="space-y-12">
          <div>
            <div className="flex items-center gap-3 mb-4"><span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{property.category}</span><span className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Star size={12} fill="currentColor"/> {property.rating}</span></div>
            <h1 className="text-6xl font-black mb-6 tracking-tight text-slate-900 dark:text-white leading-tight">{property.title}</h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-bold mb-8 flex items-center gap-2"><MapPin size={24} className="text-pink-500" /> {property.location}</p>
            <div className="flex flex-wrap gap-4">{property.amenities.map(a => (<span key={a} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-black uppercase dark:text-slate-300 shadow-sm">{a}</span>))}</div>
          </div>
          <div className="glass-card p-12 rounded-[4rem] shadow-2xl bg-white dark:bg-slate-900 border-none flex flex-col gap-8">
            <div className="flex justify-between items-end border-b dark:border-slate-800 pb-6"><div><p className="text-4xl font-black text-slate-900 dark:text-white">€{property.pricePerNight}</p><p className="text-xs font-black uppercase text-slate-400">por noche</p></div><div className="text-right"><p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">€{calculateTotalPrice()}</p><p className="text-xs font-black uppercase text-slate-400">estancia total</p></div></div>
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Entrada</label><input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none font-bold border dark:border-slate-700" /></div><div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Salida</label><input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none font-bold border dark:border-slate-700" /></div><div className="col-span-2 space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-1">Huéspedes</label><select value={guestsCount} onChange={e => setGuestsCount(Number(e.target.value))} className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none font-bold border dark:border-slate-700 appearance-none">{[...Array(property.maxGuests)].map((_, i) => <option key={i+1} value={i+1}>{i+1} Huésped{i > 0 ? 'es' : ''}</option>)}</select></div></div>
            {isActuallyVerified ? (
              <div className="flex flex-col gap-4">
                <button onClick={handleBookingClick} className="w-full py-6 rounded-[2.5rem] bg-pink-500 text-white font-black text-2xl shadow-xl hover:bg-pink-600 active:scale-95 transition-all">Reservar ahora</button>
                <button onClick={() => navigate('/chat')} className="w-full py-4 rounded-[1.5rem] bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-black text-lg shadow-md border border-indigo-100 dark:border-indigo-900/30 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <MessageSquare size={20} /> Contactar Anfitrión
                </button>
              </div>
            ) : (
              <button onClick={() => user ? setIsVerificationModalOpen(true) : navigate('/login', { state: { from: location.pathname } })} disabled={hasPendingVerification} className="w-full py-6 rounded-[2.5rem] bg-indigo-600 text-white font-black text-xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3">{hasPendingVerification ? <><Clock size={24}/> Verificación Pendiente</> : <><ShieldAlert size={24}/> Verificar ID para Reservar</>}</button>
            )}
          </div>
          <div className="space-y-6"><h3 className="text-3xl font-black dark:text-white">Información detallada</h3><p className="text-slate-600 dark:text-slate-400 text-xl leading-relaxed font-medium">{property.description}</p></div>
          <div className="glass-card p-10 rounded-[3.5rem] bg-indigo-600 text-white shadow-2xl relative overflow-hidden group border-none">
            <div className="relative z-10"><div className="flex items-center justify-between mb-6"><h3 className="text-2xl font-black flex items-center gap-3"><Zap size={28} /> Concierge IA</h3><button onClick={handleGetAdvice} disabled={loadingAdvice} className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-xs hover:bg-slate-100 transition-all disabled:animate-pulse shadow-xl">{loadingAdvice ? 'Escaneando...' : 'Pedir Consejo'}</button></div>{advice && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/10 p-6 rounded-[2rem] backdrop-blur-md border border-white/20"><p className="italic font-medium text-lg leading-relaxed">"{advice}"</p></motion.div>)}</div>
          </div>
        </div>
      </div>
      <Modal isOpen={isVerificationModalOpen} onClose={() => setIsVerificationModalOpen(false)} title="Verificar Identidad">
        <form onSubmit={handleSubmitVerification} className="space-y-8 p-4"><p className="text-sm font-bold text-slate-500 dark:text-slate-400">Sube una foto clara de tu DNI o Pasaporte. Esta información solo será visible para el anfitrión.</p><div onClick={() => fileInputRef.current?.click()} className={`border-4 border-dashed rounded-[2.5rem] p-12 text-center cursor-pointer transition-all ${docBase64 ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500/30'}`}>{docBase64 ? (<><CheckCircle size={56} className="mx-auto text-green-500" /><p className="font-black text-xl mt-4 text-green-600">Documento Cargado</p><p className="text-xs text-slate-400 font-bold mt-1">Pulsa para cambiar</p></>) : (<><Upload size={56} className="mx-auto text-slate-300 dark:text-slate-700" /><p className="font-black text-xl mt-4 text-slate-400 dark:text-slate-600">Haz clic para subir documento</p></>)}</div><input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={handleDocUpload} className="hidden" /><button type="submit" className="w-full py-5 rounded-[2rem] bg-indigo-600 text-white font-black text-xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">Enviar para Aprobación</button></form>
      </Modal>
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} total={calculateTotalPrice()} onPaymentSuccess={onPaymentConfirmed} />
    </div>
  );
};

const AuthPage = ({ mode }: { mode: 'login' | 'register' }) => {
  const { setUser, allUsers, setAllUsers } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const redirectPath = location.state?.from || '/';
    const inputEmail = email.trim().toLowerCase();
    
    if (mode === 'login') {
      const found = allUsers.find(u => u.email.trim().toLowerCase() === inputEmail && (u.password === password || password === 'demo'));
      if (found) { 
        setUser(found); 
        if (found.role === UserRole.SUPERADMIN) navigate('/admin');
        else if (found.role === UserRole.HOST) navigate('/host');
        else navigate(redirectPath);
      } else { setError('Email o contraseña incorrectos.'); }
    } else {
      if (allUsers.find(u => u.email.trim().toLowerCase() === inputEmail)) { setError('Este email ya está en uso.'); return; }
      const newUser: UserType = { id: 'u-'+Math.random().toString(36).substr(2, 5), name: name || 'Usuario', email: inputEmail, password, role: UserRole.GUEST, isOnline: true, idVerified: false, avatar: `https://i.pravatar.cc/150?u=${inputEmail}` };
      setAllUsers(prev => [...prev, newUser]);
      setUser(newUser);
      navigate(redirectPath);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md glass-card p-12 rounded-[4rem] shadow-2xl border-none bg-white dark:bg-slate-900">
        <div className="text-center mb-10"><div className="bg-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl"><Lock size={32} /></div><h2 className="text-4xl font-black tracking-tight dark:text-white">{mode === 'login' ? 'Bienvenido' : 'Únete a nosotros'}</h2></div>
        {error && <p className="bg-red-50 dark:bg-red-900/30 text-red-500 p-4 rounded-2xl mb-6 text-xs font-bold border border-red-100 dark:border-red-800/50">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'register' && <input required type="text" placeholder="Nombre completo" value={name} onChange={e => setName(e.target.value)} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none font-bold border dark:border-slate-700" />}
          <input required type="email" placeholder="Email corporativo" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none font-bold border dark:border-slate-700" />
          <div className="relative"><input required type={showPassword ? "text" : "password"} placeholder="Contraseña segura" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none font-bold border dark:border-slate-700 pr-14" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
          <button type="submit" className="w-full py-6 rounded-[2rem] bg-indigo-600 text-white font-black text-xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">{mode === 'login' ? 'Entrar ahora' : 'Crear mi cuenta'}</button>
        </form>
        <div className="mt-8 text-center text-sm font-bold text-slate-500 dark:text-slate-400">{mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya eres miembro? '}<Link to={mode === 'login' ? '/register' : '/login'} state={location.state} className="text-pink-500 hover:underline">{mode === 'login' ? 'Regístrate aquí' : 'Inicia sesión'}</Link></div>
      </motion.div>
    </div>
  );
};

const SettingsPage = () => {
  const { user, setUser, bookings, properties, setAllUsers } = useApp();
  const [activeTab, setActiveTab] = useState('profile');
  const [editingProfile, setEditingProfile] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempEmail, setTempEmail] = useState('');

  const userBookings = bookings.filter(b => b.guestId === user?.id);
  const userFavs = properties.filter(p => p.isWatchlisted);

  useEffect(() => {
    if (user) {
      setTempName(user.name);
      setTempEmail(user.email);
    }
  }, [user, editingProfile]);

  const saveProfile = () => {
    if (!user) return;
    const updatedUser = { ...user, name: tempName, email: tempEmail.trim().toLowerCase() };
    setUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    setEditingProfile(false);
  };

  const handleAvatarUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedUser = { ...user, avatar: reader.result as string };
        setUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-12 py-24 bg-slate-50 dark:bg-slate-950 transition-colors min-h-screen">
      <h1 className="text-6xl font-black mb-16 tracking-tight dark:text-white">Mi Panel de Control</h1>
      <div className="flex gap-4 mb-16 overflow-x-auto pb-4 no-scrollbar">
        {[{ id: 'profile', label: 'Mi Perfil', icon: <UserIcon size={18}/> }, { id: 'bookings', label: 'Mis Reservas', icon: <Calendar size={18}/> }, { id: 'favorites', label: 'Favoritos', icon: <Heart size={18}/> }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-10 py-5 rounded-[2rem] font-black text-xs uppercase transition-all border-2 flex items-center gap-3 ${activeTab === t.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl scale-105' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-indigo-600/30'}`}>{t.icon}{t.label}</button>
        ))}
      </div>
      <div className="space-y-10">
        {activeTab === 'profile' && (
          <section className="glass-card p-12 rounded-[4rem] shadow-2xl bg-white dark:bg-slate-900 border-none animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black flex items-center gap-4 dark:text-white"><UserIcon className="text-pink-500" size={32}/> Información Personal</h2>
              <button onClick={() => editingProfile ? saveProfile() : setEditingProfile(true)} className="px-8 py-3 rounded-2xl bg-indigo-600 text-white font-black text-sm hover:bg-indigo-700 transition-all shadow-lg">
                {editingProfile ? 'Guardar Cambios' : 'Editar Perfil'}
              </button>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="relative group"><img src={user?.avatar} className="w-48 h-48 rounded-[3.5rem] object-cover shadow-2xl border-4 border-white dark:border-slate-800 transition-transform group-hover:scale-105" alt="" /><label className="absolute bottom-2 right-2 bg-indigo-600 text-white p-4 rounded-3xl shadow-xl cursor-pointer hover:bg-indigo-700 transition-all active:scale-90"><Upload size={24}/><input type="file" accept="image/*" onChange={handleAvatarUpdate} className="hidden" /></label></div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Nombre Completo</label>
                  {editingProfile ? (
                    <input value={tempName} onChange={e => setTempName(e.target.value)} className="w-full p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white font-black text-xl shadow-inner border dark:border-slate-700 focus:ring-2 ring-indigo-500 outline-none" />
                  ) : (
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white font-black text-xl shadow-inner border dark:border-slate-700">{user?.name}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Correo</label>
                  {editingProfile ? (
                    <input value={tempEmail} onChange={e => setTempEmail(e.target.value)} className="w-full p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white font-black text-xl shadow-inner border dark:border-slate-700 focus:ring-2 ring-indigo-500 outline-none" />
                  ) : (
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white font-black text-xl shadow-inner border dark:border-slate-700">{user?.email}</div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {userBookings.map(b => {
              const p = properties.find(x => x.id === b.propertyId);
              return (
                <div key={b.id} className="glass-card p-8 rounded-[3rem] shadow-xl bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center gap-8 border-none">
                  <img src={p?.images[0]} className="w-32 h-32 rounded-3xl object-cover shadow-lg" alt="" />
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="font-black text-2xl dark:text-white mb-1">{p?.title}</h4>
                    <p className="text-slate-400 font-bold text-sm mb-4"><Calendar size={16} className="inline mr-2"/> {b.checkIn} — {b.checkOut}</p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                       <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${b.status === 'paid' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : b.status === 'pending' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                         Estado Pago: {b.status === 'pending' ? 'Esperando Aprobación' : b.status === 'paid' ? 'Completado' : b.status}
                       </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400">€{b.totalPrice}</p>
                  </div>
                </div>
              );
            })}
            {userBookings.length === 0 && <div className="text-center py-40 bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl border-none"><Calendar size={64} className="mx-auto text-slate-200 dark:text-slate-800 mb-6" /><p className="font-black text-2xl text-slate-400">Aún no tienes ninguna reserva.</p><Link to="/" className="mt-8 inline-block bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all">Explorar Destinos</Link></div>}
          </div>
        )}
        {activeTab === 'favorites' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-4">
            {userFavs.map(p => (<Link key={p.id} to={`/property/${p.id}`} className="glass-card p-6 rounded-[3rem] bg-white dark:bg-slate-900 shadow-xl block hover:scale-[1.02] transition-all border-none group"><div className="relative overflow-hidden rounded-[2rem] mb-6"><img src={p.images[0]} className="w-full h-56 object-cover transition-transform group-hover:scale-110" alt="" /></div><h4 className="font-black text-2xl dark:text-white mb-2">{p.title}</h4><p className="text-slate-400 font-bold text-sm mb-6 flex items-center gap-2"><MapPin size={16}/> {p.location}</p><p className="text-2xl font-black text-pink-500">€{p.pricePerNight} <span className="text-xs text-slate-400">/ noche</span></p></Link>))}
            {userFavs.length === 0 && <div className="col-span-full text-center py-40 bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl border-none"><Heart size={64} className="mx-auto text-slate-200 dark:text-slate-800 mb-6" /><p className="font-black text-2xl text-slate-400">No has guardado favoritos todavía.</p></div>}
          </div>
        )}
      </div>
    </div>
  );
};

const ChatPage = () => {
  const { user, chatThreads, chatMessages, sendChatMessage, allUsers } = useApp();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const visibleThreads = chatThreads.filter(t => {
      if (user?.role === UserRole.SUPERADMIN) return true;
      if (user?.role === UserRole.HOST) return t.participantId.includes('host') || t.participantId === 'u-guest';
      return t.participantId === 'u-host' || t.participantId === 'u-admin';
  });

  const activeThread = chatThreads.find(t => t.id === activeThreadId);
  const activeMessages = chatMessages.filter(m => m.threadId === activeThreadId);

  const handleSend = () => { 
    if (!messageText.trim() || !activeThreadId) return; 
    sendChatMessage(activeThreadId, messageText); 
    setMessageText(''); 
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex h-[calc(100vh-80px)] overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-96 border-r dark:border-slate-800 flex flex-col h-full bg-white dark:bg-slate-900">
        <div className="p-8 border-b dark:border-slate-800"><h2 className="text-3xl font-black dark:text-white tracking-tight">Mensajes</h2></div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {visibleThreads.map(t => { 
            const p = allUsers.find(u => u.id === t.participantId); 
            return (
              <button key={t.id} onClick={() => setActiveThreadId(t.id)} className={`w-full flex items-center gap-4 p-5 rounded-[2.5rem] transition-all border-none ${activeThreadId === t.id ? 'bg-indigo-600 text-white shadow-xl' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'}`}>
                <img src={p?.avatar || `https://i.pravatar.cc/150?u=${t.id}`} className="w-14 h-14 rounded-2xl object-cover shadow-md border-2 border-white/20" alt="" />
                <div className="text-left flex-1 min-w-0">
                  <p className={`font-black truncate ${activeThreadId === t.id ? 'text-white' : 'dark:text-white'}`}>{p?.name || 'Usuario'}</p>
                  <p className={`text-xs truncate opacity-70 ${activeThreadId === t.id ? 'text-white/80' : ''}`}>{t.lastMessage}</p>
                </div>
              </button>
            ); 
          })}
          {visibleThreads.length === 0 && <p className="text-center py-20 text-slate-400 font-bold">No tienes chats activos.</p>}
        </div>
      </div>
      <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-950/50">
        {activeThreadId ? (
          <>
            <div className="p-6 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center gap-4 shadow-sm">
               <img src={allUsers.find(u => u.id === activeThread?.participantId)?.avatar} className="w-12 h-12 rounded-2xl object-cover shadow-lg border-2 border-indigo-500/10" alt="" />
               <div className="flex-1">
                  <h3 className="font-black text-xl dark:text-white">{allUsers.find(u => u.id === activeThread?.participantId)?.name}</h3>
                  <p className="text-[10px] font-black uppercase text-green-500 mt-1 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> Activo ahora</p>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
              {activeMessages.map(m => (
                <div key={m.id} className={`flex ${m.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-6 rounded-[2.5rem] max-w-[70%] shadow-lg border-none ${m.senderId === user?.id ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none'}`}>
                    <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                    <p className={`text-[8px] font-black uppercase tracking-widest mt-2 ${m.senderId === user?.id ? 'text-white/50' : 'text-slate-400'}`}>{m.timestamp}</p>
                  </div>
                </div>
              ))}
              {activeMessages.length === 0 && <div className="text-center py-20 text-slate-400 font-bold italic opacity-50">Escribe tu primer mensaje para comenzar la conversación.</div>}
            </div>
            <div className="p-8 bg-white dark:bg-slate-900 border-t dark:border-slate-800 flex gap-4">
              <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center p-2 shadow-inner border dark:border-slate-700">
                <input ref={inputRef} value={messageText} onChange={e => setMessageText(e.target.value)} onKeyDown={handleKeyDown} placeholder="Escribe un mensaje..." className="flex-1 bg-transparent border-none outline-none font-bold dark:text-white px-6" />
                <button onClick={handleSend} className="bg-indigo-600 text-white p-5 rounded-full shadow-2xl hover:bg-indigo-700 active:scale-90 transition-all focus:outline-none"><Send size={24}/></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-30">
            <MessageCircle size={120} className="text-slate-300 mb-6" />
            <h2 className="text-4xl font-black text-slate-400">Tus conversaciones</h2>
            <p className="text-slate-400 font-bold max-w-sm mt-4">Selecciona un chat del panel lateral para hablar con el anfitrión o soporte.</p>
          </div>
        )}
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
    { id: 't1', participantId: 'u-host', lastMessage: '¿Alguna duda?', timestamp: '10:30 AM', unreadCount: 0 },
    { id: 't-support', participantId: 'u-admin', lastMessage: 'Hola, ¿en qué podemos ayudarte?', timestamp: 'Now', unreadCount: 0 }
  ]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => { if (isDark) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); }, [isDark]);
  
  const sendChatMessage = (threadId: string, text: string) => {
      if (!user) return;
      const m: ChatMessage = { 
        id: 'm'+Date.now() + Math.random().toString(36).substr(2, 5), 
        threadId,
        senderId: user.id, 
        text, 
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
        type: 'text' as const 
      };
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
    }}>{children}</AppContext.Provider>
  );
};

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/admin/*" element={<div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors"><AdminSidebar /><Routes><Route index element={<DashboardHome />} /><Route path="properties" element={<AdminPropertiesView />} /><Route path="bookings" element={<AdminBookingsView />} /><Route path="verifications" element={<AdminVerificationsView />} /><Route path="chat" element={<ChatPage />} /><Route path="config" element={ <div className="p-20"><h1 className="text-3xl font-black dark:text-white">Ajustes del Sitio</h1></div>} /></Routes></div>} />
          <Route path="/host/*" element={<div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors"><AdminSidebar /><Routes><Route index element={<DashboardHome />} /><Route path="properties" element={<AdminPropertiesView />} /><Route path="bookings" element={<AdminBookingsView />} /><Route path="verifications" element={<AdminVerificationsView />} /><Route path="chat" element={<ChatPage />} /></Routes></div>} />
          <Route path="*" element={<div className="min-h-screen bg-slate-50 dark:bg-slate-950 dark:text-slate-100 transition-colors"><Navbar /><Routes><Route path="/" element={<LandingPage />} /><Route path="/property/:id" element={<PropertyDetailPage />} /><Route path="/settings" element={<SettingsPage />} /><Route path="/login" element={<AuthPage mode="login" />} /><Route path="/register" element={<AuthPage mode="register" />} /><Route path="/chat" element={<ChatPage />} /><Route path="*" element={<Navigate to="/" />} /></Routes></div>} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
