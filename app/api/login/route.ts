import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabaseClient';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Récupération des données du formulaire
    const body = await request.json();
    const { username, password } = body;

    // Validation des champs
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username et password sont requis' },
        { status: 400 }
      );
    }

    // Recherche de l'utilisateur dans Supabase
    const { data: users, error: dbError } = await supabase
      .from('app_user')
      .select('id, username, password_hash, is_active')
      .eq('username', username)
      .eq('is_active', true)
      .limit(1);

    // Gestion des erreurs de base de données
    if (dbError) {
      console.error('Erreur Supabase:', dbError);
      return NextResponse.json(
        { error: 'Erreur lors de la connexion à la base de données' },
        { status: 500 }
      );
    }

    // Vérification si l'utilisateur existe
    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Comparaison du mot de passe avec bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    // Création de la session
    await createSession({
      userId: user.id,
      username: user.username,
    });

    // Réponse de succès
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
      },
    });

  } catch (error) {
    console.error('Erreur lors du login:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    );
  }
}


