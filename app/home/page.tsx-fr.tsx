"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  Users,
  Building2,
  FileText,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Shield,
  Clock,
  Award,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const features = [
    {
      icon: Users,
      title: "Gestion des Étudiants",
      description: "Profils d'étudiants complets, suivi académique et surveillance des progrès",
    },
    {
      icon: Building2,
      title: "Partenariats Entreprises",
      description: "Gérer les relations avec les partenaires industriels et les fournisseurs de stages",
    },
    {
      icon: FileText,
      title: "Workflow Documentaire",
      description: "Processus simplifiés de création, d'approbation et de signature numérique des documents",
    },
    {
      icon: CheckCircle,
      title: "Suivi de Projet",
      description: "Suivi de l'avancement des stages et des jalons des projets académiques",
    },
    {
      icon: Shield,
      title: "Plateforme Sécurisée",
      description: "Sécurité de niveau entreprise avec contrôle d'accès basé sur les rôles",
    },
    {
      icon: Clock,
      title: "Mises à jour en Temps Réel",
      description: "Notifications instantanées et mises à jour de statut en direct sur toute la plateforme",
    },
  ]

  const stats = [
    { label: "Étudiants Actifs", value: "2 500+", icon: Users },
    { label: "Entreprises Partenaires", value: "150+", icon: Building2 },
    { label: "Stages Complétés", value: "1 200+", icon: Award },
    { label: "Taux de Réussite", value: "98%", icon: CheckCircle },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Système de Gestion Académique</h1>
                <p className="text-xs text-gray-500">Gestion des Stages & Projets</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/library">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Bibliothèque</span>
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700">Se Connecter</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            🎓 Plateforme d'Excellence Académique
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Simplifiez Votre
            <span className="text-blue-600 block">Parcours Académique</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Plateforme complète pour la gestion des stages, des projets académiques et des partenariats étudiant-industrie.
            Conçue pour que les universités, les étudiants et les entreprises collaborent en toute fluidité.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                Commencer
              </Button>
            </Link>
            <Link href="/library">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Explorer les Ressources
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Fonctionnalités de la Plateforme</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Notre système offre une suite complète d'outils pour gérer efficacement tous les aspects des stages et des projets académiques.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 border-gray-100 hover:border-blue-100 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="bg-blue-50 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Notre Impact Académique</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Voici comment notre plateforme facilite la collaboration éducative et les opportunités professionnelles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <div className="flex justify-center mb-4">
                  <stat.icon className="h-8 w-8 text-blue-200" />
                </div>
                <p className="text-3xl font-bold mb-2">{stat.value}</p>
                <p className="text-blue-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 sm:p-12 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Prêt à Transformer Votre Expérience Académique?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Rejoignez des milliers d'étudiants, d'enseignants et d'entreprises qui utilisent notre plateforme pour des stages et des projets réussis.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                Créer un Compte
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/library">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Consulter les Resources
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <GraduationCap className="h-6 w-6 text-blue-400 mr-2" />
                <span className="text-xl font-bold">Système de Gestion Académique</span>
              </div>
              <p className="text-gray-400">
                Plateforme complète pour la gestion des stages, des projets académiques et la collaboration étudiants-entreprises.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Liens Rapides</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link href="/library" className="text-gray-400 hover:text-white transition-colors">
                    Bibliothèque de Ressources
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                    Connexion
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-400 mb-2">info@academicsystem.edu</p>
              <p className="text-gray-400 mb-2">+33 (0)1 23 45 67 89</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">&copy; 2024 Système de Gestion Académique. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
