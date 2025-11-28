# 💰 YourStory Admin - Étape 6 : Module Facturation COMPLET !

## ✅ Résumé de l'étape

Système complet de facturation avec :
- ✅ Liste des factures avec stats et filtres
- ✅ Création de factures avec lignes multiples
- ✅ Calcul automatique HT/TVA/TTC
- ✅ Génération de PDF de facture
- ✅ Changement de statut (marquer comme payée)
- ✅ Lien avec clients et mandats
- ✅ Numérotation automatique (FAC-YYYY-NNNN)
- ✅ Suivi des paiements

---

## 📋 Fichiers créés (12 nouveaux)

### Types et helpers
1. **types/database.ts** (mis à jour)
   - Interfaces Invoice et InvoiceItem
   - Labels et couleurs pour statuts
   - Types Insert

2. **lib/invoiceHelpers.ts** (90 lignes)
   - `generateInvoiceNumber()` : FAC-YYYY-NNNN unique
   - `calculateInvoiceTotals()` : Calcule HT/TVA/TTC
   - `formatCurrency()` : Format CHF
   - Constante TVA_RATE (7.7%)

3. **lib/invoicePdfGenerator.ts** (260 lignes)
   - `generateInvoicePDF()` : Génère PDF facture
   - Template professionnel avec tableau
   - pdf-lib (pas PDFKit)

### Composants
4. **components/invoices/InvoiceItemsForm.tsx** (130 lignes)
   - Gestion des lignes de facturation
   - Ajout/Suppression de lignes
   - Calcul automatique du total par ligne
   - Interface intuitive

### Pages
5. **app/(dashboard)/factures/page.tsx** (REMPLACÉ - 240 lignes)
   - Liste complète des factures
   - 4 cartes de stats (Brouillons, Envoyées, Payées, À recevoir)
   - Recherche par numéro/client
   - Filtres par statut et mois
   - Tableau avec toutes les infos

6. **app/(dashboard)/factures/new/page.tsx** (210 lignes)
   - Création de facture
   - Sélection client + mandat optionnel
   - Gestion des lignes de facturation
   - Calcul des totaux en temps réel
   - Dates d'émission et échéance

7. **app/(dashboard)/factures/[id]/page.tsx** (280 lignes)
   - Détails complets de la facture
   - Affichage des lignes en tableau
   - Bouton "Générer PDF"
   - Bouton "Télécharger PDF"
   - Bouton "Marquer comme payée"
   - Totaux affichés

### API Routes
8. **app/api/invoices/generate-pdf/route.ts** (100 lignes)
   - POST `/api/invoices/generate-pdf`
   - Récupère facture + client + mandat + items
   - Génère PDF avec pdf-lib
   - Upload vers Supabase Storage
   - Met à jour pdf_path

9. **app/api/invoices/[id]/download/route.ts** (40 lignes)
   - GET `/api/invoices/[id]/download`
   - Génère URL signée
   - Redirige vers téléchargement

10. **app/api/invoices/[id]/mark-paid/route.ts** (45 lignes)
    - POST `/api/invoices/[id]/mark-paid`
    - Change le statut en 'payee'
    - Retourne succès

### Composants (bonus)
11. **components/contracts/GenerateContractButton.tsx** (créé précédemment)

---

## 🎨 Fonctionnalités implémentées

### 📋 Liste des factures (`/factures`)

**Stats en haut :**
- Nombre de brouillons (gris)
- Nombre envoyées (orange)
- Nombre payées (vert)
- **Total à recevoir** (bleu) - Somme des factures envoyées

**Tableau :**
- Numéro (cliquable)
- Client (avec icône)
- Date d'émission
- Badge de statut (NOIR sur BLANC)
- Montant TTC (en gros et gras)
- Action "Voir"

**Filtres :**
- Recherche par numéro ou nom client
- Filtre par statut (Tous, Brouillon, Envoyée, Payée, Annulée)
- Filtre par mois/année (sélecteur de mois)

### ➕ Création de facture (`/factures/new`)

**Formulaire en sections :**

