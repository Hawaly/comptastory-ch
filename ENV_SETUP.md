# Configuration des Variables d'Environnement

Pour que l'application fonctionne correctement avec Supabase, vous devez créer un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# Configuration Supabase
# Remplacez les valeurs ci-dessous par vos vraies clés depuis votre projet Supabase
# Dashboard Supabase > Project Settings > API

NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Configuration JWT pour l'authentification
# Clé secrète pour signer les tokens de session (générez une clé aléatoire sécurisée)
# Vous pouvez générer une clé avec : openssl rand -base64 32

JWT_SECRET=your-very-long-random-secret-key-here
```

## Comment obtenir vos clés Supabase

1. Connectez-vous à votre projet Supabase : https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans **Settings** > **API**
4. Copiez l'**URL** dans `NEXT_PUBLIC_SUPABASE_URL`
5. Copiez l'**anon/public key** dans `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Comment générer JWT_SECRET

La clé `JWT_SECRET` est utilisée pour signer les tokens de session. Elle doit être une chaîne aléatoire et sécurisée.

### Option 1 : Avec OpenSSL (recommandé)
```bash
openssl rand -base64 32
```

### Option 2 : En ligne
- Allez sur https://generate-secret.vercel.app/32
- Copiez la clé générée

### Option 3 : Avec Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Important :** Ne partagez jamais cette clé et ne la committez jamais dans Git !

## Note importante

Le fichier `.env.local` ne sera pas versionné (déjà dans .gitignore) pour protéger vos clés secrètes.

