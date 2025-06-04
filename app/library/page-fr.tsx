"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  GraduationCap,
  Search,
  Download,
  Eye,
  FileText,
  BookOpen,
  Scale,
  ClipboardList,
  HelpCircle,
  Filter,
  ArrowLeft,
  Bot,
} from "lucide-react"
import Link from "next/link"

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const documents = [
    {
      id: 1,
      title: "Modèle de Convention de Stage",
      description: "Modèle standard pour les conventions de stage entre étudiants, universités et entreprises",
      category: "templates",
      type: "PDF",
      size: "245 Ko",
      downloads: 1250,
      tags: ["stage", "convention", "juridique"],
    },
    {
      id: 2,
      title: "Formulaire d'Évaluation d'Étudiant",
      description: "Formulaire d'évaluation complet pour évaluer la performance des étudiants pendant les stages",
      category: "academic",
      type: "PDF",
      size: "180 Ko",
      downloads: 890,
      tags: ["évaluation", "appréciation", "performance"],
    },
    {
      id: 3,
      title: "Guide d'Inscription pour Entreprises",
      description: "Guide étape par étape pour les entreprises souhaitant s'inscrire et participer au programme de stage",
      category: "guides",
      type: "PDF",
      size: "320 Ko",
      downloads: 567,
      tags: ["entreprise", "inscription", "guide"],
    },
    {
      id: 4,
      title: "Cadre Juridique des Stages",
      description: "Aperçu complet des exigences légales et réglementations pour les programmes de stage",
      category: "legal",
      type: "PDF",
      size: "450 Ko",
      downloads: 423,
      tags: ["juridique", "règlements", "conformité"],
    },
    {
      id: 5,
      title: "Modèle de Proposition de Projet",
      description: "Modèle pour les étudiants souhaitant soumettre leurs propositions de projet de fin d'études",
      category: "templates",
      type: "DOCX",
      size: "125 Ko",
      downloads: 1100,
      tags: ["projet", "proposition", "modèle"],
    },
    {
      id: 6,
      title: "Calendrier Académique 2024",
      description: "Calendrier académique officiel avec dates importantes et délais",
      category: "academic",
      type: "PDF",
      size: "95 Ko",
      downloads: 2100,
      tags: ["calendrier", "dates", "académique"],
    },
    {
      id: 7,
      title: "Meilleures Pratiques de Stage",
      description: "Directives et meilleures pratiques pour des expériences de stage réussies",
      category: "guides",
      type: "PDF",
      size: "280 Ko",
      downloads: 756,
      tags: ["meilleures pratiques", "directives", "réussite"],
    },
    {
      id: 8,
      title: "Politique de Protection des Données",
      description: "Politique universitaire sur la protection des données et la confidentialité des informations des étudiants",
      category: "legal",
      type: "PDF",
      size: "210 Ko",
      downloads: 345,
      tags: ["protection des données", "confidentialité", "politique"],
    },
  ]

  const categories = [
    { id: "all", label: "Tous les Documents", icon: FileText, count: documents.length },
    {
      id: "academic",
      label: "Académique",
      icon: BookOpen,
      count: documents.filter((d) => d.category === "academic").length,
    },
    { id: "legal", label: "Juridique", icon: Scale, count: documents.filter((d) => d.category === "legal").length },
    {
      id: "templates",
      label: "Modèles",
      icon: ClipboardList,
      count: documents.filter((d) => d.category === "templates").length,
    },
    { id: "guides", label: "Guides", icon: HelpCircle, count: documents.filter((d) => d.category === "guides").length },
  ]

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleDownload = (document: any) => {
    // Simuler le téléchargement
    console.log(`Téléchargement: ${document.title}`)
    // Dans une application réelle, cela déclencherait un téléchargement
  }

  const handlePreview = (document: any) => {
    // Simuler l'aperçu
    console.log(`Aperçu: ${document.title}`)
    // Dans une application réelle, cela ouvrirait un modal d'aperçu ou un nouvel onglet
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Bibliothèque de Documents</h1>
                <p className="text-xs text-gray-500">Ressources Publiques & Modèles</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/home">
                <Button variant="ghost" size="sm" className="flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Retour à l'Accueil
                </Button>
              </Link>
              <Link href="/ai-tools">
                <Button variant="outline" size="sm" className="flex items-center">
                  <Bot className="h-4 w-4 mr-1" />
                  Outils IA
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Bibliothèque de Documents</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Accédez aux modèles, guides et ressources pour la gestion académique. Aucun compte requis.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Rechercher des documents par titre, description ou mot-clé..." 
                className="pl-9" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Tabs defaultValue={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                <TabsList className="grid grid-cols-2 md:flex md:grid-cols-none">
                  {categories.map((cat) => (
                    <TabsTrigger key={cat.id} value={cat.id} className="flex items-center">
                      <div className="flex items-center">
                        <cat.icon className="h-4 w-4 mr-1" />
                        <span className="hidden md:inline">{cat.label}</span>
                      </div>
                      <Badge variant="secondary" className="ml-1 px-1">
                        {cat.count}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Affichage de {filteredDocuments.length} sur {documents.length} documents
          </p>
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{document.title}</CardTitle>
                    <CardDescription className="mt-1">{document.description}</CardDescription>
                  </div>
                  <Badge variant={document.category === "templates" ? "default" : "outline"}>
                    {document.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <div className="text-gray-500">Taille: {document.size}</div>
                    <div className="text-gray-500">{document.downloads} téléchargements</div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-between pt-2 border-t border-gray-100 mt-4">
                    <Button variant="ghost" size="sm" onClick={() => handlePreview(document)} className="text-blue-600">
                      <Eye className="h-4 w-4 mr-1" />
                      Aperçu
                    </Button>
                    <Button size="sm" onClick={() => handleDownload(document)}>
                      <Download className="h-4 w-4 mr-1" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Système de Gestion des Projets de Stage. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
