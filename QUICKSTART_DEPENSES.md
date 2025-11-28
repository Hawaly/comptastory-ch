# 🚀 Démarrage Rapide - Module Dépenses

## ⚡ En 4 étapes

### 1. Créer le bucket receipts

**Via Supabase :**
```
Storage → New bucket → "receipts" (privé)
```

**Via SQL :**
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false);
```

### 2. Créer une dépense

```
http://localhost:3001/depenses
→ "Nouvelle dépense"
```

### 3. Remplir le formulaire

```
Libellé : Adobe Creative Cloud - Janvier
Montant : 79.90 CHF
Date : Aujourd'hui
Type : YourStory (général)
Récurrence : Mensuelle
Catégorie : Logiciels
```

### 4. Uploader un justificatif

```
1. Cliquer sur "Choisir un fichier"
2. Sélectionner un PDF ou image
3. Voir la preview du fichier
4. Clic "Créer"
5. ✅ Fichier uploadé automatiquement !
```

---

## 📂 Upload de justificatifs

**Formats acceptés :**
- PDF
- PNG
- JPG/JPEG

**Taille max :** 10 MB

**Stockage :**
- Supabase Storage (bucket "receipts")
- Organisation par année : `2025/timestamp-random.pdf`
- URLs sécurisées (signées, 1h)

---

## 💡 Dépenses client/mandat

Pour une dépense liée à un projet :

```
Type : Client/Mandat
→ Sélectionner le client
→ Sélectionner le mandat
→ La dépense apparaîtra :
  ✅ Dans /clients/[id] (onglet Dépenses)
  ✅ Dans /mandats/[id] (section Dépenses)
  ✅ Dans /depenses (liste globale)
```

---

## 📊 Stats disponibles

```
┌─────────────────┐
│ CE MOIS         │ ← Total dépenses mois actuel
│  1'250.00 CHF   │
└─────────────────┘

┌─────────────────┐
│ CETTE ANNÉE     │ ← Total dépenses année
│  15'680.00 CHF  │
└─────────────────┘

┌─────────────────┐
│ TOTAL           │ ← Total de toutes les dépenses
│  45'320.00 CHF  │
└─────────────────┘

┌─────────────────┐
│ RÉCURRENTES     │ ← Nombre de dépenses mensuelles
│       12        │
└─────────────────┘
```

---

## 🔍 Filtres pratiques

**Recherche :** Tapez dans la barre pour chercher dans les libellés

**Par type :** YourStory ou Client/Mandat

**Par catégorie :** Logiciels, Marketing, Déplacements, etc.

**Par période :** Sélecteur de mois/année

**Tous combinables !**

---

## 📋 Catégories disponibles

Les catégories sont déjà créées dans votre DB :
- Logiciels
- Marketing & Publicité
- Déplacements
- Matériel
- Sous-traitance
- Abonnements
- Divers

---

**Pour plus de détails, consultez `RECAP_ETAPE7_DEPENSES.md`**

