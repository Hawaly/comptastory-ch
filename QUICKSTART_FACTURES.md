# 🚀 Démarrage Rapide - Module Factures

## ⚡ En 5 étapes

### 1. Créer une facture

```
http://localhost:3001/factures
→ Clic "Nouvelle facture"
```

### 2. Remplir le formulaire

```
Client : Sélectionner un client
Mandat : (optionnel)
Date d'émission : Aujourd'hui
Statut : Brouillon
```

### 3. Ajouter des lignes

```
Ligne 1:
  Description : Gestion réseaux sociaux - Janvier
  Quantité : 1
  Prix unitaire : 1500

Ligne 2:
  Description : Création de contenu
  Quantité : 5
  Prix unitaire : 200
```

**Les totaux se calculent automatiquement ! 💰**

```
Total HT :  2500.00 CHF
TVA 7.7% :   192.50 CHF
Total TTC : 2692.50 CHF
```

### 4. Créer et générer le PDF

```
1. Clic "Créer la facture"
2. Vous êtes redirigé vers la facture
3. Clic "Générer PDF"
4. ⏳ Quelques secondes...
5. ✅ "PDF généré avec succès !"
```

### 5. Télécharger et marquer comme payée

```
1. Clic "Télécharger PDF"
2. Vérifier le PDF
3. Envoyer au client
4. Quand le paiement arrive :
   → Clic "Marquer comme payée"
   → ✅ Statut change en "Payée"
```

---

## 📊 C'est tout !

Vous avez maintenant :
- ✅ Une facture professionnelle
- ✅ Un PDF téléchargeable
- ✅ Un suivi des paiements
- ✅ Des stats mises à jour

---

## 💡 Astuces

### Ajouter plusieurs lignes
Cliquez sur "+ Ajouter une ligne" autant de fois que nécessaire

### Supprimer une ligne
Cliquez sur l'icône 🗑️ à droite de la ligne

### Les calculs sont automatiques
- Le total de chaque ligne se calcule : Qté × Prix
- Les totaux HT/TVA/TTC se mettent à jour en direct

### Filtres pratiques
- Filtre par mois pour voir les factures d'une période
- Filtre par statut pour voir uniquement les impayées
- Recherche par client ou numéro

---

## 🎯 Pages disponibles

| Route | Description |
|-------|-------------|
| `/factures` | Liste + stats + filtres |
| `/factures/new` | Créer une facture |
| `/factures/[id]` | Détails + actions |

---

## 📄 Format de numérotation

```
FAC-2025-0001 ← Première facture 2025
FAC-2025-0002 ← Deuxième facture 2025
...
FAC-2026-0001 ← Première facture 2026
```

---

**Pour plus de détails, consultez `RECAP_ETAPE6_FACTURES.md`**

