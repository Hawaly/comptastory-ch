# YourStory Admin - Système d'authentification

## 🎯 Ce qui a été implémenté

Un système d'authentification custom complet basé sur la table `app_user` de Supabase avec :

- ✅ Login avec username/password
- ✅ Validation des credentials avec bcrypt
- ✅ JWT sécurisés avec cookies HttpOnly
- ✅ Protection de toutes les routes (middleware)
- ✅ Déconnexion fonctionnelle
- ✅ Gestion des erreurs et états de chargement

---

## 📁 Fichiers créés/modifiés

### 1. **lib/auth.ts** (nouveau)
Fonctions helper pour la gestion de l'authentification :
- `createToken()` - Création de JWT signés
- `verifyToken()` - Vérification et décodage des JWT
- `createSession()` - Création d'un cookie de session
- `getSession()` - Récupération de la session actuelle
- `destroySession()` - Suppression du cookie de session
- `isAuthenticated()` - Vérification si l'utilisateur est connecté

**Sécurité :**
- JWT signés avec algorithme HS256
- Durée de validité : 7 jours
- Cookies HttpOnly (protection XSS)
- Cookies Secure en production
- SameSite: lax

### 2. **app/api/login/route.ts** (nouveau)
Route API POST pour l'authentification :
1. Récupère username + password du body
2. Vérifie l'utilisateur dans Supabase (table `app_user`)
3. Compare le mot de passe avec bcrypt
4. Crée une session JWT si succès
5. Retourne erreur 401 si échec

**Points importants :**
- Vérifie que `is_active = true`
- Messages d'erreur génériques (sécurité)
- Gestion complète des erreurs DB

### 3. **app/api/logout/route.ts** (nouveau)
Route API POST pour la déconnexion :
- Supprime le cookie de session
- Retourne un message de succès

### 4. **middleware.ts** (nouveau)
Middleware Next.js pour protéger les routes :

**Routes publiques :**
- `/login` - Page de connexion
- `/api/login` - API de login
- Assets Next.js (`_next/*`, `favicon.ico`)

**Comportement :**
- Redirige vers `/login` si pas de session
- Vérifie la validité du JWT
- Supprime les cookies invalides
- Redirige vers `/dashboard` si déjà connecté sur `/login`

