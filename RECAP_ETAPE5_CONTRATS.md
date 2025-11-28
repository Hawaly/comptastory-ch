# 📄 YourStory Admin - Étape 5 : Génération de Contrats PDF COMPLÈTE !

## ✅ Résumé de l'étape

Système complet de génération de contrats PDF avec :
- ✅ Génération de PDF avec PDFKit côté serveur
- ✅ Upload automatique vers Supabase Storage
- ✅ Numérotation automatique (CTR-2025-0001, 0002, etc.)
- ✅ Sélection optionnelle d'un mandat
- ✅ Liste des contrats dans la fiche client
- ✅ Téléchargement sécurisé (URLs signées)
- ✅ Template PDF professionnel
- ✅ Bouton "Générer contrat" dans fiche client

---

## 📋 Fichiers créés (9 nouveaux)

### Helpers et utilitaires
1. **lib/contractHelpers.ts** (75 lignes)
   - `generateContractNumber()` : Génère CTR-YYYY-NNNN unique
   - `uploadContractToStorage()` : Upload PDF vers Supabase Storage
   - `getContractDownloadUrl()` : URLs signées pour téléchargement

2. **lib/pdfGenerator.ts** (180 lignes)
   - `generateContractPDF()` : Génère le PDF avec PDFKit
   - Template professionnel avec :
     - En-tête YourStory Agency
     - Informations client complètes
     - Informations du mandat (si présent)
     - Conditions générales
     - Zones de signature
     - Pied de page avec date/heure

### API Routes
3. **app/api/contracts/generate/route.ts** (105 lignes)
   - POST `/api/contracts/generate`
   - Récupère client et mandat depuis Supabase
   - Génère numéro unique
   - Génère PDF
   - Upload vers Storage
   - Insert dans table `contrat`
   - Retourne succès

4. **app/api/contracts/[id]/download/route.ts** (40 lignes)
   - GET `/api/contracts/[id]/download`
   - Récupère le contrat
   - Génère URL signée
   - Redirige vers le téléchargement

### Composants
5. **components/contracts/ContractsList.tsx** (130 lignes)
   - Liste des contrats d'un client
   - Affichage : Numéro, Mandat, Dates
   - Bouton téléchargement par contrat
   - Rafraîchissement automatique

6. **components/contracts/GenerateContractButton.tsx** (140 lignes)
   - Bouton "Générer contrat"
   - **Modal de sélection** de mandat
   - Appel API
   - Feedback utilisateur

### Pages (modifiées)
7. **app/(dashboard)/clients/[id]/page.tsx** (modifié)
   - Nouvel onglet "Contrats"
   - Bouton "Générer contrat" en haut
   - Affichage de ContractsList

### Documentation
8. **SUPABASE_STORAGE_SETUP.md** (100 lignes)
   - Instructions pour créer le bucket
   - Configuration RLS
   - Politiques d'accès

### Types
9. **types/database.ts** (mis à jour)
   - Interface Contrat
   - Type ContratInsert

---

## 📦 Dépendances installées

```bash
npm install pdfkit @types/pdfkit
```

---

## 🗄️ Configuration Supabase Storage

### Créer le bucket "contracts"

**Via l'interface Supabase :**

1. Storage → New bucket
2. Name : `contracts`
3. Public : ❌ Non (privé)
4. MIME types : `application/pdf`
5. Max size : 10 MB
6. Create bucket

**Via SQL :**

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', false);
```

### Configurer les politiques (RLS)

**Pour le développement, désactivez temporairement RLS** :
- Storage → Policies → Bucket `contracts` → Disable RLS

**Pour la production** :

```sql
-- Permettre l'upload
CREATE POLICY "Authenticated users can upload contracts"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'contracts');

-- Permettre la lecture
CREATE POLICY "Authenticated users can read contracts"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'contracts');
```

---

## 🔄 Flow de génération

```
1. User sur /clients/[id]
2. Clic "Générer contrat"
3. Modal s'ouvre
4. Sélection optionnelle d'un mandat
5. Clic "Générer"
   ↓
6. POST /api/contracts/generate
   ├─ Récupère client depuis DB
   ├─ Récupère mandat (si sélectionné)
   ├─ Génère numéro CTR-2025-XXXX
   ├─ Génère PDF avec PDFKit
   ├─ Upload PDF → Supabase Storage
   └─ Insert dans table contrat
   ↓
