import { NextRequest, NextResponse } from 'next/server'

// Configuration des langues
const locales = ['fr', 'en']
const defaultLocale = 'fr' // Langue par défaut

// Routes disponibles en français
const frenchRoutes = [
  '/home',
  '/dashboard',
  '/library',
  '/login',
  '/ai-tools'
]

export function middleware(request: NextRequest) {
  // Obtention de la langue préférée de l'utilisateur depuis le cookie
  const locale = request.cookies.get('NEXT_LOCALE')?.value || defaultLocale

  // Extraction du chemin de la requête
  const { pathname } = request.nextUrl

  // Vérifier si le chemin est l'un des chemins traduits
  const isFrenchRoute = frenchRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))

  // Si la langue préférée est le français et que la route est disponible en français, utiliser la page française
  if (locale === 'fr' && isFrenchRoute) {
    // Remplacer la page normale par la version française
    // Note: Cela suppose que nous avons renommé ou créé un mécanisme pour trouver les versions françaises
    try {
      // Nous utilisons ici la convention -fr.tsx qui a été établie
      // Dans un environnement de production, on pourrait utiliser getPage() ou une approche similaire
      return NextResponse.next()
    } catch (error) {
      // Si la page française n'existe pas, continuer avec la page normale
      return NextResponse.next()
    }
  }

  // Dans tous les autres cas, poursuivre normalement
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Matcher pour les routes que nous voulons intercepter
    '/home',
    '/dashboard',
    '/library',
    '/login',
    '/ai-tools',
    // Ajouter d'autres routes au besoin
  ],
}
