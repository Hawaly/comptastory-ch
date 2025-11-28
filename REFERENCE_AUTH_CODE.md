# Référence du Code d'Authentification

Ce document contient le code complet de tous les fichiers liés à l'authentification.

---

## 📦 Installation des dépendances

```bash
npm install bcryptjs @types/bcryptjs jose
```

---

## 🔧 Configuration

### `.env.local`

```env
# Configuration Supabase (existant)
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Configuration JWT (NOUVEAU)
JWT_SECRET=your-very-long-random-secret-key-here
```

Générez JWT_SECRET avec :
```bash
openssl rand -base64 32
```

---

## 📄 Fichiers à créer

### 1. `lib/auth.ts`

```typescript
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

/**
 * Récupère la clé secrète JWT
 * Lève une erreur si elle n'est pas définie
 */
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET must be defined in environment variables');
  }
  return secret;
}

// Durée de validité du token (7 jours)
const JWT_EXPIRATION = '7d';

// Nom du cookie de session
export const SESSION_COOKIE_NAME = 'session';

// Type pour les données du token
export interface SessionData {
  userId: string;
  username: string;
}

/**
 * Crée un JWT signé avec les données de l'utilisateur
 */
export async function createToken(data: SessionData): Promise<string> {
  const secret = new TextEncoder().encode(getJWTSecret());
  
  const token = await new SignJWT({ ...data })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(secret);
  
  return token;
}

/**
 * Vérifie et décode un JWT
 */
export async function verifyToken(token: string): Promise<SessionData | null> {
  try {
    const secret = new TextEncoder().encode(getJWTSecret());
    const { payload } = await jwtVerify(token, secret);
    
    return {
      userId: payload.userId as string,
      username: payload.username as string,
    };
  } catch {
    // Token invalide ou expiré
    return null;
  }
}

/**
 * Crée un cookie de session avec le token JWT
 */
export async function createSession(sessionData: SessionData): Promise<void> {
  const token = await createToken(sessionData);
  const cookieStore = await cookies();
  
  // Cookie HttpOnly, Secure en production
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 jours en secondes
    path: '/',
  });
}

/**
 * Récupère la session actuelle depuis le cookie
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!sessionCookie?.value) {
    return null;
  }
  
  return await verifyToken(sessionCookie.value);
}

/**
 * Supprime le cookie de session
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}
```

---

### 2. `app/api/login/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabaseClient';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Récupération des données du formulaire
    const body = await request.json();
    const { username, password } = body;

    // Validation des champs
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username et password sont requis' },
        { status: 400 }
      );
    }

    // Recherche de l'utilisateur dans Supabase
    const { data: users, error: dbError } = await supabase
      .from('app_user')
      .select('id, username, password_hash, is_active')
      .eq('username', username)
      .eq('is_active', true)
      .limit(1);

    // Gestion des erreurs de base de données
    if (dbError) {
      console.error('Erreur Supabase:', dbError);
      return NextResponse.json(
        { error: 'Erreur lors de la connexion à la base de données' },
        { status: 500 }
      );
    }

    // Vérification si l'utilisateur existe
    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Comparaison du mot de passe avec bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    // Création de la session
    await createSession({
      userId: user.id,
      username: user.username,
    });

    // Réponse de succès
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
      },
    });

  } catch (error) {
    console.error('Erreur lors du login:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    );
  }
}
```

---

### 3. `app/api/logout/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';