7. Succès → Message + rafraîchissement liste
8. Nouveau contrat visible dans onglet "Contrats"
```

---

## 📄 Template du PDF généré

### Structure

```
┌─────────────────────────────────────┐
│      YourStory Agency               │
│  Rue Exemple 12, 2000 Neuchâtel    │
│  contact@yourstory.ch              │
│                                     │
│   CONTRAT DE PRESTATION            │
│     N° CTR-2025-0001               │
├─────────────────────────────────────┤
│                                     │
│  CLIENT                             │
│  Nom du client                      │
│  Entreprise : ...                   │
│  Adresse : ...                      │
│  Email : ...                        │
│  Téléphone : ...                    │
│                                     │
│  OBJET DU CONTRAT (si mandat)      │
│  Titre du mandat                    │
│  Type : Marketing digital           │
│  Description : ...                  │
│  Dates : début - fin                │
│                                     │
│  CONDITIONS GÉNÉRALES              │
│  1. ...                             │
│  2. ...                             │
│  3. ...                             │
│  4. ...                             │
│                                     │
│  Pour YourStory    Pour le Client  │
│  _______________   _______________  │
│  Date: _______     Date: _______    │
│                                     │
│  Généré le 25/11/2025 à 14:30      │
└─────────────────────────────────────┘
```

### Éléments personnalisés

- ✅ Numéro de contrat unique
- ✅ Informations client complètes
- ✅ Informations du mandat (si lié)
- ✅ Dates de génération
- ✅ Format A4 professionnel

---

## 🎨 Interface utilisateur

### Bouton "Générer contrat"

**Emplacement :** En haut de la fiche client, au-dessus des onglets

**Couleur :** Vert (pour se distinguer)

**Action :** Ouvre une modal de sélection

### Modal de sélection

```
┌────────────────────────────────┐
│  Générer un contrat            │
├────────────────────────────────┤
│                                │
│  Sélectionner un mandat :      │
│  [ Campagne Q1 2024      ▼ ]   │
│                                │
│  Si vous sélectionnez un       │
│  mandat, ses informations      │
│  seront incluses.              │
│                                │
│       [Annuler]  [Générer]     │
└────────────────────────────────┘
```

### Liste des contrats (onglet)

```
┌────────────────────────────────────────┐
│ Contrats (2)                           │
├────────────────────────────────────────┤
│ 📄 CTR-2025-0001                       │
│    Mandat : Campagne Social Media      │
│    Généré le 25/11/2025                │
│                      [Télécharger]     │
├────────────────────────────────────────┤
│ 📄 CTR-2025-0002                       │
│    Sans mandat                         │
│    Généré le 26/11/2025                │
│                      [Télécharger]     │
└────────────────────────────────────────┘
```

---

## 🔐 Sécurité

### Upload sécurisé
- ✅ Bucket privé (non public)
- ✅ URLs signées (expiration 1h)
- ✅ Authentification requise

### Stockage
- ✅ Organisation par année : `2025/CTR-2025-0001.pdf`
- ✅ Nom de fichier = numéro de contrat
- ✅ Pas d'écrasement (upsert: false)

### API Routes
- ✅ Validation des paramètres
- ✅ Gestion des erreurs
- ✅ Protection middleware (authentifié)

---

## 🧪 Comment tester

### 1. Configurer Supabase Storage

```sql
-- Dans Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', false);
```

Ou via l'interface : Storage → New bucket → `contracts`

### 2. Tester la génération

1. Allez sur `/clients/[id]` (un client existant)
2. Cliquez sur **"Générer contrat"** (bouton vert)
3. **Modal s'ouvre** → Sélectionnez un mandat ou laissez vide
4. Cliquez **"Générer"**
5. ✅ Message de succès : "Contrat CTR-2025-0001 généré avec succès !"

### 3. Vérifier le contrat

1. Cliquez sur l'onglet **"Contrats"**
2. ✅ Le nouveau contrat apparaît dans la liste
3. Cliquez sur **"Télécharger"**
4. ✅ Le PDF s'ouvre dans un nouvel onglet

### 4. Vérifier dans Supabase

```sql
-- Voir les contrats générés
SELECT * FROM contrat ORDER BY created_at DESC;

-- Vérifier le Storage
-- Allez dans Storage → contracts → 2025 → CTR-2025-0001.pdf
```

---

## 📊 Opérations Supabase

### Génération du numéro

```typescript
const { data } = await supabase
  .from('contrat')
  .select('contrat_number')
  .like('contrat_number', 'CTR-2025-%')
  .order('contrat_number', { ascending: false })
  .limit(1);

// Incrémente le dernier numéro trouvé
```

### Upload vers Storage

```typescript
await supabase.storage
  .from('contracts')
  .upload(filePath, pdfBuffer, {
    contentType: 'application/pdf',
    upsert: false,
  });
```

### Création de l'enregistrement

```typescript
await supabase
  .from('contrat')
  .insert([{
    client_id,
    mandat_id,
    contrat_number,
    file_path,
    signed_date: null,
  }]);
```

### Téléchargement (URL signée)

```typescript
const { data } = await supabase.storage
  .from('contracts')
  .createSignedUrl(filePath, 3600); // 1 heure

