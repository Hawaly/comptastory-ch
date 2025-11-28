# Configuration Supabase Storage pour les Justificatifs

## 📦 Créer le bucket "receipts"

### Via l'interface Supabase

1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. **Storage** → **New bucket**
4. Configurez :
   - **Name** : `receipts`
   - **Public** : ❌ Non (privé)
   - **Allowed MIME types** : `application/pdf, image/png, image/jpeg, image/jpg`
   - **Max file size** : `10 MB`
5. **Create bucket**

### Via SQL

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false);
```

## 🔐 Politiques RLS

### Développement (désactiver RLS)

Dans **Storage** → **Policies** → Bucket `receipts` → **Disable RLS**

### Production (configurer RLS)

```sql
-- Upload
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'receipts');

-- Lecture
CREATE POLICY "Authenticated users can read receipts"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'receipts');

-- Suppression
CREATE POLICY "Authenticated users can delete receipts"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'receipts');
```

## ✅ Vérification

```sql
SELECT * FROM storage.buckets WHERE name = 'receipts';
```

Résultat attendu :
```
id       | name     | public
---------|----------|--------
receipts | receipts | false
```

---

**✅ Une fois le bucket créé, l'upload de justificatifs fonctionnera automatiquement !**

