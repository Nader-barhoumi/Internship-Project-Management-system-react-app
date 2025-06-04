// Utilitaire de sélection de composants traduits en fonction de la langue

import { useEffect, useState } from 'react'
import StudentManagement from './student-management'
import StudentManagementFR from './student-management-fr'
import InternshipManagement from './internship-management'
import InternshipManagementFR from './internship-management-fr'
import PDFViewerComp from './pdf-viewer'
import PDFViewerCompFR from './pdf-viewer-fr'
import PDFViewerDemoComp from './pdf-viewer-demo'
import PDFViewerDemoCompFR from './pdf-viewer-demo-fr'

// Type représentant un composant disponible en plusieurs langues
type LocalizedComponent = {
  default: React.ComponentType<any>
  fr: React.ComponentType<any>
}

// Table de correspondance des composants traduits
const localizedComponents: Record<string, LocalizedComponent> = {
  'StudentManagement': {
    default: StudentManagement,
    fr: StudentManagementFR
  },
  'InternshipManagement': {
    default: InternshipManagement,
    fr: InternshipManagementFR
  },
  'PDFViewer': {
    default: PDFViewerComp,
    fr: PDFViewerCompFR
  },
  'PDFViewerDemo': {
    default: PDFViewerDemoComp,
    fr: PDFViewerDemoCompFR
  }
  // Ajouter d'autres composants traduits ici
}

/**
 * Hook qui retourne le composant approprié en fonction de la langue actuelle
 * @param componentName - Nom du composant à localiser
 * @returns Le composant correspondant à la langue actuelle
 */
export function useLocalizedComponent(componentName: string) {
  const [locale, setLocale] = useState('fr') // Français par défaut
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    // Récupère la langue depuis le cookie ou utilise la langue par défaut
    const getLocaleFromCookie = () => {
      if (typeof document !== 'undefined') {
        const match = document.cookie.match(new RegExp('(^| )NEXT_LOCALE=([^;]+)'))
        return match ? match[2] : 'fr'
      }
      return 'fr'
    }
    
    setLocale(getLocaleFromCookie())
  }, [])

  useEffect(() => {
    // Sélectionne le composant approprié en fonction de la langue
    if (componentName in localizedComponents) {
      const loc = localizedComponents[componentName]
      setComponent(locale === 'fr' ? loc.fr : loc.default)
    } else {
      console.warn(`Composant non trouvé: ${componentName}`)
      setComponent(null)
    }
  }, [componentName, locale])

  return Component
}

/**
 * Wrapper de composant localisé
 * @param props.name - Nom du composant à localiser
 * @param props.fallback - Composant de secours en cas d'échec de localisation
 * @param props.componentProps - Props à passer au composant localisé
 */
export default function LocalizedComponent({ 
  name, 
  fallback = null,
  ...componentProps 
}: { 
  name: string, 
  fallback?: React.ReactNode,
  [key: string]: any
}) {
  const Component = useLocalizedComponent(name)
  
  if (!Component) {
    return fallback
  }
  
  return <Component {...componentProps} />
}
