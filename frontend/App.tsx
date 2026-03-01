
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
  Coffee, Bath, Laptop, Snowflake, HelpCircle, MessageSquare, ShieldCheck as VerifiedIcon, CreditCard as PaymentIcon,
  Compass, ZapIcon, ArrowRight, Shield, Bell, Sparkles, Layout, Settings, Layers, Folder, UserCheck,
  BookOpen, Mail, PhoneCall, Globe2, ShieldAlert as PolicyIcon, FileCheck
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

// --- Animations ---
const springTransition = { type: "spring", stiffness: 300, damping: 30 };

// --- Global UI Components ---

const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false, type = 'button' }: any) => {
  const base = "inline-flex items-center justify-center font-semibold transition-all rounded-lg disabled:opacity-50 active:scale-[0.98]";
  const variants: any = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
    secondary: "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 shadow-sm",
    ghost: "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400",
    outline: "border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
  };
  const sizes: any = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
};

// Fix: Use 'any' for props to allow 'children' and 'key' without TypeScript errors in JSX mapping
const Card = ({ children, className = "" }: any) => (
  <div className={`saas-card ${className}`}>{children}</div>
);

// Fix: Use 'any' for props to allow 'children' and 'key' without TypeScript errors in JSX mapping
const Badge = ({ children, variant = "default" }: any) => {
  const variants: any = {
    default: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    primary: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${variants[variant]}`}>
      {children}
    </span>
  );
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children?: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }} transition={springTransition} className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 dark:border-zinc-900">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"><X size={18} /></button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const PaymentModal = ({ isOpen, onClose, total, onPaymentSuccess }: { isOpen: boolean; onClose: () => void; total: number; onPaymentSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);
  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onPaymentSuccess();
      onClose();
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Secure Checkout">
      <form onSubmit={handlePay} className="space-y-4">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg flex justify-between items-center">
          <span className="text-zinc-500 font-medium">Total Amount</span>
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">€{total}</span>
        </div>
        <div className="space-y-3">
          <input required placeholder="Cardholder Name" className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 ring-indigo-500/20 outline-none transition-all text-sm" />
          <div className="relative">
            <input required placeholder="Card Number" className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 ring-indigo-500/20 outline-none transition-all text-sm" />
            <PaymentIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="MM/YY" className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 ring-indigo-500/20 outline-none transition-all text-sm" />
            <input required placeholder="CVC" className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 ring-indigo-500/20 outline-none transition-all text-sm" />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full py-3">
          {loading ? "Processing..." : `Pay €${total}`}
        </Button>
        <p className="text-[10px] text-center text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-2">
          <Lock size={10} /> Fully Encrypted PCI DSS Compliant
        </p>
      </form>
    </Modal>
  );
};

// --- Main Layout Components ---

const Navbar = () => {
  const { user, setUser, isDark, toggleTheme, siteConfig } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const isPanel = location.pathname.startsWith('/admin') || location.pathname.startsWith('/host');

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <Compass size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight">{siteConfig.siteName}</span>
          </Link>
          {!isPanel && (
            <nav className="hidden md:flex items-center gap-1">
              <Link to="/" className="px-3 py-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-md transition-colors">Explorer</Link>
              <Link to="/resources" className="px-3 py-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-md transition-colors">Resources</Link>
              <Link to="/chat" className="px-3 py-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-md transition-colors">Support</Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md transition-colors">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-2" />

          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold leading-none">{user.name}</p>
                <p className="text-[10px] text-zinc-400 font-medium uppercase mt-0.5">{user.role}</p>
              </div>
              <div className="group relative">
                <img src={user.avatar} className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 object-cover cursor-pointer hover:ring-2 ring-indigo-500/20 transition-all" />
                <div className="absolute right-0 top-full pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Card className="p-1.5 shadow-xl border-zinc-200 dark:border-zinc-800">
                    <Link to="/settings" className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-md transition-colors"><Settings size={16} /> Preferences</Link>
                    {user.role === UserRole.SUPERADMIN && <Link to="/admin" className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-md transition-colors"><Shield size={16} /> Admin Panel</Link>}
                    {user.role === UserRole.HOST && <Link to="/host" className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-md transition-colors"><Layout size={16} /> Host Panel</Link>}
                    <div className="h-px bg-zinc-100 dark:bg-zinc-900 my-1.5" />
                    <button onClick={() => { setUser(null); navigate('/'); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors"><LogOut size={16} /> Logout</button>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button onClick={() => navigate('/login')} variant="ghost" size="sm">Log in</Button>
              <Button onClick={() => navigate('/register')} size="sm">Get Started</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const Sidebar = () => {
  const { user } = useApp();
  const location = useLocation();
  const isAdmin = user?.role === UserRole.SUPERADMIN;
  const prefix = isAdmin ? '/admin' : '/host';

  const items = [
    { label: 'Overview', icon: <BarChart3 size={18}/>, path: prefix },
    { label: 'Properties', icon: <Layers size={18}/>, path: `${prefix}/properties` },
    { label: 'Bookings', icon: <Calendar size={18}/>, path: `${prefix}/bookings` },
    { label: 'Identities', icon: <UserCheck size={18}/>, path: `${prefix}/verifications` },
    { label: 'Messages', icon: <MessageCircle size={18}/>, path: `${prefix}/chat` },
    { label: 'Site Config', icon: <Settings size={18}/>, path: `/admin/config`, adminOnly: true },
  ];

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-screen fixed left-0 top-0 pt-20">
      <div className="px-4 flex-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {items.filter(i => !i.adminOnly || isAdmin).map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${active ? 'sidebar-active' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}>
                {item.icon} {item.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="p-4 border-t border-zinc-100 dark:border-zinc-900">
        <Card className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border-none">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">System Online</span>
          </div>
        </Card>
      </div>
    </aside>
  );
};

// --- Content Views ---

const LandingPage = () => {
  const { properties } = useApp();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const filtered = properties.filter(p => activeCategory === 'Todos' || p.category === activeCategory);

  const blogPosts = [
    { title: "Top 10 Vacation Spots for 2026", excerpt: "Discover the most trending destinations for your next getaway.", date: "March 1, 2026", author: "Travel Guru" },
    { title: "How to Maximize Your Rental Income", excerpt: "Expert tips for hosts to increase their property's value and bookings.", date: "Feb 25, 2026", author: "Host Expert" },
    { title: "Sustainable Travel: A Guide", excerpt: "Learn how to travel responsibly and reduce your carbon footprint.", date: "Feb 20, 2026", author: "Eco Traveler" }
  ];

  return (
    <main className="pt-24 pb-20 max-w-[1440px] mx-auto px-6">
      {/* Hero Section */}
      <section className="relative mb-16 rounded-2xl overflow-hidden bg-zinc-900 py-24 px-8 text-center border border-zinc-800 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 to-zinc-900 z-0 opacity-80" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Management platform for <span className="text-indigo-400">elite stays.</span>
          </h1>
          <p className="text-zinc-400 text-lg font-medium leading-relaxed">
            The modern infrastructure for vacation rental operators. Experience seamless booking and high-fidelity administration.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <div className="flex-1 w-full max-w-sm bg-zinc-800/50 backdrop-blur-md border border-zinc-700 rounded-lg p-1 flex items-center">
              <div className="flex-1 flex items-center px-3"><Search size={16} className="text-zinc-500"/><input placeholder="Search properties..." className="bg-transparent border-none outline-none text-sm text-white px-2 py-2 w-full"/></div>
              <Button size="sm" className="hidden sm:inline-flex">Search</Button>
            </div>
            <Button variant="outline" className="w-full sm:w-auto text-white border-zinc-700 hover:bg-zinc-800">Become a Host</Button>
          </div>
        </div>
      </section>

      {/* Categories & Properties */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto no-scrollbar pb-2">
        <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setActiveCategory(c)} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${activeCategory === c ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-20">
        {filtered.map(p => (
          <Link key={p.id} to={`/property/${p.id}`} className="group space-y-3">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
              <img src={p.images[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
              <div className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-lg text-white border border-white/20"><Heart size={16} /></div>
              <div className="absolute bottom-3 left-3"><Badge variant="primary">{p.category}</Badge></div>
            </div>
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-base truncate pr-4">{p.title}</h3>
                <div className="flex items-center gap-1 text-sm font-bold"><Star size={14} className="fill-amber-400 text-amber-400" /> {p.rating}</div>
              </div>
              <p className="text-zinc-500 text-xs font-medium flex items-center gap-1"><MapPin size={12}/> {p.location}</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-lg font-extrabold">€{p.pricePerNight}</span>
                <span className="text-zinc-400 text-xs font-medium">/ night</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Blog/Resources Section - Added for Publisher Content */}
      <section className="py-20 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Travel Insights</h2>
            <p className="text-zinc-500 font-medium">Expert advice and destination guides for the modern traveler.</p>
          </div>
          <Link to="/resources" className="text-indigo-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">View all articles <ArrowRight size={18}/></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post, i) => (
            <Card key={i} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                <Calendar size={12}/> {post.date} • <UserIcon size={12}/> {post.author}
              </div>
              <h3 className="text-xl font-bold leading-tight">{post.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{post.excerpt}</p>
              <Link to="/resources" className="inline-block text-sm font-bold text-indigo-600 hover:underline">Read more</Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust & Features Section */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl px-8 border border-zinc-200 dark:border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center"><ShieldCheck size={24}/></div>
            <h3 className="text-xl font-bold">Verified Stays</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">Every property on our platform undergoes a rigorous 50-point inspection to ensure quality and safety.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center"><Zap size={24}/></div>
            <h3 className="text-xl font-bold">Instant Booking</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">No more waiting for host approvals. Book your dream stay instantly with our real-time availability engine.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center"><Heart size={24}/></div>
            <h3 className="text-xl font-bold">24/7 Support</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">Our dedicated concierge team is available around the clock to assist with any requests during your stay.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

const ResourcesPage = () => {
  const articles = [
    { title: "The Ultimate Guide to Vacation Rental Management", content: "Managing a vacation rental can be a lucrative business if done correctly. From setting the right price to providing exceptional guest experiences, there are many factors to consider. In this guide, we'll explore the best practices for property owners to maximize their ROI..." },
    { title: "Top 5 Hidden Gems in Europe for 2026", content: "While Paris and Rome are always popular, 2026 is the year of the hidden gem. Discover the charming coastal towns of Albania, the rugged beauty of the Azores, and the historic streets of Plovdiv, Bulgaria. These destinations offer unique experiences away from the crowds..." },
    { title: "How to Prepare Your Home for Guests", content: "First impressions are everything. Learn how to stage your property, what essential amenities to provide, and how to create a welcome book that guests will love. We'll cover everything from high-quality linens to local recommendations..." },
    { title: "Understanding Vacation Rental Taxes", content: "Taxes can be complicated for rental owners. This article breaks down the different types of taxes you might encounter, including occupancy tax, income tax, and VAT. We'll also provide tips on how to keep accurate records for tax season..." }
  ];

  const faqs = [
    { q: "How do I become a host?", a: "To become a host, simply register for an account and select the 'Host' role. You can then start listing your properties through the Host Panel." },
    { q: "Is my payment secure?", a: "Yes, all payments are processed through our secure PCI-compliant payment gateway. We use end-to-end encryption to protect your financial data." },
    { q: "What is the cancellation policy?", a: "Cancellation policies vary by property. You can find the specific policy for each listing on its detail page under the 'Rules' section." },
    { q: "How do I verify my identity?", a: "You can verify your identity by uploading a government-issued ID in your account settings or when prompted during the booking process for high-value rentals." }
  ];

  return (
    <main className="pt-32 pb-20 max-w-4xl mx-auto px-6 space-y-20">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Resources & Insights</h1>
        <p className="text-zinc-500 text-lg max-w-2xl mx-auto">Deep dives into the world of travel, property management, and elite stays.</p>
      </div>
      
      <div className="space-y-12">
        <h2 className="text-3xl font-bold border-b border-zinc-100 dark:border-zinc-900 pb-4">Latest Articles</h2>
        {articles.map((article, i) => (
          <section key={i} className="space-y-4">
            <h3 className="text-2xl font-bold">{article.title}</h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{article.content}</p>
          </section>
        ))}
      </div>

      <div className="space-y-12">
        <h2 className="text-3xl font-bold border-b border-zinc-100 dark:border-zinc-900 pb-4">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {faqs.map((faq, i) => (
            <div key={i} className="space-y-2">
              <h4 className="font-bold text-lg flex items-center gap-2"><HelpCircle size={18} className="text-indigo-500"/> {faq.q}</h4>
              <p className="text-zinc-500 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

const ContactPage = () => {
  return (
    <main className="pt-32 pb-20 max-w-4xl mx-auto px-6 space-y-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight">Get in touch</h1>
            <p className="text-zinc-500 text-lg">Have questions? We're here to help you find the perfect stay or manage your property.</p>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400"><Mail size={20}/></div>
              <div><p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Email</p><p className="font-bold">support@havenly.com</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400"><PhoneCall size={20}/></div>
              <div><p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Phone</p><p className="font-bold">+1 (555) 123-4567</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400"><Globe2 size={20}/></div>
              <div><p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Office</p><p className="font-bold">123 Elite Way, San Francisco, CA</p></div>
            </div>
          </div>
        </div>
        <Card className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Name</label><input className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none text-sm" placeholder="Your name" /></div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Email</label><input className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none text-sm" placeholder="your@email.com" /></div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Message</label><textarea rows={4} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none text-sm" placeholder="How can we help?" /></div>
          </div>
          <Button className="w-full py-3">Send Message</Button>
        </Card>
      </div>

      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">About Havenly</h2>
        <div className="prose dark:prose-invert max-w-none text-zinc-500 text-center space-y-4">
          <p>Founded in 2024, Havenly was born out of a desire to simplify the vacation rental experience for both hosts and guests. We believe that every stay should be an experience, and every host should have the tools they need to succeed.</p>
          <p>Our team of travel enthusiasts and tech experts works tirelessly to ensure that our platform remains the most reliable and user-friendly in the industry. From our rigorous property verification process to our 24/7 concierge service, we are committed to excellence in everything we do.</p>
        </div>
      </section>
    </main>
  );
};

const PolicyPage = ({ type }: { type: 'privacy' | 'terms' }) => {
  return (
    <main className="pt-32 pb-20 max-w-3xl mx-auto px-6 space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center"><PolicyIcon size={24}/></div>
        <h1 className="text-4xl font-extrabold tracking-tight">{type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}</h1>
      </div>
      <div className="prose dark:prose-invert max-w-none space-y-6 text-zinc-600 dark:text-zinc-400 leading-relaxed">
        <p className="font-bold text-zinc-900 dark:text-zinc-100">Last Updated: March 1, 2026</p>
        <p>At Havenly, we take your {type === 'privacy' ? 'privacy' : 'agreement'} seriously. This document outlines the rules and regulations for the use of Havenly's Website, located at havenly.com.</p>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">1. Introduction</h2>
        <p>By accessing this website we assume you accept these {type === 'privacy' ? 'privacy practices' : 'terms and conditions'}. Do not continue to use Havenly if you do not agree to take all of the {type === 'privacy' ? 'privacy practices' : 'terms and conditions'} stated on this page.</p>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">2. {type === 'privacy' ? 'Data Collection' : 'User Responsibilities'}</h2>
        <p>{type === 'privacy' ? 'We collect several different types of information for various purposes to provide and improve our Service to you.' : 'You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.'}</p>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">3. {type === 'privacy' ? 'Use of Data' : 'Property Listings'}</h2>
        <p>{type === 'privacy' ? 'Havenly uses the collected data for various purposes: To provide and maintain the Service, to notify you about changes to our Service, to provide customer care and support.' : 'Hosts are responsible for the accuracy of their property listings. Havenly reserves the right to remove any listing that violates our quality standards.'}</p>
        <p>For more information, please contact our legal team at legal@havenly.com.</p>
      </div>
    </main>
  );
};

const AdminPropertiesView = () => {
  const { properties, setProperties } = useApp();
  return (
    <div className="pl-64 min-h-screen pt-20 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Property Inventory</h1>
          <Button size="sm"><Plus size={16} className="mr-2"/> Add Property</Button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {properties.map(p => (
            <Card key={p.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={p.images[0]} className="w-16 h-16 rounded-lg object-cover" />
                <div>
                  <h3 className="font-bold text-sm">{p.title}</h3>
                  <p className="text-xs text-zinc-500">{p.location} • €{p.pricePerNight}/night</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm"><Edit size={14}/></Button>
                <Button variant="danger" size="sm" onClick={() => setProperties(prev => prev.filter(x => x.id !== p.id))}><Trash2 size={14}/></Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminVerificationsView = () => {
  const { verifications, updateVerification } = useApp();
  return (
    <div className="pl-64 min-h-screen pt-20 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold tracking-tight">Identity Verifications</h1>
        <div className="space-y-4">
          {verifications.map(v => (
            <Card key={v.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400"><UserCheck size={20}/></div>
                <div>
                  <h3 className="font-bold text-sm">Request #{v.id}</h3>
                  <p className="text-xs text-zinc-500">User ID: {v.userId} • Submitted: {new Date(v.submittedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={v.status === 'approved' ? 'success' : v.status === 'rejected' ? 'danger' : 'warning'}>{v.status}</Badge>
                {v.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="danger" onClick={() => updateVerification(v.id, 'rejected')}>Reject</Button>
                    <Button size="sm" onClick={() => updateVerification(v.id, 'approved')}>Approve</Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
          {verifications.length === 0 && <p className="text-center py-20 text-zinc-400 font-medium">No pending verifications.</p>}
        </div>
      </div>
    </div>
  );
};

const AdminChatView = () => {
  return (
    <div className="pl-64 min-h-screen pt-20 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold tracking-tight">Support Center</h1>
        <Card className="h-[600px] flex items-center justify-center text-zinc-400 flex-col gap-4">
          <MessageSquare size={48} className="opacity-20"/>
          <p className="font-medium">Select a conversation to start messaging</p>
        </Card>
      </div>
    </div>
  );
};

const AdminConfigView = () => {
  const { siteConfig, setSiteConfig } = useApp();
  return (
    <div className="pl-64 min-h-screen pt-20 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold tracking-tight">Site Configuration</h1>
        <Card className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Site Name</label><input value={siteConfig.siteName} onChange={e => setSiteConfig({...siteConfig, siteName: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm" /></div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Currency</label><select value={siteConfig.currency} onChange={e => setSiteConfig({...siteConfig, currency: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm"><option value="USD">USD</option><option value="EUR">EUR</option></select></div>
          </div>
          <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Maintenance Mode</label><div className="flex items-center gap-3 mt-2"><button onClick={() => setSiteConfig({...siteConfig, maintenanceMode: !siteConfig.maintenanceMode})} className={`w-12 h-6 rounded-full transition-colors relative ${siteConfig.maintenanceMode ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-800'}`}><div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${siteConfig.maintenanceMode ? 'translate-x-6' : ''}`} /></button><span className="text-sm font-medium">{siteConfig.maintenanceMode ? 'Enabled' : 'Disabled'}</span></div></div>
          <Button className="w-full">Save Changes</Button>
        </Card>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 py-12">
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none"><Compass size={18} /></div>
            <span className="text-lg font-bold tracking-tight">Havenly</span>
          </Link>
          <p className="text-zinc-500 text-sm leading-relaxed">The premier platform for high-fidelity vacation rental management and elite guest experiences.</p>
        </div>
        <div>
          <h4 className="font-bold text-sm mb-4">Platform</h4>
          <ul className="space-y-2 text-sm text-zinc-500">
            <li><Link to="/" className="hover:text-indigo-600">Explorer</Link></li>
            <li><Link to="/resources" className="hover:text-indigo-600">Resources</Link></li>
            <li><Link to="/contact" className="hover:text-indigo-600">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-zinc-500">
            <li><Link to="/privacy" className="hover:text-indigo-600">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-indigo-600">Terms of Service</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm mb-4">Newsletter</h4>
          <p className="text-zinc-500 text-xs mb-4">Get the latest travel insights delivered to your inbox.</p>
          <div className="flex gap-2"><input placeholder="Email" className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs outline-none" /><Button size="sm">Join</Button></div>
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto px-6 mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
        <span>© 2026 Havenly SaaS. All rights reserved.</span>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-zinc-600">Privacy</Link>
          <Link to="/terms" className="hover:text-zinc-600">Terms</Link>
        </div>
      </div>
    </footer>
  );
};

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, user, verifications, addVerification, setBookings } = useApp();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [docFile, setDocFile] = useState<string | null>(null);

  const property = properties.find(p => p.id === id);
  if (!property) return <div className="pt-32 text-center text-zinc-500">Property not found.</div>;

  const nights = (checkIn && checkOut) ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24))) : 0;
  const total = nights * property.pricePerNight;

  const hostVerification = user && property ? verifications.find(v => v.userId === user.id && v.hostId === property.hostId) : null;
  const isVerified = user?.idVerified || hostVerification?.status === 'approved';

  const onConfirmPayment = () => {
    const booking: Booking = { id: 'b-'+Math.random().toString(36).substring(2, 7), propertyId: property.id, guestId: user!.id, checkIn, checkOut, totalPrice: total, taxAmount: total * 0.1, commissionAmount: total * 0.05, status: 'pending', guestsCount: guests };
    setBookings(prev => [...prev, booking]);
    navigate('/settings');
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) return alert("Upload document first");
    addVerification({ id: 'v'+Date.now(), userId: user!.id, hostId: property.hostId, status: 'pending', documentUrl: docFile, submittedAt: new Date().toISOString() });
    setIsVerifyOpen(false);
  };

  return (
    <div className="pt-24 pb-20 max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-2 mb-2"><Badge variant="primary">{property.category}</Badge><div className="text-zinc-400 text-sm font-medium">• {property.rating} Rating</div></div>
          <h1 className="text-4xl font-extrabold tracking-tight">{property.title}</h1>
          <div className="grid grid-cols-4 gap-2 h-96 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="col-span-3 h-full"><img src={property.images[0]} className="w-full h-full object-cover" /></div>
            <div className="col-span-1 grid grid-rows-2 gap-2 h-full">
              <img src={property.images[1] || property.images[0]} className="w-full h-full object-cover" />
              <img src={property.images[2] || property.images[0]} className="w-full h-full object-cover" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-bold border-b border-zinc-100 dark:border-zinc-900 pb-2">Description</h2>
            <p className="text-zinc-500 leading-relaxed">{property.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 border-zinc-100 dark:border-zinc-900">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-3"><Sparkles size={14} className="text-indigo-500"/> Amenities</h3>
              <div className="flex flex-wrap gap-2">{property.amenities.map(a => <Badge key={a}>{a}</Badge>)}</div>
            </Card>
            <Card className="p-4 border-zinc-100 dark:border-zinc-900">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-3"><Info size={14} className="text-zinc-500"/> Rules</h3>
              <div className="space-y-1.5">{property.rules.map(r => <p key={r} className="text-xs text-zinc-500 flex items-center gap-2"> <div className="w-1 h-1 rounded-full bg-zinc-300"/> {r}</p>)}</div>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24 space-y-6">
            <div className="flex justify-between items-baseline">
              <div className="flex items-baseline gap-1"><span className="text-2xl font-bold">€{property.pricePerNight}</span><span className="text-zinc-400 text-xs">/ night</span></div>
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">Availability</div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Check-in</label><input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm outline-none" /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Check-out</label><input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm outline-none" /></div>
              </div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Guests</label><select value={guests} onChange={e => setGuests(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm outline-none">
                {[...Array(property.maxGuests)].map((_, i) => <option key={i+1} value={i+1}>{i+1} Guest{i > 0 ? 's' : ''}</option>)}
              </select></div>
            </div>
            
            <div className="h-px bg-zinc-100 dark:bg-zinc-900" />
            
            <div className="flex justify-between items-center text-sm font-bold"><span>Total</span><span className="text-lg">€{total}</span></div>
            
            {isVerified ? (
              <Button onClick={() => setIsPaymentOpen(true)} className="w-full py-3" disabled={!nights}>Reserve now</Button>
            ) : (
              <Button onClick={() => user ? setIsVerifyOpen(true) : navigate('/login')} className="w-full py-3" variant="secondary">
                <VerifiedIcon size={16} className="mr-2"/> Verify to book
              </Button>
            )}
          </Card>
        </div>
      </div>

      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} total={total} onPaymentSuccess={onConfirmPayment} />
      <Modal isOpen={isVerifyOpen} onClose={() => setIsVerifyOpen(false)} title="Verify Identity">
        <form onSubmit={handleVerifySubmit} className="space-y-6">
          <p className="text-sm text-zinc-500">Please provide a valid government ID to proceed with high-value rentals.</p>
          <div className="h-48 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer relative overflow-hidden">
            {docFile ? <img src={docFile} className="w-full h-full object-cover" /> : <><Upload className="text-zinc-300"/><span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Click to upload</span></>}
            <input type="file" onChange={e => { const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onloadend = () => setDocFile(r.result as string); r.readAsDataURL(f); } }} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
          <Button type="submit" className="w-full">Submit Verification</Button>
        </form>
      </Modal>
    </div>
  );
};

