"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Bot, Scan, FileText, Sparkles, Zap, Target } from "lucide-react"
import Link from "next/link"
import AIDocumentAssistant from "@/components/ai-document-assistant"
import OCRScanner from "@/components/ocr-scanner"
import PDFViewerDemo from "@/components/pdf-viewer-demo"

export default function AIToolsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [extractedText, setExtractedText] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")

  const features = [
    {
      icon: Bot,
      title: "Assistant IA pour Documents",
      description: "Obtenez des suggestions intelligentes et générez automatiquement du contenu professionnel pour vos documents",
      benefits: ["Suggestions de contenu intelligent", "Améliorations grammaticales et stylistiques", "Génération de modèles"],
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Scan,
      title: "Scanner OCR de Texte",
      description: "Extrayez du texte à partir d'images et de documents numérisés avec une grande précision",
      benefits: ["Précision de plus de 99%", "Formats de fichiers multiples", "Extraction instantanée de texte"],
      color: "bg-green-100 text-green-600",
    },
    {
      icon: FileText,
      title: "Outils PDF",
      description: "Visualisez, analysez et travaillez avec des documents PDF directement dans votre navigateur",
      benefits: ["Visualisation dans le navigateur", "Extraction de texte", "Analyse de documents"],
      color: "bg-purple-100 text-purple-600",
    },
  ]

  const useCases = [
    {
      title: "Création de Documents",
      description: "Utilisez l'IA pour générer des conventions de stage et des rapports professionnels",
      steps: ["Sélectionnez le type de document", "Obtenez des suggestions IA", "Révisez et personnalisez", "Générez le document final"],
    },
    {
      title: "Numérisation de Texte",
      description: "Convertissez des documents numérisés et notes manuscrites en texte numérique",
      steps: ["Téléchargez une image/numérisation", "Traitement OCR", "Révisez le texte extrait", "Exportez ou utilisez dans des documents"],
    },
    {
      title: "Analyse de Documents",
      description: "Analysez des documents PDF pour vérifier leur exhaustivité et leur qualité",
      steps: ["Téléchargez un PDF", "Analyse par IA", "Recevez des suggestions d'amélioration", "Appliquez les recommandations"],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au Tableau de Bord
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Outils IA & OCR</h1>
                <p className="text-gray-600">Traitement intelligent et automatisation de documents</p>
              </div>
            </div>
            <Badge variant="default" className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Sparkles className="h-3 w-3 mr-1" />
              Alimenté par l'IA
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="ai-assistant">Assistant IA</TabsTrigger>
            <TabsTrigger value="ocr-scanner">Scanner OCR</TabsTrigger>
            <TabsTrigger value="pdf-tools">Outils PDF</TabsTrigger>
            <TabsTrigger value="tutorials">Tutoriels</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Hero Section */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <Badge className="mb-3 bg-blue-600">Nouvelle Fonctionnalité</Badge>
                    <h2 className="text-3xl font-bold mb-4">Transformez la gestion de vos documents académiques</h2>
                    <p className="text-lg text-gray-700 mb-6">
                      Simplifiez votre travail académique avec notre suite d'outils basés sur l'intelligence artificielle.
                      Automatisez les tâches, extrayez des textes de documents scannés et générez du contenu intelligent.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="bg-green-100 rounded-full p-1 mr-3">
                          <Zap className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-gray-700">Économisez jusqu'à 75% de temps sur la documentation</p>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-green-100 rounded-full p-1 mr-3">
                          <Zap className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-gray-700">Extrayez du texte des images avec une précision de 99%</p>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-green-100 rounded-full p-1 mr-3">
                          <Zap className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-gray-700">Générez automatiquement des documents basés sur des modèles</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                        <div className="flex items-center mb-3">
                          <Bot className="h-6 w-6 text-blue-600 mr-2" />
                          <h3 className="font-semibold text-gray-900">Assistant de Document</h3>
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 bg-gray-100 rounded p-3">
                            Je peux aider à générer votre convention de stage. De quelles informations avez-vous besoin ?
                          </p>
                          <p className="text-sm text-gray-700 bg-blue-50 rounded p-3">
                            J'ai besoin d'une convention de stage pour un stage en informatique chez TechCorp, du 1er juin au 30 août.
                          </p>
                          <p className="text-sm text-gray-600 bg-gray-100 rounded p-3">
                            Génération d'une convention de stage pour un stage en informatique chez TechCorp...
                          </p>
                        </div>
                      </div>
                      <div className="absolute -bottom-4 -right-4 bg-green-100 p-4 rounded-full shadow-lg border border-green-200">
                        <Sparkles className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <h2 className="text-2xl font-bold mt-8 mb-6">Fonctionnalités principales</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="border-2 hover:border-blue-200 transition-all duration-200">
                  <CardHeader>
                    <div className={`rounded-lg w-12 h-12 flex items-center justify-center mb-2 ${feature.color}`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center">
                          <div className="bg-gray-100 rounded-full p-1 mr-2">
                            <Target className="h-3 w-3 text-blue-600" />
                          </div>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Use Cases */}
            <h2 className="text-2xl font-bold mt-12 mb-6">Cas d'utilisation</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {useCases.map((useCase, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{useCase.title}</CardTitle>
                    <CardDescription>{useCase.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {useCase.steps.map((step, i) => (
                        <li key={i} className="flex items-start">
                          <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Get Started */}
            <Card className="mt-10 border-blue-200 bg-blue-50">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <h2 className="text-2xl font-bold mb-4">Prêt à commencer ?</h2>
                <p className="text-gray-700 mb-6 max-w-2xl">
                  Explorez nos outils d'IA et d'OCR pour simplifier vos processus documentaires et économiser du temps
                  précieux pour vos travaux académiques et stages.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => setActiveTab("ai-assistant")}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Bot className="mr-2 h-5 w-5" />
                    Essayer l'Assistant IA
                  </Button>
                  <Button
                    onClick={() => setActiveTab("ocr-scanner")}
                    variant="outline"
                    size="lg"
                  >
                    <Scan className="mr-2 h-5 w-5" />
                    Essayer le Scanner OCR
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-assistant">
            <Card>
              <CardHeader>
                <CardTitle>Assistant IA pour Documents</CardTitle>
                <CardDescription>
                  Notre assistant IA aide à la création de documents, à la génération de contenu, et à l'amélioration de textes existants.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIDocumentAssistant setGeneratedContent={setGeneratedContent} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ocr-scanner">
            <Card>
              <CardHeader>
                <CardTitle>Scanner OCR de Texte</CardTitle>
                <CardDescription>
                  Téléchargez des images ou des documents numérisés pour extraire du texte avec notre technologie OCR de pointe.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OCRScanner setExtractedText={setExtractedText} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pdf-tools">
            <Card>
              <CardHeader>
                <CardTitle>Outils PDF</CardTitle>
                <CardDescription>
                  Visualisez, analysez et travaillez avec des documents PDF directement dans votre navigateur.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PDFViewerDemo />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tutorials">
            <Card>
              <CardHeader>
                <CardTitle>Tutoriels et Guides</CardTitle>
                <CardDescription>
                  Apprenez à utiliser efficacement nos outils IA & OCR avec ces tutoriels pas à pas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">Comment extraire du texte depuis des documents numérisés</h3>
                    <div className="aspect-video rounded-md bg-gray-200 mb-4 flex items-center justify-center">
                      <FileText className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-4">
                      Ce tutoriel vous montre comment utiliser notre scanner OCR pour extraire du texte à partir 
                      d'images et de documents numérisés avec une précision optimale.
                    </p>
                    <Button variant="outline" className="w-full">
                      Voir le tutoriel
                    </Button>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">Générer des conventions de stage avec l'IA</h3>
                    <div className="aspect-video rounded-md bg-gray-200 mb-4 flex items-center justify-center">
                      <FileText className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-4">
                      Apprenez à utiliser notre assistant IA pour créer rapidement des conventions de stage 
                      professionnelles adaptées à vos besoins spécifiques.
                    </p>
                    <Button variant="outline" className="w-full">
                      Voir le tutoriel
                    </Button>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">Analyse avancée de documents PDF</h3>
                    <div className="aspect-video rounded-md bg-gray-200 mb-4 flex items-center justify-center">
                      <FileText className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-4">
                      Découvrez comment utiliser nos outils PDF pour analyser, extraire des données et travailler 
                      efficacement avec des documents académiques et administratifs.
                    </p>
                    <Button variant="outline" className="w-full">
                      Voir le tutoriel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