export async function POST() {
  try {
    // Suppression du cookie de session
    await destroySession();

    return NextResponse.json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (error) {
    console.error('Erreur lors du logout:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la déconnexion' },
      { status: 500 }
    );
  }
}
```

---

### 4. `middleware.ts` (à la racine du projet)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, SESSION_COOKIE_NAME } from '@/lib/auth';

// Routes publiques (accessibles sans authentification)
const PUBLIC_ROUTES = ['/login'];

// Routes API publiques
const PUBLIC_API_ROUTES = ['/api/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Vérifier si c'est une route publique
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  const isPublicApiRoute = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));

  // Ne pas protéger les routes publiques et les assets
  if (isPublicRoute || isPublicApiRoute || pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  // Récupérer le cookie de session
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  // Si pas de cookie, rediriger vers login
  if (!sessionCookie?.value) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Vérifier la validité du token
  const session = await verifyToken(sessionCookie.value);

  // Si le token est invalide, rediriger vers login
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    // Supprimer le cookie invalide
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  // Si l'utilisateur est authentifié et essaie d'accéder à /login, rediriger vers dashboard
  if (pathname === '/login') {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Utilisateur authentifié, continuer
  return NextResponse.next();
}

// Configuration du matcher pour appliquer le middleware
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf :
     * - API routes (api/)
     * - Static files (_next/static)
     * - Image optimization files (_next/image)
     * - Favicon
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## 📝 Fichiers à modifier

### 5. `app/(auth)/login/page.tsx` (remplacer le contenu)

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue");
        setIsLoading(false);
        return;
      }

      // Connexion réussie, redirection vers le dashboard
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Impossible de se connecter au serveur");
      setIsLoading(false);
    }
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nom d&apos;utilisateur
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={isLoading}
              autoComplete="username"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connexion en cours...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Se connecter</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

### 6. `components/layout/Sidebar.tsx` (modifications)

Ajoutez l'import de `LogOut` et `useRouter` :

```typescript
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  Receipt, 
  Settings,
  LogOut  // AJOUTER
} from "lucide-react";
```

Ajoutez la fonction `handleLogout` dans le composant :

```typescript
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();  // AJOUTER

  // AJOUTER cette fonction
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
    // ... reste du code
  );
}
```

Remplacez la section "User Info / Footer" par :

```typescript
{/* User Info / Footer */}
<div className="p-4 border-t border-gray-800 space-y-2">
  <div className="flex items-center space-x-3 px-4 py-2">
    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
      <span className="text-sm font-medium">A</span>
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium">Admin</p>
      <p className="text-xs text-gray-400">Administrateur</p>
    </div>
  </div>
  
  {/* Logout Button */}
  <button
    onClick={handleLogout}
    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
  >
    <LogOut className="w-5 h-5" />
    <span className="font-medium">Déconnexion</span>
  </button>
</div>
```

---

### 7. `lib/supabaseClient.ts` (modification)

Remplacez tout le contenu par :

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Client Supabase singleton
let supabaseInstance: SupabaseClient | null = null;

/**
 * Récupère ou crée le client Supabase
 */
function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Récupération des variables d'environnement
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Vérification que les variables sont définies
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Les variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définies dans .env.local'
    );
  }

  // Création du client Supabase
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// Export du client via un getter
export const supabase = new Proxy({} as SupabaseClient, {
  get: (_, prop) => {
    const client = getSupabaseClient();
    return client[prop as keyof SupabaseClient];
  },
});
```

---

## 🔨 Script helper

### `scripts/hash-password.js`

```javascript
/**
 * Script pour générer un hash bcrypt d'un mot de passe
 * 
 * Usage:
 *   node scripts/hash-password.js monmotdepasse
 * 
 * Ou sans argument pour utiliser le mot de passe par défaut (admin123):
 *   node scripts/hash-password.js
 */

const bcrypt = require('bcryptjs');

// Récupérer le mot de passe depuis les arguments ou utiliser le défaut
const password = process.argv[2] || 'admin123';

// Générer le hash avec un coût de 10 (balance entre sécurité et performance)
const hash = bcrypt.hashSync(password, 10);

console.log('\n🔐 Hash bcrypt généré :\n');
console.log('Mot de passe:', password);
console.log('Hash:', hash);
console.log('\nCopiez ce hash dans votre table app_user (colonne password_hash)\n');

// Vérification que le hash fonctionne
const isValid = bcrypt.compareSync(password, hash);
console.log('✅ Vérification:', isValid ? 'Le hash est valide' : '❌ Erreur de hash');
```

---

## ✅ Vérification

Après avoir créé tous ces fichiers :

```bash
# Vérifier que ça compile
npm run build

# Démarrer en dev
npm run dev

# Tester le login
# 1. Allez sur http://localhost:3000
# 2. Vous serez redirigé vers /login
# 3. Entrez vos credentials
# 4. Vous serez redirigé vers /dashboard
```

---

**Tous les fichiers sont maintenant en place pour un système d'authentification complet et sécurisé !**