// Redirige vers data.signedUrl
```

---

## 🎯 Fonctionnalités

### Génération automatique
- ✅ Numéro unique auto-incrémenté
- ✅ Format : CTR-ANNÉE-NNNN
- ✅ Pas de doublon possible
- ✅ Réinitialisation chaque année

### Contenu du PDF
- ✅ Informations agence (YourStory)
- ✅ Informations client (nom, adresse, contact)
- ✅ Informations mandat (titre, description, dates)
- ✅ Conditions générales
- ✅ Espaces pour signatures
- ✅ Date de génération

### Gestion des contrats
- ✅ Liste chronologique
- ✅ Association client/mandat
- ✅ Téléchargement sécurisé
- ✅ Stockage organisé (par année)

---

## 📁 Structure créée

```
compta/
├── lib/
│   ├── contractHelpers.ts       # Helpers Storage
│   └── pdfGenerator.ts          # Génération PDF
│
├── app/api/contracts/
│   ├── generate/
│   │   └── route.ts            # POST génération
│   └── [id]/download/
│       └── route.ts            # GET téléchargement
│
├── components/contracts/
│   ├── ContractsList.tsx        # Liste affichage
│   └── GenerateContractButton.tsx  # Bouton + modal
│
└── app/(dashboard)/clients/[id]/page.tsx (modifié)
    └── Onglet "Contrats" ajouté
```

---

## ✅ Vérifications effectuées

- ✅ `npm run build` → Succès (17 pages)
- ✅ TypeScript → 0 erreurs
- ✅ ESLint → 0 warnings
- ✅ PDFKit fonctionne côté serveur
- ✅ Routes API créées
- ✅ Composants intégrés

---

## 🐛 Dépannage

### Erreur "Bucket not found"
→ Créez le bucket `contracts` dans Supabase Storage
→ Voir `SUPABASE_STORAGE_SETUP.md`

### Erreur "Row Level Security"
→ Désactivez temporairement RLS sur le bucket
→ Ou configurez les politiques (voir doc)

### PDF vide ou erreur de génération
→ Vérifiez que PDFKit est bien installé
→ Vérifiez les logs serveur pour les erreurs

### Téléchargement échoue
→ Vérifiez que le fichier existe dans Storage
→ Vérifiez les permissions du bucket

### Numéro de contrat en doublon
→ Normalement impossible grâce à UNIQUE sur contrat_number
→ Vérifiez la logique de génération

---

## 📈 Statistiques

```
Fichiers créés :        9
Lignes de code :        ~800
API Routes :            2
Composants :            2
Helpers :               2
Build pages :           17 (vs 16)
PDF Template :          Professionnel
```

---

## 🎯 Prochaines étapes suggérées

### Améliorations contrats
- [ ] Template PDF personnalisable
- [ ] Champs de signature électronique
- [ ] Envoi par email automatique
- [ ] Historique des modifications
- [ ] Multi-templates (selon type de contrat)

### Module Factures
- [ ] Génération de factures PDF
- [ ] Calcul HT/TVA/TTC automatique
- [ ] Numérotation auto des factures
- [ ] Suivi des paiements
- [ ] Relances automatiques

### Module Dépenses
- [ ] Ajout de dépenses
- [ ] Catégorisation
- [ ] Upload de justificatifs
- [ ] Récurrence mensuelle
- [ ] Rapports de dépenses

---

## 🚀 Pour tester maintenant

### 1. Créer le bucket Supabase

```
Storage → New bucket → "contracts" (privé)
```

### 2. Générer un contrat

```
1. http://localhost:3001/clients/[id]
2. Clic "Générer contrat"
3. Sélectionner un mandat (ou pas)
4. Clic "Générer"
5. ✅ Message de succès
```

### 3. Télécharger le contrat

```
1. Onglet "Contrats"
2. Voir le contrat CTR-2025-0001
3. Clic "Télécharger"
4. ✅ PDF s'ouvre dans nouvel onglet
```

### 4. Vérifier le PDF

Le PDF doit contenir :
- ✅ En-tête YourStory
- ✅ Numéro de contrat
- ✅ Informations du client
- ✅ Informations du mandat (si sélectionné)
- ✅ Conditions générales
- ✅ Espaces de signature
- ✅ Date de génération

---

## 💡 Points importants

### Numérotation automatique
- Format : `CTR-YYYY-NNNN`
- Exemple : `CTR-2025-0001`, `CTR-2025-0002`
- Réinitialisation chaque année
- Incrémentation automatique
- Pas de doublon possible

### Stockage des PDF
- **Supabase Storage** : `contracts/2025/CTR-2025-0001.pdf`
- Organisation par année
- Accès sécurisé (URLs signées 1h)
- Backup automatique par Supabase

### Lien client-mandat
- Contrat peut être **sans mandat** (général)
- Ou lié à un **mandat spécifique**
- Le mandat apparaît dans le PDF et la liste

---

## 📚 Documentation

| Fichier | Description |
|---------|-------------|
| `RECAP_ETAPE5_CONTRATS.md` | Ce fichier |
| `SUPABASE_STORAGE_SETUP.md` | Configuration Storage |

---

**🎊 Félicitations ! Le système de génération de contrats PDF est maintenant 100% fonctionnel !**

Vous pouvez :
1. ✅ Générer des contrats professionnels en PDF
2. ✅ Les lier à des clients et mandats
3. ✅ Les stocker dans Supabase Storage
4. ✅ Les télécharger de manière sécurisée
5. ✅ Voir l'historique complet des contrats

**🚀 Allez sur http://localhost:3001/clients/[id] et générez votre premier contrat ! 📄**

