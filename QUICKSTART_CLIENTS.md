# 🚀 Démarrage Rapide - Module Clients

Guide ultra-rapide pour utiliser le module clients.

---

## ⚡ En 3 étapes

### 1. Accéder à la liste des clients

```
http://localhost:3001/clients
```

### 2. Créer votre premier client

1. Cliquez sur **"Nouveau client"**
2. Remplissez au minimum le **Nom**
3. Choisissez le **Type** et le **Statut**
4. Cliquez sur **"Créer"**

### 3. C'est tout !

Vous pouvez maintenant :
- ✅ Voir la liste de tous vos clients
- ✅ Rechercher par nom, email ou entreprise
- ✅ Filtrer par type (One-shot, Mensuel)
- ✅ Filtrer par statut (Actif, Potentiel, etc.)
- ✅ Modifier un client
- ✅ Voir les détails complets
- ✅ Supprimer un client

---

## 📋 Exemple de client

```
Nom : Entreprise XYZ
Entreprise : XYZ Sàrl
Type : Mensuel
Statut : Actif
Email : contact@xyz.ch
Téléphone : +41 79 123 45 67
Notes : Client important, facturation mensuelle
```

---

## 🎯 Pages disponibles

| Route | Description |
|-------|-------------|
| `/clients` | Liste avec recherche et filtres |
| `/clients/new` | Créer un nouveau client |
| `/clients/[id]` | Détails du client |
| `/clients/[id]/edit` | Modifier le client |

---

## 🎨 Fonctionnalités

### Recherche
Tapez dans la barre de recherche pour filtrer par :
- Nom du client
- Email
- Nom d'entreprise

### Filtres
- **Type** : One-shot ou Mensuel
- **Statut** : Actif, Potentiel, Pause, Terminé

### Actions rapides
- Email et téléphone **cliquables**
- **Badges colorés** pour type et statut
- **Navigation fluide** entre les pages

---

## 🐛 Problème ?

### Aucun client affiché
→ Créez-en un avec le bouton "Nouveau client"

### Erreur lors de la création
→ Vérifiez que le champ "Nom" est rempli

### Tableau vide après recherche
→ Effacez la recherche ou ajustez les filtres

---

**Pour plus de détails, consultez `RECAP_ETAPE3_CLIENTS.md`**

