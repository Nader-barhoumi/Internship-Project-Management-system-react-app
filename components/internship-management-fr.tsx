"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Eye, Calendar, Building2, User, Clock, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { permissions } from "@/lib/permissions"
import RoleBasedWrapper from "@/components/role-based-wrapper"
// Import types but don't use them directly to avoid type conflicts
import type { User as UserType, Student as StudentType, Company as CompanyType, IndustrialTutor as IndustrialTutorType, AcademicWork as AcademicWorkType } from "@/types/database"

// Define a UI-specific interface for internships with relations
interface InternshipWithRelations {
  id: number;
  student_id: number;
  academic_work_id?: number;
  company_id: number;
  industrial_tutor_id: number;
  internship_type: string;
  start_date: string;
  end_date: string;
  company_signature?: number;
  status: string;
  description?: string;
  
  // Relations with simplified structures for UI rendering
  student?: {
    user?: {
      first_name: string;
      last_name: string;
    };
    student_id: string;
  };
  company?: {
    name: string;
  };
  industrial_tutor?: {
    user?: {
      first_name: string;
      last_name: string;
    };
    job_title: string;
  };
  academic_work?: {
    type: string;
    department: string
  }
}

export default function InternshipManagement() {
  const { user, userRole } = useAuth()
  const { toast } = useToast()
  const [internships, setInternships] = useState<InternshipWithRelations[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedInternship, setSelectedInternship] = useState<InternshipWithRelations | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [limit] = useState(10)
  const [students, setStudents] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [tutors, setTutors] = useState<any[]>([])
  const [companyId, setCompanyId] = useState<number | null>(null)
  const [shouldFetchTutors, setShouldFetchTutors] = useState(false)

  // Vérifie si l'utilisateur a la permission d'accéder à ce composant
  if (!permissions.canViewInternships(userRole)) {
    return null // Masque le composant entier
  }  // Récupération des stages avec filtrage basé sur le rôle
  const fetchInternships = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const filters: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      }

      if (filterStatus !== "all") {
        filters.status = filterStatus
      }

      if (filterType !== "all") {
        filters.internship_type = filterType
      }

      if (searchTerm) {
        filters.search = searchTerm
      }

      // Filtrage en fonction du rôle de l'utilisateur
      if (userRole === "industrial_tutor") {
        filters.industrial_tutor_id = user?.id?.toString() || ""
      } else if (userRole === "student") {
        filters.student_id = user?.id?.toString() || ""
      } else if (userRole === "teacher") {
        filters.academic_supervisor_id = user?.id?.toString() || ""
      }
      
      // Appel API pour récupérer les stages
      const response: any = await apiClient.getInternships(filters)
      
      if (response && response.internships) {
        // Convert API response to our UI format
        const formattedInternships: InternshipWithRelations[] = response.internships.map((internship: any) => {
          // Handle dates by converting any Date objects to strings
          const startDate = typeof internship.start_date === 'object' && internship.start_date !== null
            ? new Date(internship.start_date).toISOString().split('T')[0]
            : String(internship.start_date);
          
          const endDate = typeof internship.end_date === 'object' && internship.end_date !== null
            ? new Date(internship.end_date).toISOString().split('T')[0]
            : String(internship.end_date);
          
          return {
            id: internship.id,
            student_id: internship.student_id,
            company_id: internship.company_id,
            academic_work_id: internship.academic_work_id,
            industrial_tutor_id: internship.industrial_tutor_id,
            internship_type: String(internship.internship_type),
            start_date: startDate,
            end_date: endDate,
            status: String(internship.status),
            description: internship.description,
            company_signature: internship.company_signature,
            student: internship.student,
            company: internship.company,
            industrial_tutor: internship.industrial_tutor,
            academic_work: internship.academic_work
          };
        });
        
        setInternships(formattedInternships);
        setTotalItems(response.total || response.internships.length);
        setTotalPages(Math.ceil((response.total || response.internships.length) / limit));
      } else {
        setInternships([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des stages:", err)
      setError("Impossible de charger les données des stages. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  // Récupération des étudiants pour le formulaire d'ajout
  const fetchStudents = async () => {
    try {
      const response = await apiClient.getStudents({ limit: "100" })
      if (response && response.students) {
        setStudents(response.students)
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des étudiants:", err)
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des étudiants",
        variant: "destructive",
      })
    }
  }

  // Récupération des entreprises pour le formulaire d'ajout
  const fetchCompanies = async () => {
    try {
      const response = await apiClient.getCompanies({ limit: "100" })
      if (response && response.companies) {
        setCompanies(response.companies)
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des entreprises:", err)
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des entreprises",
        variant: "destructive",
      })
    }
  }
  // Récupération des tuteurs industriels d'une entreprise spécifique
  const fetchTutorsByCompany = async (companyId: number) => {
    try {
      const response = await apiClient.getTutorsByCompany(companyId)
      if (response && response.data) {
        setTutors(response.data)
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des tuteurs:", err)
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des tuteurs industriels",
        variant: "destructive",
      })
    }
  }

  // Effet pour charger les stages lors de l'initialisation ou du changement de filtres
  useEffect(() => {
    fetchInternships()
  }, [page, filterStatus, filterType, searchTerm, userRole, user?.id])

  // Effet pour charger les données de référence lors de l'ouverture du dialogue d'ajout
  useEffect(() => {
    if (isAddDialogOpen && permissions.canCreateInternships(userRole)) {
      fetchStudents()
      fetchCompanies()
    }
  }, [isAddDialogOpen])

  // Effet pour charger les tuteurs lorsque l'entreprise est sélectionnée
  useEffect(() => {
    if (shouldFetchTutors && companyId) {
      fetchTutorsByCompany(companyId)
      setShouldFetchTutors(false)
    }
  }, [shouldFetchTutors, companyId])

  // État du formulaire d'ajout de stage
  const [newInternship, setNewInternship] = useState({
    student_id: "",
    company_id: "",
    industrial_tutor_id: "",
    start_date: "",
    end_date: "",
    internship_type: "corporate",
    description: "",
    status: "pending",
  })
  // Gestion de la soumission du formulaire d'ajout
  const handleAddInternship = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response: any = await apiClient.createInternship(newInternship)
      if (response && response.success) {
        toast({
          title: "Succès",
          description: "Le stage a été créé avec succès",
        })
        setIsAddDialogOpen(false)
        // Réinitialiser le formulaire
        setNewInternship({
          student_id: "",
          company_id: "",
          industrial_tutor_id: "",
          start_date: "",
          end_date: "",
          internship_type: "corporate",
          description: "",
          status: "pending",
        })
        // Actualiser la liste des stages
        fetchInternships()
      } else {
        setError(response.message || "Échec de la création du stage")
      }
    } catch (err) {
      console.error("Erreur lors de la création du stage:", err)
      setError("Une erreur s'est produite lors de la création du stage")
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour mettre à jour l'entreprise sélectionnée et récupérer ses tuteurs
  const handleCompanyChange = (value: string) => {
    setNewInternship({ ...newInternship, company_id: value, industrial_tutor_id: "" })
    setCompanyId(parseInt(value))
    setShouldFetchTutors(true)
  }

  // Formatage des dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
  }
  // Obtenir la couleur du badge de statut
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "active":
      case "on_going":
        return "default"
      case "pending":
        return "secondary"
      case "completed":
      case "finished":
        return "outline" // Using outline instead of success which is not a valid variant
      case "canceled":
      case "Canceled":
      case "Refused":
        return "destructive"
      default:
        return "outline"
    }
  }

  // Traduire le statut du stage
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Actif"
      case "pending":
        return "En attente"
      case "completed":
        return "Terminé"
      case "canceled":
        return "Annulé"
      default:
        return status
    }
  }

  // Traduire le type de stage
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "corporate":
        return "Stage en entreprise"
      case "research":
        return "Stage de recherche"
      case "mandatory":
        return "Stage obligatoire"
      case "optional":
        return "Stage optionnel"
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Gestion des Stages</CardTitle>
            <CardDescription>
              Gérez les stages, suivez la progression et les évaluations des étudiants
            </CardDescription>
          </div>
          <RoleBasedWrapper allowedRoles={["admin", "teacher"]}>
            <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>Ajouter un Stage</span>
            </Button>
          </RoleBasedWrapper>
        </CardHeader>
        <CardContent>
          {/* Barre de recherche et filtres */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par étudiant, entreprise, ou tuteur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-row gap-2">
              <div className="w-40">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="canceled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-52">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="corporate">Stage en entreprise</SelectItem>
                    <SelectItem value="research">Stage de recherche</SelectItem>
                    <SelectItem value="mandatory">Stage obligatoire</SelectItem>
                    <SelectItem value="optional">Stage optionnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Message de chargement ou d'erreur */}
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Chargement des stages...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {/* Tableau des stages */}
          {!isLoading && !error && (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Étudiant</TableHead>
                      <TableHead className="hidden md:table-cell">Entreprise</TableHead>
                      <TableHead>Période</TableHead>
                      <TableHead className="hidden md:table-cell">Type</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {internships.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                          Aucun stage trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      internships.map((internship) => (
                        <TableRow key={internship.id}>
                          <TableCell>
                            {internship.student?.user
                              ? `${internship.student.user.first_name} ${internship.student.user.last_name}`
                              : "Non assigné"}
                            <div className="text-xs text-gray-500">{internship.student?.student_id || ""}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {internship.company?.name || "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500" />
                              <span>
                                {formatDate(internship.start_date)} - {formatDate(internship.end_date)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {getTypeLabel(internship.internship_type)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(internship.status)}>
                              {getStatusLabel(internship.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedInternship(internship)
                                  setIsViewDialogOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <RoleBasedWrapper allowedRoles={["admin", "teacher"]}>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </RoleBasedWrapper>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">
                  Affichage de {page === 1 ? 1 : (page - 1) * limit + 1} à{" "}
                  {Math.min(page * limit, totalItems)} sur {totalItems} stages
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Précédent
                  </Button>
                  <div className="mx-2">
                    Page {page} sur {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
                    disabled={page >= totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogue d'ajout de stage */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Créer un Nouveau Stage</DialogTitle>
            <DialogDescription>
              Entrez les informations pour créer un nouveau stage. Tous les champs marqués * sont obligatoires.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddInternship} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_id">Étudiant *</Label>
                <Select
                  value={newInternship.student_id}
                  onValueChange={(value) => setNewInternship({ ...newInternship, student_id: value })}
                >
                  <SelectTrigger id="student_id">
                    <SelectValue placeholder="Sélectionner un étudiant" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.name} ({student.student_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_id">Entreprise *</Label>
                <Select
                  value={newInternship.company_id}
                  onValueChange={handleCompanyChange}
                >
                  <SelectTrigger id="company_id">
                    <SelectValue placeholder="Sélectionner une entreprise" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industrial_tutor_id">Tuteur Industriel *</Label>
                <Select
                  value={newInternship.industrial_tutor_id}
                  onValueChange={(value) => setNewInternship({ ...newInternship, industrial_tutor_id: value })}
                  disabled={!newInternship.company_id}
                >
                  <SelectTrigger id="industrial_tutor_id">
                    <SelectValue placeholder="Sélectionner un tuteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {tutors.map((tutor) => (
                      <SelectItem key={tutor.id} value={tutor.id.toString()}>
                        {tutor.user?.first_name} {tutor.user?.last_name} ({tutor.job_title})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="internship_type">Type de Stage *</Label>
                <Select
                  value={newInternship.internship_type}
                  onValueChange={(value) => setNewInternship({ ...newInternship, internship_type: value })}
                >
                  <SelectTrigger id="internship_type">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corporate">Stage en entreprise</SelectItem>
                    <SelectItem value="research">Stage de recherche</SelectItem>
                    <SelectItem value="mandatory">Stage obligatoire</SelectItem>
                    <SelectItem value="optional">Stage optionnel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Date de début *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newInternship.start_date}
                  onChange={(e) => setNewInternship({ ...newInternship, start_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">Date de fin *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={newInternship.end_date}
                  onChange={(e) => setNewInternship({ ...newInternship, end_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Description des missions et objectifs du stage..."
                  value={newInternship.description}
                  onChange={(e) => setNewInternship({ ...newInternship, description: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Créer un stage"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue de vue détaillée du stage */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails du Stage</DialogTitle>
            <DialogDescription>Informations complètes sur le stage</DialogDescription>
          </DialogHeader>

          {selectedInternship && (
            <div className="space-y-6 py-4">
              {/* Informations générales */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(selectedInternship.status)} className="text-xs">
                    {getStatusLabel(selectedInternship.status)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {getTypeLabel(selectedInternship.internship_type)}
                  </Badge>
                </div>

                <div className="rounded-md border border-gray-200 p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Période de stage</h4>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      Du {formatDate(selectedInternship.start_date)} au {formatDate(selectedInternship.end_date)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      {(() => {
                        const start = new Date(selectedInternship.start_date)
                        const end = new Date(selectedInternship.end_date)
                        const diffTime = Math.abs(end.getTime() - start.getTime())
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        const diffWeeks = Math.floor(diffDays / 7)
                        const remainingDays = diffDays % 7

                        return `Durée: ${diffWeeks} semaines${remainingDays > 0 ? ` et ${remainingDays} jour${remainingDays > 1 ? 's' : ''}` : ''}`
                      })()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-md border border-gray-200 p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Étudiant</h4>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        {selectedInternship.student?.user
                          ? `${selectedInternship.student.user.first_name} ${selectedInternship.student.user.last_name}`
                          : "Non assigné"}
                      </span>
                    </div>
                    {selectedInternship.student?.student_id && (
                      <div className="mt-1 ml-6 text-sm text-gray-500">
                        ID: {selectedInternship.student.student_id}
                      </div>
                    )}
                  </div>

                  <div className="rounded-md border border-gray-200 p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Entreprise</h4>
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{selectedInternship.company?.name || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedInternship.description && (
                  <div className="rounded-md border border-gray-200 p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Description</h4>
                    <p className="text-sm whitespace-pre-wrap">{selectedInternship.description}</p>
                  </div>
                )}
              </div>

              {/* Encadrement */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Encadrement</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedInternship.industrial_tutor && (
                    <div className="rounded-md border border-gray-200 p-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-3">Tuteur industriel</h4>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          {selectedInternship.industrial_tutor.user
                            ? `${selectedInternship.industrial_tutor.user.first_name} ${selectedInternship.industrial_tutor.user.last_name}`
                            : "Non assigné"}
                        </span>
                      </div>
                      {selectedInternship.industrial_tutor.job_title && (
                        <div className="mt-1 ml-6 text-sm text-gray-500">
                          {selectedInternship.industrial_tutor.job_title}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
