import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractId = params.id;

    // Récupérer les informations du contrat
    const { data: contrat, error: contratError } = await supabase
      .from('contrat')
      .select('*')
      .eq('id', contractId)
      .single();

    if (contratError || !contrat) {
      return NextResponse.json(
        { error: 'Contrat non trouvé' },
        { status: 404 }
      );
    }

    // Si le chemin commence par /uploads, c'est un fichier local
    if (contrat.file_path.startsWith('/uploads')) {
      const fullUrl = new URL(contrat.file_path, request.url);
      return NextResponse.redirect(fullUrl);
    }

    // Sinon Supabase Storage (pour migration future)
    const { data } = await supabase.storage
      .from('contracts')
      .createSignedUrl(contrat.file_path, 3600);

    if (!data?.signedUrl) {
      throw new Error('Impossible de générer l\'URL');
    }

    return NextResponse.redirect(data.signedUrl);

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur téléchargement contrat:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors du téléchargement' },
      { status: 500 }
    );
  }
}

