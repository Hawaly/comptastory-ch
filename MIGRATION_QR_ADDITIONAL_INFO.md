# Migration : Ajouter qr_additional_info à la table invoice

## ⚠️ Erreur actuelle

Si vous voyez cette erreur lors de la création d'une facture :
```
Could not find the 'qr_additional_info' column of 'invoice' in the schema cache
```

Cela signifie que la colonne `qr_additional_info` n'existe pas encore dans votre table `invoice` dans Supabase.

## ✅ Solution : Exécuter la migration

### Étape 1 : Ouvrir Supabase SQL Editor

1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans **SQL Editor** (dans le menu de gauche)

### Étape 2 : Exécuter la migration

Copiez et collez ce SQL dans l'éditeur :

```sql
-- Migration: Ajouter le champ qr_additional_info à la table invoice
-- Ce champ permet de personnaliser l'information supplémentaire dans le QR-bill

ALTER TABLE public.invoice
ADD COLUMN IF NOT EXISTS qr_additional_info TEXT;

-- Commentaire pour documenter le champ
COMMENT ON COLUMN public.invoice.qr_additional_info IS 'Information supplémentaire personnalisable pour le QR-bill (max 140 caractères selon specs SIX)';
```

### Étape 3 : Exécuter

Cliquez sur **Run** (ou appuyez sur `Ctrl+Enter` / `Cmd+Enter`)

### Étape 4 : Vérifier

Vous devriez voir un message de succès. Pour vérifier que la colonne existe :

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'invoice' 
AND column_name = 'qr_additional_info';
```

Vous devriez voir une ligne avec `qr_additional_info` et `text`.

## 📝 Note

- La colonne est **optionnelle** (peut être `NULL`)
- Elle accepte jusqu'à **140 caractères** (selon les spécifications SIX pour QR-bill)
- Elle est utilisée dans le message du QR-bill si remplie

## ✅ Après la migration

Une fois la migration exécutée :
1. Rechargez votre application
2. Essayez de créer une nouvelle facture
3. L'erreur devrait disparaître


