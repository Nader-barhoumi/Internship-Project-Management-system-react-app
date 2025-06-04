"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Building2,
  FileText,
  GraduationCap,
  CheckCircle,
  Plus,
  User,
  LogOut,
  Shield,
  Home,
  BookOpen,
  Bot,
  Scan,
} from "lucide-react"
import StudentManagement from "@/components/student-management"
import InternshipManagement from "@/components/internship-management"
import DocumentWorkflow from "@/components/document-workflow"
import CompanyManagement from "@/components/company-management"
import AcademicStaffManagement from "@/components/academic-staff-management"
import UserProfile from "@/components/user-profile"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { permissions, type UserRole } from "@/lib/permissions"
import RoleBasedWrapper from "@/components/role-based-wrapper"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import QuickActionDialogs from "@/components/quick-action-dialogs"
import AIDocumentAssistant from "@/components/ai-document-assistant"
import OCRScanner from "@/components/ocr-scanner"
import PDFViewer from "@/components/pdf-viewer"

export default function Dashboard() {
  const { user, userRole, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  // Cast userRole to UserRole type for type safety
  const typedUserRole = userRole as UserRole

  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeInternships: 0,
    pendingDocuments: 0,
    completedProjects: 0,
  })

  const [quickActionDialogs, setQuickActionDialogs] = useState({
    student: false,
    company: false,
    internship: false,
    document: false,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    // Load role-specific stats
    const loadStats = () => {
      if (userRole === "student") {
        setStats({
          totalStudents: 1, // Only themselves
          activeInternships: 1, // Their internship
          pendingDocuments: 3, // Their documents
          completedProjects: 0, // Their projects
        })
      } else if (userRole === "teacher") {
        setStats({
          totalStudents: 45, // Students they supervise
          activeInternships: 12, // Internships they supervise
          pendingDocuments: 8, // Documents awaiting their review
          completedProjects: 23, // Projects they've supervised
        })
      } else if (userRole === "industrial_tutor") {
        setStats({
          totalStudents: 8, // Students at their company
          activeInternships: 5, // Active internships at company
          pendingDocuments: 2, // Company documents
          completedProjects: 15, // Completed internships
        })
      } else {
        // Admin sees everything
        setStats({
          totalStudents: 524,
          activeInternships: 187,
          pendingDocuments: 23,
          completedProjects: 156,
        })
      }
    }

    loadStats()
  }, [userRole])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      console.log("Logout function called")
      logout() // Call the auth context logout
      console.log("Logout completed, redirecting to home...")

      // Force redirect to home page
      window.location.href = "/home"
    } catch (error) {
      console.error("Logout error:", error)
      // Even if logout fails, redirect to home
      window.location.href = "/home"
    }
  }

  const StatCard = ({ title, value, icon: Icon, description, trend }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <Badge variant={trend > 0 ? "default" : "secondary"} className="mt-1">
            {trend > 0 ? "+" : ""}
            {trend}% par rapport au mois dernier
          </Badge>
        )}
      </CardContent>
    </Card>
  )

  const RecentActivity = () => {
    const getActivitiesByRole = () => {
      if (userRole === "student") {
        return [
          {
            type: "internship",
            message: "Votre demande de stage a été approuvée",
            time: "il y a 2 heures",
            status: "completed",
          },
          {
            type: "document",
            message: "Veuillez signer votre convention de stage",
            time: "il y a 1 jour",
            status: "pending",
          },
          {
            type: "project",
            message: "Proposition de projet PFE soumise",
            time: "il y a 3 jours",
            status: "review",
          },
        ]
      } else if (userRole === "teacher") {
        return [
          {
            type: "project",
            message: "Nouvelle proposition de projet PFE à examiner",
            time: "il y a 1 heure",
            status: "pending",
          },
          {
            type: "internship",
            message: "Formulaire d'évaluation d'étudiant soumis",
            time: "il y a 4 heures",
            status: "review",
          },
          {
            type: "student",
            message: "Un étudiant a demandé une réunion d'encadrement",
            time: "il y a 1 jour",
            status: "info",
          },
        ]
      } else if (userRole === "industrial_tutor") {
        return [
          {
            type: "internship",
            message: "Nouvel stagiaire a commencé dans votre entreprise",
            time: "il y a 2 heures",
            status: "info",
          },
          {
            type: "document",
            message: "Évaluation de stage à rendre la semaine prochaine",
            time: "il y a 1 jour",
            status: "pending",
          },
          {
            type: "student",
            message: "Le stagiaire a soumis un rapport hebdomadaire",
            time: "il y a 2 jours",
            status: "completed",
          },
        ]
      } else {
        return [
          {
            type: "internship",
            message: "Nouvelle demande de stage de John Doe",
            time: "il y a 2 heures",
            status: "pending",
          },
          {
            type: "document",
            message: "Convention de stage signée par TechCorp",
            time: "il y a 4 heures",
            status: "completed",
          },
          {
            type: "project",
            message: 'Projet PFE "Chatbot IA" soumis pour examen',
            time: "il y a 1 jour",
            status: "review",
          },
          { type: "student", message: "Profil étudiant mis à jour: Jane Smith", time: "il y a 2 jours", status: "info" },
        ]
      }
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
          <CardDescription>Dernières mises à jour pertinentes pour votre rôle</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {getActivitiesByRole().map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 rounded-lg border">
              <div
                className={`w-2 h-2 rounded-full ${
                  activity.status === "completed"
                    ? "bg-green-500"
                    : activity.status === "pending"
                      ? "bg-yellow-500"
                      : activity.status === "review"
                        ? "bg-blue-500"
                        : "bg-gray-500"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
              <Badge
                variant={
                  activity.status === "completed" ? "default" : activity.status === "pending" ? "secondary" : "outline"
                }
              >
                {activity.status === "completed" ? "terminé" : 
                 activity.status === "pending" ? "en attente" : 
                 activity.status === "review" ? "en examen" : 
                 activity.status === "info" ? "information" : activity.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const QuickActions = () => (
    <Card>
      <CardHeader>
        <CardTitle>Actions Rapides</CardTitle>
        <CardDescription>Actions disponibles pour votre rôle</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <RoleBasedWrapper allowedRoles={["admin", "teacher"]}>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => setQuickActionDialogs((prev) => ({ ...prev, student: true }))}
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm">Nouvel Étudiant</span>
          </Button>
        </RoleBasedWrapper>

        <RoleBasedWrapper allowedRoles={["admin"]}>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => setQuickActionDialogs((prev) => ({ ...prev, company: true }))}
          >
            <Building2 className="h-5 w-5" />
            <span className="text-sm">Ajouter Entreprise</span>
          </Button>
        </RoleBasedWrapper>

        <RoleBasedWrapper allowedRoles={["admin", "teacher", "industrial_tutor"]}>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => setQuickActionDialogs((prev) => ({ ...prev, document: true }))}
          >
            <FileText className="h-5 w-5" />
            <span className="text-sm">Créer Document</span>
          </Button>
        </RoleBasedWrapper>

        <RoleBasedWrapper allowedRoles={["admin", "teacher"]}>
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => setQuickActionDialogs((prev) => ({ ...prev, internship: true }))}
          >
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm">Nouveau Stage</span>
          </Button>
        </RoleBasedWrapper>

        {/* Student-specific actions */}
        <RoleBasedWrapper allowedRoles={["student"]}>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <FileText className="h-5 w-5" />
            <span className="text-sm">Soumettre Rapport</span>
          </Button>
        </RoleBasedWrapper>

        <RoleBasedWrapper allowedRoles={["student"]}>
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm">Voir Stage</span>
          </Button>
        </RoleBasedWrapper>

        {/* Add these new action buttons in the QuickActions grid */}
        <Button
          variant="outline"
          className="h-auto p-4 flex flex-col items-center space-y-2"
          onClick={() => setActiveTab("ai-tools")}
        >
          <Bot className="h-5 w-5" />
          <span className="text-sm">Assistant IA</span>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-4 flex flex-col items-center space-y-2"
          onClick={() => setActiveTab("ocr-scanner")}
        >
          <Scan className="h-5 w-5" />
          <span className="text-sm">Scanner OCR</span>
        </Button>

        <Button
          variant="outline"
          className="h-auto p-4 flex flex-col items-center space-y-2"
          onClick={() => setActiveTab("pdf-tools")}
        >
          <FileText className="h-5 w-5" />
          <span className="text-sm">Outils PDF</span>
        </Button>
      </CardContent>
    </Card>
  )

  // Get available tabs based on user role
  const getAvailableTabs = () => {
    const baseTabs = [{ id: "overview", label: "Aperçu" }]

    if (permissions.canViewStudents(typedUserRole)) {
      baseTabs.push({ id: "students", label: "Étudiants" })
    }

    if (permissions.canViewInternships(typedUserRole)) {
      baseTabs.push({ id: "internships", label: "Stages" })
    }

    if (permissions.canViewDocuments(typedUserRole)) {
      baseTabs.push({ id: "documents", label: "Documents" })
    }

    if (permissions.canViewCompanies(typedUserRole)) {
      baseTabs.push({ id: "companies", label: "Entreprises" })
    }

    if (permissions.canViewAcademicStaff(typedUserRole)) {
      baseTabs.push({ id: "staff", label: "Personnel Académique" })
    }

    // Add these new tabs to the baseTabs array
    baseTabs.push({ id: "ai-tools", label: "Outils IA" })
    baseTabs.push({ id: "ocr-scanner", label: "Scanner OCR" })
    baseTabs.push({ id: "pdf-tools", label: "Outils PDF" })

    baseTabs.push({ id: "profile", label: "Mon Profil" })

    return baseTabs
  }

  const availableTabs = getAvailableTabs()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Système de Gestion Académique</h1>
                <p className="text-sm text-gray-500">
                  {userRole === "admin" && "Tableau de Bord Administrateur"}
                  {userRole === "teacher" && "Tableau de Bord Enseignant"}
                  {userRole === "student" && "Portail Étudiant"}
                  {userRole === "industrial_tutor" && "Tableau de Bord Tuteur Industriel"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {userRole === "admin" && (
                <Badge variant="default" className="bg-red-600">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}

              {/* Navigation Buttons */}
              <div className="hidden md:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/home")}
                  className="flex items-center space-x-1"
                >
                  <Home className="h-4 w-4" />
                  <span>Accueil</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/library")}
                  className="flex items-center space-x-1"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Bibliothèque</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{user?.name?.charAt(0) || "U"}</span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">{user?.name || "Utilisateur"}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {userRole === "student" && "Étudiant"}
                        {userRole === "teacher" && "Enseignant"}
                        {userRole === "admin" && "Administrateur"}
                        {userRole === "industrial_tutor" && "Tuteur Industriel"}
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <button
                      onClick={() => router.push("/home")}
                      className="w-full flex items-center px-2 py-1.5 text-sm cursor-pointer"
                    >
                      <Home className="mr-2 h-4 w-4" />
                      <span>Accueil</span>
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button
                      onClick={() => router.push("/library")}
                      className="w-full flex items-center px-2 py-1.5 text-sm cursor-pointer"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>Bibliothèque</span>
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <button
                      onClick={() => setActiveTab("profile")}
                      className="w-full flex items-center px-2 py-1.5 text-sm cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Mon Profil</span>
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-2 py-1.5 text-sm cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Déconnexion</span>
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList
            className="grid w-full"
            style={{ gridTemplateColumns: `repeat(${availableTabs.length}, minmax(0, 1fr))` }}
          >
            {availableTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title={userRole === "student" ? "Mon Statut" : "Total Étudiants"}
                value={stats.totalStudents}
                icon={Users}
                description={userRole === "student" ? "Étudiant actif" : "Étudiants inscrits"}
                trend={userRole === "admin" ? 5 : undefined}
              />
              <StatCard
                title={userRole === "student" ? "Mon Stage" : "Stages Actifs"}
                value={stats.activeInternships}
                icon={Building2}
                description={userRole === "student" ? "Stage actuel" : "Stages en cours"}
                trend={userRole === "admin" ? 12 : undefined}
              />
              <StatCard
                title="Documents en Attente"
                value={stats.pendingDocuments}
                icon={FileText}
                description={userRole === "student" ? "Documents à signer" : "En attente de signatures"}
                trend={userRole === "admin" ? -8 : undefined}
              />
              <StatCard
                title="Projets Complétés"
                value={stats.completedProjects}
                icon={CheckCircle}
                description={userRole === "student" ? "Projets terminés" : "Projets PFE terminés"}
                trend={userRole === "admin" ? 15 : undefined}
              />
            </div>

            {/* Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentActivity />
              </div>
              <div>
                <QuickActions />
              </div>
            </div>
          </TabsContent>

          {permissions.canViewStudents(typedUserRole) && (
            <TabsContent value="students">
              <StudentManagement />
            </TabsContent>
          )}

          {permissions.canViewInternships(typedUserRole) && (
            <TabsContent value="internships">
              <InternshipManagement />
            </TabsContent>
          )}

          {permissions.canViewDocuments(typedUserRole) && (
            <TabsContent value="documents">
              <DocumentWorkflow />
            </TabsContent>
          )}

          {permissions.canViewCompanies(typedUserRole) && (
            <TabsContent value="companies">
              <CompanyManagement />
            </TabsContent>
          )}

          {permissions.canViewAcademicStaff(typedUserRole) && (
            <TabsContent value="staff">
              <AcademicStaffManagement />
            </TabsContent>
          )}

          {/* Add the new TabsContent sections before the profile tab */}
          <TabsContent value="ai-tools" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assistant IA pour Documents</CardTitle>
                <CardDescription>Obtenez des suggestions intelligentes et générez du contenu pour vos documents</CardDescription>
              </CardHeader>
              <CardContent>
                <AIDocumentAssistant
                  documentType="general"
                  currentContent=""
                  onContentUpdate={(content) => console.log("Contenu mis à jour:", content)}
                  onSuggestionApply={(suggestion) => console.log("Suggestion appliquée:", suggestion)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ocr-scanner" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scanner OCR de Texte</CardTitle>
                <CardDescription>Extrayez du texte à partir d'images et de documents numérisés</CardDescription>
              </CardHeader>
              <CardContent>
                <OCRScanner
                  onTextExtracted={(text) => {
                    console.log("Texte extrait:", text)
                    // You could show a success message or copy to clipboard
                  }}
                  onError={(error) => console.error("Erreur OCR:", error)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pdf-tools" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visionneuse et Outils PDF</CardTitle>
                <CardDescription>Visualisez, analysez et travaillez avec des documents PDF</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Téléchargez un fichier PDF pour le visualiser et l'analyser</p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          // Handle PDF file upload
                          console.log("PDF téléchargé:", file.name)
                        }
                      }}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label htmlFor="pdf-upload">
                      <Button variant="outline" className="cursor-pointer">
                        Choisir un fichier PDF
                      </Button>
                    </label>
                  </div>

                  {/* Demo PDF Viewer */}
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Aperçu du document exemple :</h4>
                    <PDFViewer
                      file="/placeholder.pdf"
                      onError={(error) => console.error("Erreur PDF:", error)}
                      onLoadSuccess={(numPages) => console.log(`PDF chargé avec ${numPages} pages`)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <UserProfile />
          </TabsContent>
        </Tabs>

        <QuickActionDialogs
          dialogs={quickActionDialogs}
          setDialogs={setQuickActionDialogs}
          onSuccess={(type) => {
            console.log(`${type === "student" ? "Étudiant" : 
                         type === "company" ? "Entreprise" : 
                         type === "internship" ? "Stage" : 
                         type === "document" ? "Document" : type} créé avec succès`)
            if (type === "student" && permissions.canViewStudents(typedUserRole)) setActiveTab("students")
            if (type === "company" && permissions.canViewCompanies(typedUserRole)) setActiveTab("companies")
            if (type === "internship" && permissions.canViewInternships(typedUserRole)) setActiveTab("internships")
            if (type === "document" && permissions.canViewDocuments(typedUserRole)) setActiveTab("documents")
          }}
        />
      </main>
    </div>
  )
}