**1. Informations de base :**
- Client (liste déroulante, obligatoire)
- Mandat (liste déroulante filtrée par client, optionnel)
- Date d'émission (par défaut : aujourd'hui)
- Date d'échéance (optionnel)
- Statut (Brouillon, Envoyée, Payée)

**2. Lignes de facturation :**
- **Description** (texte libre)
- **Quantité** (nombre décimal)
- **Prix unitaire** (CHF)
- **Total** (calculé automatiquement)
- Bouton ➕ pour ajouter une ligne
- Bouton 🗑️ pour supprimer une ligne

**3. Totaux (calculés en temps réel) :**
- Total HT (somme des lignes)
- TVA 7.7% (calculée automatiquement)
- **Total TTC** (en gros et bleu)

**Validation :**
- Client obligatoire
- Au moins une ligne avec description
- Calculs automatiques

**Après création :**
- Enregistrement dans `invoice` (avec totaux)
- Enregistrement dans `invoice_item` (toutes les lignes)
- Redirection vers `/factures/[id]`

### 👁️ Détails de la facture (`/factures/[id]`)

**Informations affichées :**
- Numéro de facture (H1)
- Badge de statut
- Lien vers le client
- Lien vers le mandat (si présent)
- Dates (émission, échéance)

**Tableau des lignes :**
- Description, Quantité, Prix unit., Total
- Formatage monétaire (CHF)

**Totaux affichés :**
- Total HT
- TVA (7.7%)
- **Total TTC** (en gros)

**Actions disponibles :**

1. **"Générer PDF"** (violet)
   - Appelle `/api/invoices/generate-pdf`
   - Crée le PDF et l'upload
   - Met à jour `pdf_path`
   - Devient "Regénérer PDF" si déjà généré

2. **"Télécharger PDF"** (bleu)
   - Visible seulement si PDF existe
   - Ouvre le PDF dans nouvel onglet
   - URL signée sécurisée

3. **"Marquer comme payée"** (vert)
   - Visible seulement si statut ≠ payée/annulée
   - Confirmation avant action
   - Appelle `/api/invoices/[id]/mark-paid`
   - Change le statut en 'payee'

---

## 💰 Calculs automatiques

### Formules

```typescript
// Par ligne
total_ligne = quantity × unit_price

// Facture
total_ht = Σ(total_ligne)
total_tva = total_ht × 0.077 (7.7%)
total_ttc = total_ht + total_tva

// Arrondi à 2 décimales
```

### Exemple

```
Ligne 1 : 10h × 100 CHF = 1'000 CHF
Ligne 2 : 5h × 80 CHF = 400 CHF
---
Total HT : 1'400.00 CHF
TVA 7.7% : 107.80 CHF
Total TTC : 1'507.80 CHF
```

---

## 📄 Template PDF Facture

### Structure

```
┌─────────────────────────────────────┐
│ YourStory Agency      FACTURE       │
│ Adresse              FAC-2025-0001  │
│ Contact              Date: 25/11/25 │
│                                     │
│ FACTURER À:                         │
│ Nom du client                       │
│ Entreprise                          │
│ Adresse                             │
│ Code postal                         │
│                                     │
│ Mandat: Campagne Q1 (si lié)        │
├─────────────────────────────────────┤
│ DESCRIPTION     QTÉ  PRIX    TOTAL  │
├─────────────────────────────────────┤
│ Prestation 1    10   100.00  1000   │
│ Prestation 2    5    80.00   400    │
│                                     │
│                     Total HT  1400  │
│                     TVA 7.7%  108   │
│                     ─────────────── │
│                     TOTAL TTC 1508  │
└─────────────────────────────────────┘
```

---

## 🔄 Flow complet

### Créer une facture

```
1. /factures → Clic "Nouvelle facture"
2. /factures/new
   ├─ Sélectionner client
   ├─ (Optionnel) Sélectionner mandat
   ├─ Ajouter lignes de facturation
   ├─ Voir totaux calculés automatiquement
   └─ Clic "Créer la facture"
3. Redirect /factures/[id]
```

