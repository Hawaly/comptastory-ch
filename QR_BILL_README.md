# 💳 Module QR-Bill Suisse - Documentation

## 🎯 Objectif

Génération de QR-bills (bulletins de versement suisses avec code QR) conformes au standard **Swiss Payment Standards v2.3** de SIX Group.

---

## 📦 Technologie

**Librairie utilisée :** `swissqrbill`
- GitHub : https://github.com/schoero/swissqrbill
- NPM : https://www.npmjs.com/package/swissqrbill
- Conforme aux specs SIX Group

**Standard :** Swiss Implementation Guidelines QR-bill v2.3
- Documentation : https://www.six-group.com/en/products-services/banking-services/payment-standardization/standards/qr-bill.html
- PDF specs : https://www.six-group.com/dam/download/banking-services/standardization/qr-bill/ig-qr-bill-v2.3-en.pdf

---

## 🗄️ Configuration base de données

### Nouvelle colonne requise

```sql
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS qr_iban TEXT;

UPDATE public.company_settings
SET qr_iban = 'CH44 3199 9123 0008 8901 2'  -- ⚠️ VOTRE QR-IBAN
WHERE id = 1;
```

**⚠️ Qu'est-ce qu'un QR-IBAN ?**

- C'est un IBAN spécial fourni par votre banque suisse
- Il commence par **CH** + contient un IID (Institution ID) spécifique
- **Demandez-le à votre banque** pour l'utiliser avec les QR-bills
- En attendant, vous pouvez utiliser votre IBAN normal (limité)

---

## 🚀 Installation

```bash
# Déjà installé
npm install swissqrbill
```

---

## 📄 Fichiers créés

### Helpers
1. **lib/qrBillGenerator.ts** (150 lignes)
   - `generateSwissQrBill()` : Génère le QR-bill PDF
   - `generateQrReference()` : Crée référence structurée 27 chiffres
   - `calculateMod10()` : Checksum pour QR-Reference
   - `validateSwissIban()` : Valide format IBAN CH

### API Route
2. **app/api/invoices/[id]/qr-bill/route.ts** (60 lignes)
   - GET `/api/invoices/[id]/qr-bill`
   - Récupère facture + client + company settings
   - Génère QR-bill PDF
   - Retourne le PDF en téléchargement

### Migrations
3. **migrations/add_qr_iban_to_company.sql**
   - Ajoute colonne `qr_iban`

### Pages modifiées
4. **app/(dashboard)/factures/[id]/page.tsx**
   - Bouton "QR-Bill" ajouté
   - Icône QrCode
   - Couleur orange

---

## 🎨 Interface utilisateur

### Bouton QR-Bill

**Emplacement :** Page de détails facture (`/factures/[id]`)

**Actions disponibles :**
```
┌─────────────┬──────────────┬──────────┬────────────────┐
│ Générer PDF │ Télécharger │ QR-Bill  │ Marquer payée  │
│  (Violet)   │   (Bleu)    │ (Orange) │    (Vert)      │
└─────────────┴──────────────┴──────────┴────────────────┘
```

**Clic sur "QR-Bill" :**
- Ouvre le PDF QR-bill dans un nouvel onglet
- PDF conforme standard suisse
- Prêt à imprimer et envoyer au client

---

## 📋 Format du QR-Bill généré

### Structure conforme SIX

```
┌────────────────────────────────────────┐
│  Empfangsschein / Récépissé            │
│  ─────────────────────────────────     │
│  Konto / Compte                        │
│  CH44 3199 9123 0008 8901 2            │
│                                        │
│  Zahlbar durch / Payable par           │
│  YourStory Agency                      │
│  Rue de la Paix 15                     │
│  2000 Neuchâtel                        │
│                                        │
│  Zahlbar durch / Payable par           │
│  Sraps                                 │
│  Adresse client                        │
│  2000 Neuchâtel                        │
│                                        │
│  Währung  Betrag                       │
│  CHF      1'507.80                     │
│                                        │
│  Referenz                              │
│  21 00000 00000 00000 00000 00017      │
│                                        │
│  [QR CODE]                             │
└────────────────────────────────────────┘
```

**Parties du QR-bill :**
- ✅ **Receipt** (récépissé à gauche)
- ✅ **Payment part** (bulletin de versement à droite)
- ✅ **QR Code** avec toutes les données encodées
- ✅ Lignes de découpe
- ✅ Conforme impression

---

## 🔢 QR-Reference

### Format

**27 chiffres** au total :
- 26 chiffres de données
- 1 chiffre de checksum (modulo 10)

### Génération

```typescript
// Basé sur l'ID de la facture
ID facture : 17
→ Padded : 0000000017
→ + Random : 0000000017 + 1234567890123456
→ = 26 digits : 00000000171234567890123456
→ Checksum : 7 (calculé)
→ QR-Reference finale : 000000001712345678901234567
```

**Formatage pour affichage :**
```
21 00000 00017 12345 67890 12345 67
```

---

## 🧪 Comment tester

### 1. Mettre à jour la DB

```sql
-- Dans Supabase SQL Editor
ALTER TABLE public.company_settings 
ADD COLUMN IF NOT EXISTS qr_iban TEXT;

UPDATE public.company_settings
SET qr_iban = 'CH44 3199 9123 0008 8901 2'  -- ⚠️ VOTRE QR-IBAN
WHERE id = 1;
```

### 2. Créer/Ouvrir une facture

