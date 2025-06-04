"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, Lightbulb, CheckCircle, AlertCircle, Loader2, Wand2 } from "lucide-react"

interface AISuggestion {
  id: string
  type: "content" | "structure" | "improvement"
  title: string
  suggestion: string
  confidence: number
  category: string
}

interface DocumentAnalysis {
  wordCount: number
  readabilityScore: number
  completeness: number
  suggestions: AISuggestion[]
  missingElements: string[]
}

interface AIDocumentAssistantProps {
  documentType: string
  currentContent: string
  onContentUpdate: (content: string) => void
  onSuggestionApply: (suggestion: AISuggestion) => void
}

export default function AIDocumentAssistantFr({
  documentType,
  currentContent,
  onContentUpdate,
  onSuggestionApply,
}: AIDocumentAssistantProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null)
  const [activeTab, setActiveTab] = useState("suggestions")

  // Simulation d'une analyse IA - en production, cela appellerait votre service IA
  const analyzeDocument = async () => {
    setIsAnalyzing(true)

    // Simuler l'analyse IA
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockAnalysis: DocumentAnalysis = {
      wordCount: currentContent.split(" ").length,
      readabilityScore: Math.floor(Math.random() * 40) + 60, // 60-100
      completeness: Math.floor(Math.random() * 30) + 70, // 70-100
      suggestions: [
        {
          id: "1",
          type: "content",
          title: "Ajouter des Objectifs Spécifiques",
          suggestion:
            "Envisagez d'ajouter des objectifs d'apprentissage plus spécifiques pour ce stage. Par exemple: 'Développer des compétences en frameworks React.js et Next.js' ou 'Acquérir de l'expérience en méthodologies de développement agile.'",
          confidence: 85,
          category: "Amélioration du Contenu",
        },
        {
          id: "2",
          type: "structure",
          title: "Améliorer la Structure du Document",
          suggestion:
            "Ajoutez des en-têtes de section clairs pour améliorer la lisibilité. Sections suggérées: Introduction, Objectifs, Tâches et Responsabilités, Calendrier, Critères d'Évaluation.",
          confidence: 92,
          category: "Structure",
        },
        {
          id: "3",
          type: "improvement",
          title: "Améliorer le Langage Professionnel",
          suggestion:
            "Remplacez les expressions informelles par un langage plus professionnel. Par exemple, changez 'travailler sur des trucs' par 'collaborer sur les livrables du projet.'",
          confidence: 78,
          category: "Langage",
        },
        {
          id: "4",
          type: "content",
          title: "Ajouter des Informations de Conformité",
          suggestion:
            "Incluez des informations sur la conformité à la protection des données et les accords de confidentialité conformément au droit du travail tunisien.",
          confidence: 95,
          category: "Conformité Légale",
        },
      ],
      missingElements: [
        "Coordonnées de l'étudiant",
        "Informations de contact en cas d'urgence",
        "Informations d'assurance",
        "Critères d'évaluation",
      ],
    }

    setAnalysis(mockAnalysis)
    setIsAnalyzing(false)
  }

  // Simulation de génération de contenu IA
  const generateContent = async (prompt: string) => {
    setIsGenerating(true)

    // Simuler la génération IA
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const templates = {
      internship_agreement: `
CONVENTION DE STAGE

1. PARTIES
Cette convention est conclue entre :
- Étudiant : [Nom de l'Étudiant]
- Université : [Nom de l'Université]
- Entreprise : [Nom de l'Entreprise]

2. DÉTAILS DU STAGE
- Poste : [Poste du Stage]
- Département : [Nom du Département]
- Durée : du [Date de Début] au [Date de Fin]
- Horaires de Travail : [Heures par semaine]

3. OBJECTIFS
Les objectifs principaux de ce stage sont :
- Fournir une expérience pratique dans [Domaine/Industrie]
- Développer des compétences professionnelles en [Compétences Spécifiques]
- Appliquer les connaissances théoriques dans des scénarios réels
- Favoriser le développement professionnel et la préparation à la carrière

4. RESPONSABILITÉS
Responsabilités de l'Étudiant :
- Maintenir une conduite professionnelle en tout temps
- Accomplir les tâches assignées avec diligence et dans les délais
- Respecter les politiques et procédures de l'entreprise
- Maintenir la confidentialité des informations de l'entreprise

Responsabilités de l'Entreprise :
- Fournir une supervision et des conseils adéquats
- Assurer un environnement de travail sûr
- Fournir les ressources et la formation nécessaires
- Mener des évaluations régulières des performances

5. ÉVALUATION
Les performances seront évaluées en fonction de :
- Qualité du travail accompli
- Comportement et attitude professionnels
- Initiative et capacités à résoudre des problèmes
- Respect des délais et des horaires

6. CONDITIONS GÉNÉRALES
- Ce stage est non rémunéré/rémunéré [préciser]
- L'étudiant doit maintenir [moyenne minimale/exigences]
- Toute propriété intellectuelle créée appartient à [préciser la propriété]
- Chaque partie peut résilier avec un préavis de [période de préavis]

7. SIGNATURES
Étudiant : _________________ Date : _________
Superviseur en Entreprise : _________________ Date : _________
Superviseur Académique : _________________ Date : _________
`,
      evaluation: `
FORMULAIRE D'ÉVALUATION DE STAGE

Information sur l'Étudiant :
- Nom : [Nom de l'Étudiant]
- Numéro d'Étudiant : [Numéro d'Identification]
- Programme : [Programme d'Études]
- Période de Stage : [Date de Début] - [Date de Fin]

Information sur l'Entreprise :
- Entreprise : [Nom de l'Entreprise]
- Superviseur : [Nom du Superviseur]
- Département : [Département]

ÉVALUATION DES PERFORMANCES

1. Compétences Techniques (25%)
□ Excellent (90-100%) □ Bon (80-89%) □ Satisfaisant (70-79%) □ À Améliorer (<70%)
Commentaires : ________________________________

2. Comportement Professionnel (25%)
□ Excellent (90-100%) □ Bon (80-89%) □ Satisfaisant (70-79%) □ À Améliorer (<70%)
Commentaires : ________________________________

3. Compétences en Communication (25%)
□ Excellent (90-100%) □ Bon (80-89%) □ Satisfaisant (70-79%) □ À Améliorer (<70%)
Commentaires : ________________________________

4. Initiative et Résolution de Problèmes (25%)
□ Excellent (90-100%) □ Bon (80-89%) □ Satisfaisant (70-79%) □ À Améliorer (<70%)
Commentaires : ________________________________

PERFORMANCE GLOBALE :
□ Excellent □ Bon □ Satisfaisant □ À Améliorer

RECOMMANDATIONS :
_________________________________________________

Signature du Superviseur : _________________ Date : _________
`,
      pfe_report: `
MODÈLE DE RAPPORT DE PROJET DE FIN D'ÉTUDES

PAGE DE TITRE
- Titre du Projet : [Votre Titre de Projet]
- Nom de l'Étudiant : [Votre Nom]
- Numéro d'Étudiant : [Votre Identifiant]
- Année Académique : [Année]
- Superviseur : [Nom du Superviseur]
- Entreprise : [Nom de l'Entreprise] (le cas échéant)

RÉSUMÉ
[Bref résumé du projet, des objectifs, de la méthodologie et des principales conclusions - 200-300 mots]

TABLE DES MATIÈRES
1. Introduction
2. Revue de la Littérature
3. Méthodologie
4. Implémentation
5. Résultats et Analyse
6. Conclusion et Travaux Futurs
7. Références
8. Annexes

1. INTRODUCTION
1.1 Contexte et Cadre
[Fournir le contexte de votre projet]

1.2 Énoncé du Problème
[Définir clairement le problème que vous abordez]

1.3 Objectifs
- Objectif Principal : [But principal]
- Objectifs Secondaires : [Buts secondaires]

1.4 Portée et Limitations
[Définir ce qui est inclus et exclu]

2. REVUE DE LA LITTÉRATURE
[Examiner les sources académiques et industrielles pertinentes]

3. MÉTHODOLOGIE
3.1 Approche de Recherche
[Décrire votre méthodologie]

3.2 Outils et Technologies
[Lister les technologies, frameworks, outils utilisés]

3.3 Processus de Développement
[Décrire votre approche de développement]

4. IMPLÉMENTATION
4.1 Architecture du Système
[Décrire la conception globale du système]

4.2 Fonctionnalités Principales
[Détailler les principales fonctionnalités implémentées]

4.3 Défis et Solutions
[Discuter des problèmes rencontrés et comment vous les avez résolus]

5. RÉSULTATS ET ANALYSE
5.1 Résultats des Tests
[Présenter les résultats des tests et les mesures de performance]

5.2 Retour des Utilisateurs
[Inclure les retours des tests utilisateurs si applicable]

5.3 Analyse
[Analyser et interpréter vos résultats]

6. CONCLUSION ET TRAVAUX FUTURS
6.1 Synthèse des Réalisations
[Résumer ce que vous avez accompli]

6.2 Leçons Apprises
[Réfléchir sur l'expérience d'apprentissage]

6.3 Améliorations Futures
[Suggérer des améliorations et des extensions]

RÉFÉRENCES
[Lister toutes les sources citées au format APA]

ANNEXES
A. Code Source (si applicable)
B. Manuel Utilisateur
C. Documentation Supplémentaire
`,
    }

    const generatedContent =
      templates[documentType as keyof typeof templates] ||
      `Contenu généré pour ${documentType}:\n\n${prompt}\n\nCeci est un contenu généré par IA basé sur vos exigences.`

    onContentUpdate(generatedContent)
    setIsGenerating(false)
  }

  const applySuggestion = (suggestion: AISuggestion) => {
    onSuggestionApply(suggestion)
    // Supprimer la suggestion appliquée de la liste
    if (analysis) {
      setAnalysis({
        ...analysis,
        suggestions: analysis.suggestions.filter((s) => s.id !== suggestion.id),
      })
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-500"
    if (confidence >= 75) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return "high"
    if (confidence >= 75) return "medium"
    return "low"
  }

  return (
    <div className="space-y-6">
      {/* En-tête de l'Assistant IA */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <CardTitle>Assistant IA de Documents</CardTitle>
          </div>
          <CardDescription>
            Obtenez des suggestions intelligentes et une génération automatique de contenu pour vos documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button
              onClick={analyzeDocument}
              disabled={isAnalyzing || !currentContent.trim()}
              className="flex items-center space-x-2"
            >
              {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
              <span>{isAnalyzing ? "Analyse en cours..." : "Analyser le Document"}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => generateContent("Générer un contenu complet")}
              disabled={isGenerating}
              className="flex items-center space-x-2"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              <span>{isGenerating ? "Génération en cours..." : "Générer un Modèle"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Résultats d'Analyse */}
      {analysis && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions">Suggestions IA</TabsTrigger>
            <TabsTrigger value="analysis">Analyse du Document</TabsTrigger>
            <TabsTrigger value="checklist">Vérification de Complétude</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4">
            {analysis.suggestions.length > 0 ? (
              analysis.suggestions.map((suggestion) => (
                <Card key={suggestion.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <CardTitle className="text-base">{suggestion.title}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{suggestion.category}</Badge>
                        <Badge variant={getConfidenceBadge(suggestion.confidence) === "high" ? "default" : "secondary"}>
                          {suggestion.confidence}% de confiance
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{suggestion.suggestion}</p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => applySuggestion(suggestion)}
                        className="flex items-center space-x-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        <span>Appliquer la Suggestion</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        Ignorer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Aucune suggestion disponible. Cliquez sur "Analyser le Document" pour obtenir des recommandations basées sur l'IA.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Nombre de Mots</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.wordCount}</div>
                  <p className="text-xs text-gray-500">mots</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Score de Lisibilité</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.readabilityScore}/100</div>
                  <Progress value={analysis.readabilityScore} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Complétude</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.completeness}%</div>
                  <Progress value={analysis.completeness} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="checklist" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Éléments Manquants</CardTitle>
                <CardDescription>
                  Sections ou informations importantes qui devraient être incluses dans votre document
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysis.missingElements.length > 0 ? (
                  <div className="space-y-2">
                    {analysis.missingElements.map((element, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">{element}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Tous les éléments requis sont présents !</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
