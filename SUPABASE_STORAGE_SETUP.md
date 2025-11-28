# Configuration Supabase Storage pour les Contrats

## 📦 Créer le bucket "contracts"

### Via l'interface Supabase

1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **Storage**
4. Cliquez sur **"New bucket"** (ou "Create a new bucket")
5. Configurez le bucket :
   - **Name** : `contracts`
   - **Public** : ❌ Non (décochez, les contrats sont privés)
   - **Allowed MIME types** : `application/pdf`
   - **Max file size** : `10 MB` (ou plus selon vos besoins)
6. Cliquez sur **Create bucket**

### Via SQL (alternative)

```sql
-- Créer le bucket contracts
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', false);

-- Configurer les politiques d'accès (RLS)
-- Permettre l'upload authentifié
CREATE POLICY "Authenticated users can upload contracts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contracts');

-- Permettre la lecture authentifiée
CREATE POLICY "Authenticated users can read contracts"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'contracts');

-- Permettre la suppression authentifiée
CREATE POLICY "Authenticated users can delete contracts"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'contracts');
```

## 🔐 Politiques RLS (Row Level Security)

**Important :** Pour que l'upload fonctionne, vous devez configurer les politiques RLS.

### Option 1 : Désactiver RLS temporairement (développement)

1. Allez dans **Storage** > **Policies**
2. Désactivez RLS pour le bucket `contracts` (pour tester)

### Option 2 : Configurer RLS correctement

Créez des politiques qui permettent :
- **INSERT** : Utilisateurs authentifiés peuvent uploader
- **SELECT** : Utilisateurs authentifiés peuvent télécharger
- **DELETE** : Utilisateurs authentifiés peuvent supprimer

## ✅ Vérification

Pour vérifier que le bucket existe :

```sql
SELECT * FROM storage.buckets WHERE name = 'contracts';
```

Résultat attendu :
```
id       | name      | public
---------|-----------|--------
contracts| contracts | false
```

## 📝 Note

Si vous préférez **ne pas utiliser Supabase Storage** pour l'instant, le code peut stocker les PDF localement dans `public/uploads/contracts/`. Je vous recommande cependant Supabase Storage pour la production.

---

**Une fois le bucket créé, le système de génération de contrats fonctionnera automatiquement !**

