# YourStory Admin - Référence des Fichiers

Ce document contient le contenu complet de tous les fichiers créés ou modifiés.

---

## 📦 Dépendances à installer

```bash
npm install @supabase/supabase-js lucide-react
```

---

## 🔧 Configuration

### `lib/supabaseClient.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Vérification que les variables sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Les variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définies dans .env.local'
  );
}

// Création et export du client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 🎨 Composants de Layout

### `components/layout/Sidebar.tsx`

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  Receipt, 
  Settings 
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/mandats", label: "Mandats", icon: Briefcase },
  { href: "/factures", label: "Factures", icon: FileText },
  { href: "/depenses", label: "Dépenses", icon: Receipt },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">
            YS
          </div>
          <span className="text-xl font-bold">YourStory Admin</span>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info / Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3 px-4 py-2">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">U</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Utilisateur</p>
            <p className="text-xs text-gray-400">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
```

### `components/layout/Header.tsx`

```typescript
"use client";

import { Bell, Search } from "lucide-react";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
```

---

## 📐 Layouts

### `app/(dashboard)/layout.tsx`

```typescript
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
}
```

### `app/(auth)/layout.tsx`

```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      {children}
    </div>
  );
}
```

---

## 📄 Pages

### `app/page.tsx` (modifié)

```typescript
import { redirect } from "next/navigation";

export default function Home() {
  // Rediriger vers le dashboard par défaut
  redirect("/dashboard");
}
```

### `app/(auth)/login/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de connexion à implémenter plus tard
    console.log("Login attempt:", { email, password });
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-xl p-8">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mb-4">
            <span className="text-2xl font-bold text-white">YS</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">YourStory Admin</h1>
          <p className="text-gray-600 mt-2">Connectez-vous à votre compte</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
            </label>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
              Mot de passe oublié ?
            </a>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <LogIn className="w-5 h-5" />
            <span>Se connecter</span>
          </button>
        </form>

        {/* Info Message */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note :</strong> L&apos;authentification sera implémentée dans les prochaines étapes.
          </p>
        </div>
      </div>
    </div>
  );
}
```

### `app/(dashboard)/dashboard/page.tsx`

```typescript
import { Header } from "@/components/layout/Header";

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" />
      <main className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stat Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Clients actifs</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Mandats en cours</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Factures impayées</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">CA du mois</div>
            <div className="text-3xl font-bold text-gray-900">0 €</div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Bienvenue dans YourStory Admin
          </h2>
          <p className="text-gray-600">
            Tableau de bord de gestion de la comptabilité. Les données seront 
            connectées dans les prochaines étapes.
          </p>
        </div>
      </main>
    </>
  );
}
```

### `app/(dashboard)/clients/page.tsx`

```typescript
import { Header } from "@/components/layout/Header";
import { Plus } from "lucide-react";

export default function ClientsPage() {
  return (
    <>
      <Header title="Clients" />
      <main className="p-8">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">
              Gérez vos clients et leurs informations
            </p>
          </div>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nouveau client</span>
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 text-center text-gray-500">
            <p>Aucun client pour le moment.</p>
            <p className="text-sm mt-2">
              Les clients de la base de données s&apos;afficheront ici.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
```

### `app/(dashboard)/mandats/page.tsx`

```typescript
import { Header } from "@/components/layout/Header";
import { Plus } from "lucide-react";

export default function MandatsPage() {
  return (
    <>
      <Header title="Mandats" />
      <main className="p-8">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">
              Gérez les mandats et contrats clients
            </p>
          </div>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nouveau mandat</span>
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 text-center text-gray-500">
            <p>Aucun mandat pour le moment.</p>
            <p className="text-sm mt-2">
              Les mandats de la base de données s&apos;afficheront ici.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
```

### `app/(dashboard)/factures/page.tsx`

```typescript
import { Header } from "@/components/layout/Header";
import { Plus } from "lucide-react";

export default function FacturesPage() {
  return (
    <>
      <Header title="Factures" />
      <main className="p-8">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">
              Gérez vos factures et suivez les paiements
            </p>
          </div>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nouvelle facture</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Factures en attente</div>
            <div className="text-2xl font-bold text-orange-600">0</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Factures payées</div>
            <div className="text-2xl font-bold text-green-600">0</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Total à recevoir</div>
            <div className="text-2xl font-bold text-gray-900">0 €</div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 text-center text-gray-500">
            <p>Aucune facture pour le moment.</p>
            <p className="text-sm mt-2">
              Les factures de la base de données s&apos;afficheront ici.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
```

### `app/(dashboard)/depenses/page.tsx`

```typescript
import { Header } from "@/components/layout/Header";
import { Plus } from "lucide-react";

export default function DepensesPage() {
  return (
    <>
      <Header title="Dépenses" />
      <main className="p-8">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">
              Suivez vos dépenses et catégories
            </p>
          </div>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nouvelle dépense</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Dépenses ce mois</div>
            <div className="text-2xl font-bold text-gray-900">0 €</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Dépenses cette année</div>
            <div className="text-2xl font-bold text-gray-900">0 €</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">Catégories</div>
            <div className="text-2xl font-bold text-gray-900">0</div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 text-center text-gray-500">
            <p>Aucune dépense pour le moment.</p>
            <p className="text-sm mt-2">
              Les dépenses de la base de données s&apos;afficheront ici.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
```

### `app/(dashboard)/settings/page.tsx`

```typescript
import { Header } from "@/components/layout/Header";

export default function SettingsPage() {
  return (
    <>
      <Header title="Paramètres" />
      <main className="p-8">
        <div className="max-w-4xl">
          {/* General Settings */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Paramètres généraux
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Configuration de l&apos;entreprise et paramètres généraux.
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l&apos;agence
                  </label>
                  <input
                    type="text"
                    placeholder="YourStory"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de contact
                  </label>
                  <input
                    type="email"
                    placeholder="contact@yourstory.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Database Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Base de données
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Configuration de la connexion Supabase (lecture seule).
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supabase URL
                  </label>
                  <input
                    type="text"
                    value={process.env.NEXT_PUBLIC_SUPABASE_URL || "Non configuré"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
```

---

## 🎯 Vérification

Après avoir créé tous ces fichiers, testez :

```bash
# Build pour vérifier qu'il n'y a pas d'erreurs
npm run build

# Démarrer en mode dev
npm run dev
```

Toutes les routes devraient être accessibles et fonctionnelles !


