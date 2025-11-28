import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoice')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice || !invoice.pdf_path) {
      return NextResponse.json(
        { error: 'Facture ou PDF non trouvé' },
        { status: 404 }
      );
    }

    // Si le chemin commence par /uploads, c'est un fichier local
    if (invoice.pdf_path.startsWith('/uploads')) {
      // Rediriger vers le fichier local
      const fullUrl = new URL(invoice.pdf_path, request.url);
      return NextResponse.redirect(fullUrl);
    }

    // Sinon, c'est dans Supabase Storage (pour migration future)
    const { data } = await supabase.storage
      .from('contracts')
      .createSignedUrl(invoice.pdf_path, 3600);

    if (!data?.signedUrl) {
      throw new Error('Impossible de générer l\'URL de téléchargement');
    }

    return NextResponse.redirect(data.signedUrl);

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erreur téléchargement facture:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors du téléchargement' },
      { status: 500 }
    );
  }
}

