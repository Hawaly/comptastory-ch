# Migration : Ajout adresse et code postal

## 🎯 Ce qui a été modifié

### 1. Base de données Supabase

Ajout de 2 nouveaux champs à la table `client` :
- `address` (TEXT, nullable) : Adresse complète du client
- `zip_code` (TEXT, nullable) : Code postal

### 2. Code de l'application

**Types TypeScript (`types/database.ts`) :**
```typescript
export interface Client {
  // ... champs existants
  address: string | null;
  zip_code: string | null;
  // ...
}
```

**Formulaire (`components/clients/ClientForm.tsx`) :**
- Nouvelle section "Adresse" avec 2 champs
- Adresse complète (3/4 de largeur)
- Code postal (1/4 de largeur)

**Page détails (`app/(dashboard)/clients/[id]/page.tsx`) :**
- Affichage de l'adresse avec icône de localisation
- Visible uniquement si renseignée

### 3. Correction des couleurs

Ajout de `text-gray-900` sur tous les champs :
- ✅ Formulaire clients
- ✅ Recherche clients
- ✅ Filtres clients
- ✅ Login
- ✅ Header (recherche globale)

Le texte est maintenant **bien visible** sur fond blanc !

---

## 🚀 Migration de la base de données

### Option 1 : Via l'interface Supabase (Recommandé)

1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Copiez-collez ce script :

```sql
-- Ajouter les colonnes address et zip_code
ALTER TABLE public.client 
ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE public.client 
ADD COLUMN IF NOT EXISTS zip_code TEXT;
```

5. Cliquez sur **Run** (ou Ctrl+Enter)
6. ✅ Vérifiez le message de succès

### Option 2 : Via le fichier de migration

Le script complet est disponible dans :
```
migrations/add_address_to_client.sql
```

---

## ✅ Vérification

### 1. Vérifier dans Supabase

```sql
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'client'
AND column_name IN ('address', 'zip_code');
```

Résultat attendu :
```
column_name | data_type | is_nullable
------------|-----------|------------
address     | text      | YES
zip_code    | text      | YES
```

### 2. Tester dans l'application

1. Allez sur http://localhost:3001/clients
2. Créez un nouveau client ou modifiez-en un
3. Remplissez les nouveaux champs :
   - **Adresse** : Rue de la Paix 15
   - **Code postal** : 2000
4. Enregistrez
5. ✅ Vérifiez que l'adresse s'affiche sur la fiche client

---

## 📋 Changements visuels

### Avant
```
[ Nom du client           ] (texte invisible/très clair)
```

### Après
```
[ Nom du client           ] (texte noir bien visible)
```

### Nouveau formulaire

```
┌─────────────────────────────────────────┐
│ Informations de base                    │
├─────────────────────────────────────────┤
│ Nom du client *                         │
│ [                                    ]  │
│                                         │
│ Nom de l'entreprise                     │
│ [                                    ]  │
│                                         │
│ Type *          Statut *                │
│ [One-shot ▼]    [Actif ▼]              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Adresse                         ← NOUVEAU│
├─────────────────────────────────────────┤
│ Adresse complète        Code postal     │
│ [Rue de la Paix 15 ]    [2000]          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Informations de contact                 │
├─────────────────────────────────────────┤
│ Email                   Téléphone       │
│ [test@email.ch     ]    [+41 79...]    │
└─────────────────────────────────────────┘
```

---

## 🎯 Impact

### Base de données
- ✅ 2 nouvelles colonnes (nullable, pas d'impact sur données existantes)
- ✅ Pas de migration de données nécessaire
- ✅ Pas de contraintes ajoutées

### Application
- ✅ Formulaires mis à jour
- ✅ Affichage sur fiche client
- ✅ Pas d'impact sur clients existants (champs vides = null)

### Performance
- ✅ Aucun impact (colonnes nullable)
- ✅ Build réussi (15 pages)
- ✅ Pas d'augmentation significative de taille

---

## 📝 Notes

**Champs optionnels :**
Les champs `address` et `zip_code` sont **optionnels** :
- Pas besoin de remplir les clients existants
- Peuvent être ajoutés progressivement
- Convertis en `null` si laissés vides

**Validation :**
- Aucune validation stricte (format libre)
- Le code postal accepte n'importe quel texte
- Adapté pour codes postaux internationaux

**Affichage :**
- L'adresse n'apparaît que si renseignée
- Icône de localisation ajoutée
- Format sur 2 lignes (adresse + code postal)

---

## 🐛 Dépannage

### Migration échoue
```
ERROR: column "address" already exists
```
→ C'est normal si vous avez déjà exécuté la migration
→ Les colonnes existent déjà

### Erreur lors de la sauvegarde
```
column "address" of relation "client" does not exist
```
→ La migration n'a pas été exécutée dans Supabase
→ Exécutez le script SQL ci-dessus

### Texte toujours invisible
→ Videz le cache du navigateur (Ctrl+Shift+R)
→ Rechargez la page

---

## ✅ Checklist de migration

- [ ] Exécuter le script SQL dans Supabase
- [ ] Vérifier que les colonnes existent
- [ ] Recharger l'application (F5)
- [ ] Créer/modifier un client avec adresse
- [ ] Vérifier l'affichage sur la fiche client
- [ ] Tester que les couleurs sont lisibles

---

**✨ Migration terminée ! Les clients peuvent maintenant avoir une adresse et le texte est bien visible !**