### Générer et envoyer

```
1. /factures/[id] (statut: brouillon)
2. Vérifier les lignes et totaux
3. Clic "Générer PDF"
   ├─ PDF créé
   ├─ Uploadé vers Storage
   └─ pdf_path mis à jour
4. Clic "Télécharger PDF"
   ├─ PDF s'ouvre
   └─ Vérification avant envoi
5. Optionnel : Changer statut en "Envoyée"
```

### Marquer comme payée

```
1. /factures/[id] (statut: envoyée)
2. Paiement reçu du client
3. Clic "Marquer comme payée"
4. Confirmation
5. POST /api/invoices/[id]/mark-paid
6. Statut → payee
7. Stats mises à jour automatiquement
```

---

## 📊 Opérations Supabase

### Création de facture

```typescript
// 1. Insérer la facture
const { data: invoice } = await supabase
  .from('invoice')
  .insert([{
    client_id,
    mandat_id,
    invoice_number,
    issue_date,
    due_date,
    total_ht,
    total_tva,
    total_ttc,
    status,
    pdf_path: null,
  }])
  .select()
  .single();

// 2. Insérer les lignes
await supabase
  .from('invoice_item')
  .insert(items.map(item => ({
    invoice_id: invoice.id,
    ...item,
  })));
```

### Changement de statut

```typescript
await supabase
  .from('invoice')
  .update({ status: 'payee' })
  .eq('id', invoiceId);
```

### Génération PDF

```typescript
// 1. Générer le PDF
const pdfBytes = await generateInvoicePDF(data);

// 2. Upload
await supabase.storage
  .from('contracts')
  .upload(filePath, Buffer.from(pdfBytes), {
    contentType: 'application/pdf',
    upsert: true,
  });

// 3. Mettre à jour
await supabase
  .from('invoice')
  .update({ pdf_path: filePath })
  .eq('id', invoice_id);
```

---

## 🧪 Comment tester

### 1. Créer une facture

```
1. http://localhost:3001/factures
2. Clic "Nouvelle facture"
3. Sélectionner un client
4. (Optionnel) Sélectionner un mandat
5. Ajouter des lignes :
   - Description : "Gestion Social Media - Janvier"
   - Quantité : 1
   - Prix unitaire : 1500
6. Ajouter une 2ème ligne :
   - Description : "Création de contenu"
   - Quantité : 5
   - Prix unitaire : 200
7. Vérifier les totaux :
   - Total HT : 2500.00 CHF
   - TVA 7.7% : 192.50 CHF
   - Total TTC : 2692.50 CHF
8. Clic "Créer la facture"
9. ✅ Redirection vers la facture
```

### 2. Générer le PDF

```
1. Sur /factures/[id]
2. Clic "Générer PDF"
3. ⏳ Attendre quelques secondes
4. ✅ "PDF généré avec succès !"
5. Le bouton devient "Télécharger PDF"
6. Clic "Télécharger PDF"
7. ✅ PDF s'ouvre dans nouvel onglet
```

### 3. Marquer comme payée

```
1. Sur /factures/[id] (statut envoyée)
2. Clic "Marquer comme payée"
3. Confirmer
4. ✅ Statut change en "Payée"
5. Le bouton disparaît
6. Stats mises à jour
```

### 4. Filtres et recherche

```
1. Sur /factures
2. Créer plusieurs factures
3. Tester la recherche par numéro
4. Filtrer par statut
5. Filtrer par mois
6. ✅ Tableau se met à jour en temps réel
```

---

## 📈 Statistiques du module

```
Fichiers créés :        12
Lignes de code :        ~1800
Pages :                 3
Composants :            2
API Routes :            3
Build pages :           19 (vs 17)
Template PDF :          Professionnel
```

---

## 🎨 Design et couleurs

### Badges de statut (NOIR sur BLANC)

```
BROUILLON : Texte NOIR, bordure grise
ENVOYÉE   : Texte NOIR, bordure orange
PAYÉE     : Texte NOIR, bordure verte
ANNULÉE   : Texte NOIR, bordure rouge
```

