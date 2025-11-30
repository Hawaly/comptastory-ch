"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  Receipt, 
  Settings,
  LogOut,
  ChevronRight,
  Sparkles,
  Menu,
  X
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "from-orange-500 to-orange-600" },
  { href: "/clients", label: "Clients", icon: Users, color: "from-orange-500 to-orange-600" },
  { href: "/mandats", label: "Mandats", icon: Briefcase, color: "from-orange-500 to-orange-600" },
  { href: "/factures", label: "Factures", icon: FileText, color: "from-orange-500 to-orange-600" },
  { href: "/depenses", label: "Dépenses", icon: Receipt, color: "from-orange-500 to-orange-600" },
  { href: "/settings", label: "Paramètres", icon: Settings, color: "from-slate-500 to-slate-600" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fermer le menu mobile lors du changement de page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Empêcher le scroll du body quand le menu mobile est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white flex flex-col shadow-2xl z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo / Brand */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-all duration-300 p-1.5">
              <img 
                src="/images/urstory_black.png" 
                alt="YourStory Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              YourStory
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Comptabilité
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-3">
          Navigation
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-white/10 text-white shadow-lg"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {/* Active indicator */}
              {isActive && (
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b ${item.color}`} />
              )}
              
              {/* Icon container */}
              <div className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
                isActive 
                  ? `bg-gradient-to-br ${item.color} shadow-lg` 
                  : "bg-slate-800/50 group-hover:bg-slate-700/50"
              }`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              </div>
              
              <span className="font-medium flex-1">{item.label}</span>
              
              {/* Arrow on hover/active */}
              <ChevronRight className={`w-4 h-4 transition-all duration-200 ${
                isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'
              }`} />
            </Link>
          );
        })}
      </nav>

      {/* Quick Stats */}
      <div className="px-4 py-3">
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-semibold text-slate-300">Activité du jour</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">3</span>
            <span className="text-sm text-slate-400">nouvelles factures</span>
          </div>
        </div>
      </div>

      {/* User Info / Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/50 mb-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-orange-400 rounded-full border-2 border-slate-800" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Admin</p>
            <p className="text-xs text-slate-400 truncate">Administrateur</p>
          </div>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/30 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-rose-500/20 border border-transparent hover:border-red-500/20 transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 group-hover:text-red-400 transition-colors" />
          <span className="font-medium text-sm group-hover:text-red-400 transition-colors">Déconnexion</span>
        </button>
      </div>
      </aside>
    </>
  );
}