### 5. **app/(auth)/login/page.tsx** (modifié)
Page de connexion mise à jour :
- Champ `username` (au lieu d'email)
- Appel à l'API `/api/login`
- Gestion des erreurs avec affichage visuel
- État de chargement avec spinner
- Redirection vers `/dashboard` après succès

### 6. **components/layout/Sidebar.tsx** (modifié)
Ajout d'un bouton de déconnexion :
- Bouton rouge en bas de la sidebar
- Icône LogOut
- Appel à l'API `/api/logout`
- Redirection vers `/login` après déconnexion

### 7. **lib/supabaseClient.ts** (modifié)
Initialisation lazy du client Supabase :
- Évite les erreurs au moment du build
- Client créé seulement au premier accès
- Pattern Proxy pour transparence

### 8. **ENV_SETUP.md** (mis à jour)
Documentation de JWT_SECRET :
- 3 méthodes de génération
- Instructions de sécurité
- Exemples de commandes

---

## 🔐 Variables d'environnement

Ajoutez dans votre fichier `.env.local` :

```env
# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Configuration JWT pour l'authentification
JWT_SECRET=your-very-long-random-secret-key-here
```

### Générer JWT_SECRET

**Option 1 (recommandée) :**
```bash
openssl rand -base64 32
```

**Option 2 :**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option 3 :**
Allez sur https://generate-secret.vercel.app/32

---

## 🗄️ Structure de la table app_user

Votre table Supabase doit contenir :

```sql
-- Assurez-vous que votre table app_user a cette structure
app_user (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,  -- bcrypt hash
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

---

## 🧪 Comment tester

### 1. Créer un utilisateur de test

Si vous n'avez pas encore d'utilisateur, créez-en un dans Supabase :

```sql
-- Générez d'abord un hash bcrypt du mot de passe
-- Avec Node.js : 
-- const bcrypt = require('bcryptjs');
-- console.log(bcrypt.hashSync('admin123', 10));

INSERT INTO app_user (username, password_hash, is_active)
VALUES ('admin', '$2a$10$...votre-hash-bcrypt...', true);
```

**Ou utilisez ce script Node.js :**

```javascript
const bcrypt = require('bcryptjs');
const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);
console.log('Hash:', hash);
```

### 2. Démarrer l'application

```bash
npm run dev
```

### 3. Tester le login

1. Allez sur http://localhost:3000
2. Vous serez redirigé vers `/login`
3. Entrez vos identifiants
4. Vous serez redirigé vers `/dashboard`

### 4. Tester la protection des routes

- Essayez d'accéder à `/clients` sans être connecté → Redirection vers `/login`
- Connectez-vous, puis essayez `/clients` → Accès autorisé
- Sur `/login` en étant connecté → Redirection vers `/dashboard`

### 5. Tester la déconnexion

- Cliquez sur "Déconnexion" dans la sidebar
- Vous serez redirigé vers `/login`
- Essayez d'accéder à `/dashboard` → Redirection vers `/login`

---

## 🔒 Sécurité

### Points forts
✅ **Mots de passe hashés** avec bcrypt (jamais en clair)
✅ **JWT signés** avec clé secrète (protection contre la falsification)
✅ **Cookies HttpOnly** (protection XSS)
✅ **Cookies Secure** en production (HTTPS uniquement)
✅ **SameSite: lax** (protection CSRF)
✅ **Messages d'erreur génériques** (pas de leak d'info)
✅ **Validation côté serveur** (toutes les vérifications en API)

### Bonnes pratiques
✅ JWT expirent après 7 jours
✅ Tokens invalidés automatiquement si corrompus
✅ Middleware vérifie toutes les requêtes
✅ Variables sensibles jamais exposées au client

---

## 🚀 Flow d'authentification

### Login
```
1. Utilisateur entre username/password
2. Frontend appelle POST /api/login
3. Backend vérifie dans Supabase
4. Backend compare avec bcrypt
5. Backend crée JWT + cookie
6. Frontend redirige vers /dashboard
```

### Navigation
```
1. Utilisateur accède à une page
2. Middleware intercepte la requête
3. Middleware vérifie le cookie JWT
4. Si valide → Accès autorisé
5. Si invalide → Redirection /login
```

### Logout
```
1. Utilisateur clique "Déconnexion"
2. Frontend appelle POST /api/logout
3. Backend supprime le cookie
4. Frontend redirige vers /login
```

---

## 📦 Dépendances installées

```json
{
  "bcryptjs": "^2.4.3",
  "@types/bcryptjs": "^2.4.6",
  "jose": "^5.x.x"
}
```

- **bcryptjs** : Comparaison sécurisée des mots de passe
- **jose** : Création et vérification de JWT
- **@types/bcryptjs** : Types TypeScript

---

## ⚠️ Important

### Ne PAS faire :
- ❌ Committer `.env.local` dans Git
- ❌ Exposer JWT_SECRET
- ❌ Stocker les mots de passe en clair
- ❌ Désactiver HttpOnly sur les cookies
- ❌ Utiliser le même JWT_SECRET en dev et prod

### À faire :
- ✅ Générer un nouveau JWT_SECRET par environnement
- ✅ Utiliser des mots de passe forts pour les utilisateurs
- ✅ Activer HTTPS en production
- ✅ Monitorer les tentatives de connexion échouées
- ✅ Implémenter un rate limiting (future étape)

---

## 🐛 Dépannage

### Erreur "JWT_SECRET must be defined"
→ Ajoutez `JWT_SECRET` dans `.env.local`

### Erreur "Identifiants incorrects" alors qu'ils sont corrects
→ Vérifiez que :
1. Le hash bcrypt est correct dans la DB
2. `is_active = true` dans la table
3. Le username correspond exactement (case sensitive)

### Redirection infinie vers /login
→ Vérifiez que :
1. Le cookie est bien créé (DevTools > Application > Cookies)
2. JWT_SECRET est le même que celui utilisé pour créer le token
3. Pas d'erreur dans la console serveur

### Build échoue
→ C'est normal si les variables d'env ne sont pas définies
→ Le build fonctionne maintenant avec initialisation lazy

---

## 🎯 Prochaines étapes possibles

### Sécurité avancée
- [ ] Rate limiting sur /api/login (protection brute force)
- [ ] Logs des tentatives de connexion
- [ ] 2FA (authentification à deux facteurs)
- [ ] Refresh tokens

### Fonctionnalités
- [ ] Mot de passe oublié
- [ ] Changement de mot de passe
- [ ] Gestion multi-utilisateurs
- [ ] Rôles et permissions

### UX
- [ ] "Se souvenir de moi" fonctionnel
- [ ] Session persistante configurable
- [ ] Message de bienvenue personnalisé
- [ ] Affichage du vrai username dans la sidebar

---

**✅ Votre système d'authentification est maintenant complètement fonctionnel et sécurisé !**