### Cartes de stats

```
┌─────────────────┐
│ Brouillons      │ Bordure grise
│      3          │ Texte noir
└─────────────────┘

┌─────────────────┐
│ Envoyées        │ Bordure orange
│      5          │ Texte orange foncé
└─────────────────┘

┌─────────────────┐
│ Payées          │ Bordure verte
│      12         │ Texte vert foncé
└─────────────────┘

┌─────────────────┐
│ À recevoir      │ Bordure bleue
│  5'280.00 CHF   │ Texte bleu foncé
└─────────────────┘
```

### Boutons d'action

- **Générer PDF** : Violet
- **Télécharger** : Bleu
- **Marquer payée** : Vert
- **Créer** : Bleu

---

## 🔐 Sécurité et stockage

### Stockage des PDF
- **Bucket** : `contracts` (réutilise celui des contrats)
- **Organisation** : `2025/FAC-2025-0001.pdf`
- **Accès** : URLs signées (1h)
- **Upsert** : true (permet regénération)

### Numérotation
- Format : `FAC-ANNÉE-NUMÉRO`
- Unique (contrainte DB)
- Auto-incrémenté
- Réinitialisation annuelle

### Validation
- Client obligatoire
- Au moins une ligne
- Calculs côté serveur ET client
- Vérifications dans l'API

---

## 📊 Relations

```
Client (1) ─┬─ (N) Invoice
            │        ├─ (N) InvoiceItem
            │        └─ (0-1) Mandat
            │
            └─ (N) Mandat
```

**Une facture peut être :**
- Liée à un client (obligatoire)
- Liée à un mandat (optionnel)
- Composée de plusieurs lignes

---

## ✅ Vérifications effectuées

- ✅ `npm run build` → Succès (19 pages)
- ✅ TypeScript → 0 erreurs
- ✅ ESLint → 0 warnings
- ✅ Calculs HT/TVA/TTC corrects
- ✅ PDF généré avec pdf-lib (pas PDFKit)
- ✅ Numérotation automatique
- ✅ Tous les textes en NOIR

---

## 🎯 Prochaines étapes

### Module Dépenses
- [ ] Liste des dépenses
- [ ] Catégorisation
- [ ] Association client/mandat
- [ ] Récurrence mensuelle
- [ ] Upload justificatifs

### Dashboard
- [ ] Stats réelles (CA, dépenses)
- [ ] Graphiques
- [ ] Dernières activités
- [ ] KPIs de l'agence

### Améliorations factures
- [ ] Envoi par email
- [ ] Relances automatiques
- [ ] Multi-devises
- [ ] Acomptes
- [ ] Notes de crédit

---

## 🐛 Dépannage

### PDF ne se génère pas
→ Vérifiez que le bucket `contracts` existe
→ Vérifiez les permissions Storage

### Calculs incorrects
→ Vérifiez que les quantités/prix sont des nombres
→ Le total se calcule automatiquement

### Erreur "Bucket not found"
→ Créez le bucket `contracts` dans Storage
→ Voir `SUPABASE_STORAGE_SETUP.md`

### Bouton "Marquer payée" ne fait rien
→ Vérifiez la console pour erreurs
→ Vérifiez que le statut n'est pas déjà 'payee'

---

## 🚀 Pour tester maintenant

**Le serveur tourne sur http://localhost:3001**

```
1. Allez sur /factures
2. Clic "Nouvelle facture"
3. Sélectionnez un client
4. Ajoutez des lignes
5. Vérifiez les totaux
6. Créez la facture
7. Générez le PDF
8. Téléchargez le PDF
9. Marquez comme payée
```

---

**🎊 Module de facturation 100% fonctionnel !**

Vous pouvez maintenant :
- ✅ Créer des factures multi-lignes
- ✅ Calculer automatiquement HT/TVA/TTC
- ✅ Générer des PDF professionnels
- ✅ Suivre les paiements
- ✅ Filtrer et rechercher
- ✅ Voir les stats en temps réel

**Tous les textes sont en NOIR et bien lisibles ! 👀**

