# 🚀 Démarrage Rapide - Authentification

Guide ultra-rapide pour démarrer avec l'authentification.

---

## ⚡ En 3 étapes

### 1. Créer `.env.local`

```bash
# Générer JWT_SECRET
openssl rand -base64 32

# Créer le fichier
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=votre-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
JWT_SECRET=$(openssl rand -base64 32)
EOF
```

### 2. Créer un utilisateur de test

```bash
# Générer le hash du mot de passe
node scripts/hash-password.js admin123

# Copier le hash généré et l'insérer dans Supabase
```

Dans Supabase SQL Editor :

```sql
INSERT INTO app_user (username, password_hash, is_active)
VALUES ('admin', 'VOTRE_HASH_ICI', true);
```

### 3. Démarrer l'application

```bash
npm run dev
```

Allez sur http://localhost:3000 et connectez-vous avec :
- **Username**: `admin`
- **Password**: `admin123`

---

## 🎯 C'est tout !

Vous devriez maintenant être connecté et voir le dashboard.

---

## 📚 Pour aller plus loin

- **Guide complet** : `AUTH_SETUP.md`
- **Code source** : `REFERENCE_AUTH_CODE.md`
- **Récapitulatif** : `RECAP_ETAPE2_AUTH.md`

---

## 🐛 Problème ?

### Login ne fonctionne pas
1. Vérifiez que JWT_SECRET est dans `.env.local`
2. Vérifiez que l'utilisateur existe dans Supabase
3. Vérifiez que `is_active = true`

### Cookie non créé
1. Ouvrez DevTools > Application > Cookies
2. Vérifiez la présence du cookie "session"
3. Redémarrez le serveur si nécessaire

### Redirection infinie
1. Supprimez les cookies du navigateur
2. Vérifiez que JWT_SECRET est correct
3. Redémarrez le serveur

---

**Besoin d'aide ? Consultez `AUTH_SETUP.md` pour le guide complet.**