const DashboardHome = () => {
  const { user, bookings, properties } = useApp();
  const isAdmin = user?.role === UserRole.SUPERADMIN;
  const totalRevenue = bookings.reduce((acc, b) => acc + (b.status === 'paid' ? b.totalPrice : 0), 0);
  
  return (
    <div className="pl-64 min-h-screen pt-20">
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight">Overview</h1>
            <p className="text-zinc-500 font-medium text-sm">Welcome back, {user?.name}</p>
          </div>
          <Button size="sm" variant="secondary"><Activity size={14} className="mr-2"/> Live Logs</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Revenue', val: `€${totalRevenue.toLocaleString()}`, icon: <DollarSign size={18}/>, color: 'text-emerald-500' },
            { label: 'Inventory', val: properties.length, icon: <Layers size={18}/>, color: 'text-indigo-500' },
            { label: 'Active Stay', val: '12', icon: <UserCheck size={18}/>, color: 'text-amber-500' },
            { label: 'Requests', val: '5', icon: <Bell size={18}/>, color: 'text-rose-500' }
          ].map((s, i) => (
            <Card key={i} className="p-5 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{s.label}</span>
                <div className={`${s.color}`}>{s.icon}</div>
              </div>
              <span className="text-2xl font-extrabold">{s.val}</span>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold">Recent Transactions</h3>
              <Button variant="ghost" size="sm">Export CSV</Button>
            </div>
            <div className="space-y-4">
              {bookings.slice(0, 5).map(b => (
                <div key={b.id} className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-900 last:border-none">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500"><CreditCard size={18}/></div>
                    <div>
                      <p className="text-sm font-bold">Booking #{b.id}</p>
                      <p className="text-xs text-zinc-500 font-medium">Guest ID: {b.guestId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-emerald-500">+€{b.totalPrice}</p>
                    <p className="text-[10px] font-bold uppercase text-zinc-400">{b.status}</p>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && <p className="text-center py-10 text-zinc-400 text-sm font-medium italic">No activity registered.</p>}
            </div>
          </Card>
          
          <Card className="p-6 bg-indigo-600 text-white border-none shadow-indigo-200">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center"><Zap size={20}/></div>
              <h3 className="text-xl font-bold tracking-tight">System Notification</h3>
              <p className="text-indigo-100 text-sm font-medium leading-relaxed opacity-90">All property verification procedures have been updated to the 2.4 protocol. Please ensure your documentation is compliant.</p>
              <Button size="sm" className="bg-white text-indigo-600 hover:bg-zinc-100 border-none w-full">Learn More</Button>
            </div>
          </Card>
        </div>
      </div>
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

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const redirectPath = location.state?.from || '/';
    if (mode === 'login') {
      const u = allUsers.find(x => x.email.toLowerCase() === email.toLowerCase().trim() && (x.password === password || password === 'demo'));
      if (u) { setUser(u); navigate(u.role === UserRole.GUEST ? redirectPath : (u.role === UserRole.SUPERADMIN ? '/admin' : '/host')); }
      else alert("Invalid credentials");
    } else {
      const u: UserType = { id: 'u-'+Math.random().toString(36).substring(2,7), name, email: email.trim().toLowerCase(), role: UserRole.GUEST, isOnline: true, idVerified: false, avatar: `https://i.pravatar.cc/150?u=${email}` };
      setAllUsers(prev => [...prev, u]);
      setUser(u);
      navigate(redirectPath);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#fafafa] dark:bg-zinc-950">
      <Link to="/" className="flex items-center gap-2 mb-10 group">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110"><Compass size={22} /></div>
        <span className="text-2xl font-black tracking-tighter uppercase">Havenly</span>
      </Link>
      <Card className="w-full max-w-sm p-8 space-y-6 shadow-2xl">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{mode === 'login' ? 'Welcome back' : 'Create an account'}</h2>
          <p className="text-zinc-500 text-sm font-medium">{mode === 'login' ? 'Enter your details to access the platform' : 'Start managing or booking premium stays'}</p>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          {mode === 'register' && <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Full Name</label><input required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 ring-indigo-500/20 outline-none text-sm" /></div>}
          <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Email address</label><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 ring-indigo-500/20 outline-none text-sm" /></div>
          <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Password</label><input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 ring-indigo-500/20 outline-none text-sm" /></div>
          <Button type="submit" className="w-full py-3">{mode === 'login' ? 'Sign in' : 'Create account'}</Button>
        </form>
        <div className="text-center text-sm font-medium text-zinc-500">
          {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
          <Link to={mode === 'login' ? '/register' : '/login'} className="text-indigo-600 hover:underline">
            {mode === 'login' ? 'Register now' : 'Log in here'}
          </Link>
        </div>
      </Card>
    </div>
  );
};

const SettingsPage = () => {
  const { user, bookings } = useApp();
  const [tab, setTab] = useState('profile');
  const userBookings = bookings.filter(b => b.guestId === user?.id);

  return (
    <main className="pt-24 pb-20 max-w-4xl mx-auto px-6 space-y-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Preferences</h1>
        <p className="text-zinc-500 text-sm font-medium">Manage your personal settings and active stays.</p>
      </div>

      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-px">
        {['profile', 'bookings', 'security'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-bold capitalize transition-all border-b-2 ${tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <Card className="p-8 space-y-8">
          <div className="flex items-center gap-6">
            <img src={user?.avatar} className="w-20 h-20 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold">{user?.name}</h3>
              <p className="text-zinc-500 text-sm font-medium">{user?.email}</p>
              <Badge variant="success">Active Account</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">First Name</label><input disabled value={user?.name.split(' ')[0]} className="w-full px-4 py-2 rounded-lg border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900 text-sm font-medium opacity-60" /></div>
            <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-400 uppercase">Last Name</label><input disabled value={user?.name.split(' ')[1] || ''} className="w-full px-4 py-2 rounded-lg border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900 text-sm font-medium opacity-60" /></div>
          </div>
          <Button variant="secondary" size="sm">Update Profile</Button>
        </Card>
      )}

      {tab === 'bookings' && (
        <div className="space-y-4">
          {userBookings.map(b => (
            <Card key={b.id} className="p-5 flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-bold">Booking #{b.id}</p>
                <p className="text-xs text-zinc-500 font-medium">{b.checkIn} to {b.checkOut}</p>
                <div className="mt-2"><Badge variant={b.status === 'paid' ? 'success' : 'warning'}>{b.status}</Badge></div>
              </div>
              <div className="text-right">
                <p className="text-xl font-extrabold">€{b.totalPrice}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Confirmed Payment</p>
              </div>
            </Card>
          ))}
          {userBookings.length === 0 && <div className="text-center py-20 text-zinc-400 font-medium border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-2xl">No active bookings.</div>}
        </div>
      )}
    </main>
  );
};

// --- Main App Refactor ---

const AppProvider = ({ children }: { children?: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(INITIAL_SITE_CONFIG);
  const [isDark, setIsDark] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [allUsers, setAllUsers] = useState<UserType[]>(MOCK_USERS);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => { 
    if (isDark) document.documentElement.classList.add('dark'); 
    else document.documentElement.classList.remove('dark'); 
  }, [isDark]);

  const sendChatMessage = (threadId: string, text: string) => {
    if (!user) return;
    const m: ChatMessage = { id: 'm'+Date.now(), threadId, senderId: user.id, text, timestamp: new Date().toLocaleTimeString(), type: 'text' };
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

const AdminBookingsView = () => {
  const { bookings, setBookings, properties, allUsers, user } = useApp();
  const isAdmin = user?.role === UserRole.SUPERADMIN;
  const filtered = bookings.filter(b => isAdmin || properties.find(p => p.id === b.propertyId)?.hostId === user?.id);

  return (
    <div className="pl-64 min-h-screen pt-20 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold tracking-tight">Booking Management</h1>
        <div className="space-y-4">
          {filtered.map(b => (
            <Card key={b.id} className="p-4 flex items-center justify-between border-zinc-100 dark:border-zinc-900">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400"><Layers size={20}/></div>
                <div>
                  <h3 className="font-bold text-sm">Booking #{b.id}</h3>
                  <p className="text-xs text-zinc-500 font-medium">Check-in: {b.checkIn}</p>
                </div>
              </div>
              <div className="flex items-center gap-10">
                <div className="text-right">
                  <p className="text-sm font-extrabold">€{b.totalPrice}</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{b.status}</p>
                </div>
                {b.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="danger" onClick={() => setBookings(prev => prev.map(x => x.id === b.id ? {...x, status: 'cancelled'} : x))}><Trash2 size={14}/></Button>
                    <Button size="sm" onClick={() => setBookings(prev => prev.map(x => x.id === b.id ? {...x, status: 'paid'} : x))}>Approve</Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-center py-20 text-zinc-400 font-medium">No bookings found.</p>}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/admin/*" element={<div className="flex bg-[#fafafa] dark:bg-zinc-950 min-h-screen"><Sidebar /><Routes><Route index element={<DashboardHome />} /><Route path="properties" element={<AdminPropertiesView />} /><Route path="bookings" element={<AdminBookingsView />} /><Route path="verifications" element={<AdminVerificationsView />} /><Route path="chat" element={<AdminChatView />} /><Route path="config" element={<AdminConfigView />} /></Routes></div>} />
          <Route path="/host/*" element={<div className="flex bg-[#fafafa] dark:bg-zinc-950 min-h-screen"><Sidebar /><Routes><Route index element={<DashboardHome />} /><Route path="properties" element={<AdminPropertiesView />} /><Route path="bookings" element={<AdminBookingsView />} /><Route path="verifications" element={<AdminVerificationsView />} /><Route path="chat" element={<AdminChatView />} /></Routes></div>} />
          <Route path="*" element={<div className="min-h-screen"><Navbar /><Routes><Route path="/" element={<LandingPage />} /><Route path="/property/:id" element={<PropertyDetailPage />} /><Route path="/settings" element={<SettingsPage />} /><Route path="/login" element={<AuthPage mode="login" />} /><Route path="/register" element={<AuthPage mode="register" />} /><Route path="/chat" element={<AdminChatView />} /><Route path="/resources" element={<ResourcesPage />} /><Route path="/contact" element={<ContactPage />} /><Route path="/privacy" element={<PolicyPage type="privacy" />} /><Route path="/terms" element={<PolicyPage type="terms" />} /><Route path="*" element={<Navigate to="/" />} /></Routes><Footer /></div>} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