```
http://localhost:3001/factures/1
```

### 3. Générer le QR-Bill

```
Clic sur le bouton orange "QR-Bill"
→ PDF se génère (2-3 secondes)
→ PDF s'ouvre dans nouvel onglet
✅ Vous voyez le QR-bill suisse !
```

### 4. Vérifier le contenu

**Le QR-bill doit contenir :**
- ✅ Nom et adresse YourStory (créditeur)
- ✅ Nom et adresse client (débiteur)
- ✅ Montant TTC de la facture
- ✅ Référence structurée (27 chiffres)
- ✅ QR Code scannable
- ✅ Informations additionnelles (numéro facture)

### 5. Test d'impression (optionnel)

```
1. Télécharger le QR-bill
2. Imprimer sur papier A4
3. Vérifier que :
   - Les lignes de découpe sont visibles
   - Le QR code est net
   - Tout est lisible
```

---

## 📱 Validation du QR-Bill

### Validator officiel SIX

Pour valider que votre QR-bill est conforme :

1. Allez sur : https://www.swiss-qr-invoice.org/validator/
2. Uploadez le PDF généré
3. ✅ Devrait être **valide** selon le standard

### Scan du QR Code

Avec l'app de votre banque :
1. Ouvrez l'app mobile banking
2. Scannez le QR code
3. ✅ Les informations de paiement se remplissent automatiquement

---

## 🎨 Intégration dans les factures

### Option 1 : QR-Bill séparé (actuel)

```
Bouton "QR-Bill" → PDF QR-bill standalone
Le client reçoit 2 PDF :
  1. Facture complète (avec détails)
  2. QR-Bill (pour paiement)
```

### Option 2 : QR-Bill intégré (future amélioration)

Ajouter le QR-bill directement en dernière page de la facture PDF.

---

## 🔧 Configuration

### Dans company_settings

| Champ | Utilisation QR-Bill | Obligatoire |
|-------|---------------------|-------------|
| `qr_iban` | Compte de paiement | ✅ Oui |
| `agency_name` | Nom du créditeur | ✅ Oui |
| `address` | Adresse ligne 1 | ✅ Oui |
| `zip_code` | Code postal | ✅ Oui |
| `city` | Ville | ✅ Oui |
| `country` | Pays (CH) | ✅ Oui |

### Dans client

| Champ | Utilisation QR-Bill | Obligatoire |
|-------|---------------------|-------------|
| `name` | Nom du débiteur | ❌ Non* |
| `address` | Adresse débiteur | ❌ Non* |
| `zip_code` | Code postal | ❌ Non* |
| `locality` | Ville | ❌ Non* |

*Optionnel selon le standard, mais recommandé

---

## 📚 Références

### Documentation officielle

- **SIX Group QR-bill** : https://www.six-group.com/en/products-services/banking-services/payment-standardization/standards/qr-bill.html
- **Implementation Guidelines v2.3** : PDF complet avec toutes les specs
- **Validator** : https://www.swiss-qr-invoice.org/validator/

### Librairie swissqrbill

- **GitHub** : https://github.com/schoero/swissqrbill
- **NPM** : https://www.npmjs.com/package/swissqrbill
- **Exemples** : Voir le README GitHub

---

## 🐛 Dépannage

### Erreur "QR-IBAN requis"
→ Ajoutez le `qr_iban` dans company_settings
→ Exécutez la migration SQL

### QR-Bill invalide selon le validator
→ Vérifiez le QR-IBAN (format CH + 19 chiffres)
→ Vérifiez l'adresse complète (rue, code postal, ville)
→ Vérifiez que tous les champs obligatoires sont remplis

### Le QR Code ne scanne pas
→ Le PDF doit être de bonne qualité
→ Imprimez sur du papier blanc
→ Testez avec plusieurs apps bancaires

### Montant incorrect
→ Le montant vient de `invoice.total_ttc`
→ Vérifiez que le calcul est correct

---

## 📈 Avantages du QR-Bill

✅ **Paiement simplifié** pour les clients
✅ **Scan du QR** = Tous les champs pré-remplis
✅ **Moins d'erreurs** de saisie
✅ **Conforme** au standard suisse obligatoire
✅ **Traçabilité** via la référence structurée
✅ **Compatible** avec toutes les banques suisses

---

## 🎯 Prochaines améliorations possibles

### Court terme
- [ ] Intégrer QR-bill en dernière page du PDF facture
- [ ] Option pour désactiver/activer le QR-bill
- [ ] Personnaliser les infos additionnelles

### Moyen terme
- [ ] QR-bill avec montant vide (client saisit)
- [ ] QR-bill pour acomptes
- [ ] Multi-devises (CHF, EUR)
- [ ] Tests automatisés

### Long terme
- [ ] Réconciliation automatique des paiements
- [ ] API callback de la banque
- [ ] Matching QR-reference → Facture

---

## ✅ Checklist de déploiement

Avant d'utiliser en production :

- [ ] Obtenir le QR-IBAN officiel de votre banque
- [ ] Mettre à jour `qr_iban` dans company_settings
- [ ] Vérifier adresse complète de YourStory
- [ ] Tester avec le validator SIX
- [ ] Scanner avec app bancaire réelle
- [ ] Imprimer un test
- [ ] Former les utilisateurs

---

**🎊 Le module QR-Bill suisse est maintenant intégré dans l'application !**

Les clients peuvent scanner le QR code pour payer directement depuis leur app bancaire ! 📱💰


