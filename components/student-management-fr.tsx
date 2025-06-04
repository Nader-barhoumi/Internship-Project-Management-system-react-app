"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Filter, Edit, Eye, Mail, Phone, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { permissions } from "@/lib/permissions"
import RoleBasedWrapper from "@/components/role-based-wrapper"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Student {
  id: number
  name: string
  email: string
  student_id: string
  degree_program: string
  academic_level: string
  phone?: string
  created_at: string
  updated_at: string
  supervisor_id?: number // Pour filtrer par superviseur
  company_id?: number // Pour filtrer par entreprise
}

interface StudentCreateRequest {
  first_name: string
  last_name: string
  email: string
  phone: string
  cin: string
  student_id: string
  degree: string
  level: "1" | "2" | "3"
  sex?: "male" | "female"
}

export default function StudentManagement() {
  const { user, userRole } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLevel, setFilterLevel] = useState("all")
  const [filterDegree, setFilterDegree] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  // Vérifie si l'utilisateur a la permission d'accéder à ce composant
  if (!permissions.canViewStudents(userRole)) {
    return null // Masque le composant entier au lieu d'afficher "accès refusé"
  }

  const loadStudents = async () => {
    try {
      setLoading(true)
      setError("")

      const filters = {
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        level: filterLevel !== "all" ? filterLevel : "",
        degree: filterDegree !== "all" ? filterDegree : "",
      }

      const response = await apiClient.getStudents(filters)
      let filteredStudents = Array.isArray(response.students) ? response.students : []

      // Applique le filtrage des données basé sur le rôle
      if (userRole === "teacher") {
        // Les enseignants ne voient que les étudiants qu'ils supervisent ou dans leur département
        filteredStudents = filteredStudents.filter((student) => {
          return (
            student.supervisor_id === user?.id || // Étudiants qu'ils supervisent directement
            student.degree_program === "Informatique" || // Étudiants de leur département
            student.degree_program === "Génie Logiciel"
          )
        })
      } else if (userRole === "industrial_tutor") {
        // Les tuteurs industriels ne voient que les étudiants assignés à leur entreprise
        filteredStudents = filteredStudents.filter(
          (student) => student.company_id === (user as { company_id?: number })?.company_id
        )
      }

      setStudents(filteredStudents)
      setPagination({
        ...pagination,
        total: response.total || filteredStudents.length,
      })
    } catch (err) {
      console.error("Erreur lors du chargement des étudiants:", err)
      setError("Impossible de charger les données des étudiants. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  // Déclenche le chargement initial et lorsque les filtres changent
  useEffect(() => {
    loadStudents()
  }, [pagination.page, pagination.limit, filterLevel, filterDegree])

  // Gère la recherche avec délai (debounce)
  const searchTimeout = useRef<NodeJS.Timeout>()
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
    
    searchTimeout.current = setTimeout(() => {
      setPagination({ ...pagination, page: 1 }) // Retourne à la première page pour les nouveaux résultats
      loadStudents()
    }, 500) // Attend 500ms après la dernière frappe
  }

  // Pour le formatage des dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  // Définitions des niveaux académiques
  const academicLevels = [
    { value: "all", label: "Tous les niveaux" },
    { value: "1", label: "1ère année" },
    { value: "2", label: "2ème année" },
    { value: "3", label: "3ème année" },
  ]

  // Définitions des programmes d'études
  const degreePrograms = [
    { value: "all", label: "Tous les programmes" },
    { value: "Informatique", label: "Informatique" },
    { value: "Génie Logiciel", label: "Génie Logiciel" },
    { value: "Réseaux", label: "Réseaux" },
    { value: "Système d'Information", label: "Système d'Information" },
  ]

  // État du formulaire d'ajout d'étudiant
  const [newStudent, setNewStudent] = useState<StudentCreateRequest>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    cin: "",
    student_id: "",
    degree: "Informatique",
    level: "1",
    sex: "male",
  })

  // Gère la soumission du formulaire d'ajout
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError("")
      
      // Ajoutez un type pour la réponse attendue
      type CreateStudentResponse = { success: boolean; message?: string }
      const response = await apiClient.createStudent(newStudent) as unknown as CreateStudentResponse
      
      if (response.success) {
        setIsAddDialogOpen(false)
        loadStudents()
        // Réinitialise le formulaire
        setNewStudent({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          cin: "",
          student_id: "",
          degree: "Informatique",
          level: "1",
          sex: "male",
        })
      } else {
        setError(response.message || "Échec de l'ajout de l'étudiant")
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'étudiant:", err)
      setError("Impossible d'ajouter l'étudiant. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Gestion des Étudiants</CardTitle>
            <CardDescription>
              Gérez les profils des étudiants, les inscriptions et suivez leur progression académique
            </CardDescription>
          </div>
          <RoleBasedWrapper allowedRoles={["admin", "teacher"]}>
            <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>Ajouter un Étudiant</span>
            </Button>
          </RoleBasedWrapper>
        </CardHeader>
        <CardContent>
          {/* Barre de recherche et filtres */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, email, ou ID étudiant..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-row gap-2">
              <div className="w-40">
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-52">
                <Select value={filterDegree} onValueChange={setFilterDegree}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Programme" />
                  </SelectTrigger>
                  <SelectContent>
                    {degreePrograms.map((program) => (
                      <SelectItem key={program.value} value={program.value}>
                        {program.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Message de chargement ou d'erreur */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Chargement des données...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {/* Tableau des étudiants */}
          {!loading && !error && (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Étudiant</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead className="hidden md:table-cell">Programme</TableHead>
                      <TableHead>Niveau</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                          Aucun étudiant trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.student_id}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell className="hidden md:table-cell">{student.email}</TableCell>
                          <TableCell className="hidden md:table-cell">{student.degree_program}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                student.academic_level === "3" 
                                  ? "default" 
                                  : student.academic_level === "2"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {student.academic_level === "1"
                                ? "1ère année"
                                : student.academic_level === "2"
                                ? "2ème année"
                                : "3ème année"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedStudent(student)
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
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">
                  Affichage de {pagination.page === 1 ? 1 : (pagination.page - 1) * pagination.limit + 1} à{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} étudiants
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page <= 1}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page * pagination.limit >= pagination.total}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogue d'ajout d'étudiant */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter un Nouvel Étudiant</DialogTitle>
            <DialogDescription>
              Entrez les informations du nouvel étudiant. Tous les champs marqués * sont obligatoires.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddStudent} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom *</Label>
                <Input
                  id="first_name"
                  placeholder="Jean"
                  required
                  value={newStudent.first_name}
                  onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom *</Label>
                <Input
                  id="last_name"
                  placeholder="Dupont"
                  required
                  value={newStudent.last_name}
                  onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jean.dupont@exemple.com"
                  required
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  placeholder="+33 6 12 34 56 78"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cin">CIN/CNI *</Label>
                <Input
                  id="cin"
                  placeholder="Carte d'identité nationale"
                  required
                  value={newStudent.cin}
                  onChange={(e) => setNewStudent({ ...newStudent, cin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student_id">ID Étudiant *</Label>
                <Input
                  id="student_id"
                  placeholder="ex: ETU12345"
                  required
                  value={newStudent.student_id}
                  onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="degree">Programme d'Études *</Label>
                <Select 
                  value={newStudent.degree} 
                  onValueChange={(value) => setNewStudent({ ...newStudent, degree: value })}
                >
                  <SelectTrigger id="degree">
                    <SelectValue placeholder="Sélectionner un programme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Informatique">Informatique</SelectItem>
                    <SelectItem value="Génie Logiciel">Génie Logiciel</SelectItem>
                    <SelectItem value="Réseaux">Réseaux</SelectItem>
                    <SelectItem value="Système d'Information">Système d'Information</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Niveau *</Label>
                <Select 
                  value={newStudent.level} 
                  onValueChange={(value) => setNewStudent({ 
                    ...newStudent, 
                    level: value as "1" | "2" | "3"
                  })}
                >
                  <SelectTrigger id="level">
                    <SelectValue placeholder="Sélectionner un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1ère année</SelectItem>
                    <SelectItem value="2">2ème année</SelectItem>
                    <SelectItem value="3">3ème année</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sex">Sexe</Label>
                <Select 
                  value={newStudent.sex || "male"} 
                  onValueChange={(value) => setNewStudent({ 
                    ...newStudent, 
                    sex: value as "male" | "female"
                  })}
                >
                  <SelectTrigger id="sex">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Homme</SelectItem>
                    <SelectItem value="female">Femme</SelectItem>
                  </SelectContent>
                </Select>
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
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ajout en cours...
                  </>
                ) : (
                  "Ajouter l'Étudiant"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue de vue détaillée de l'étudiant */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails de l'Étudiant</DialogTitle>
            <DialogDescription>Informations complètes du profil étudiant</DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xl font-semibold">
                  {selectedStudent.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedStudent.name}</h3>
                  <p className="text-gray-500">{selectedStudent.student_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <div className="flex items-center mt-1">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{selectedStudent.email}</span>
                  </div>
                </div>
                {selectedStudent.phone && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Téléphone</h4>
                    <div className="flex items-center mt-1">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{selectedStudent.phone}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-md border border-gray-200 p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-3">Information Académique</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-xs text-gray-500">Programme d'Études</h5>
                    <p className="font-medium">{selectedStudent.degree_program}</p>
                  </div>
                  <div>
                    <h5 className="text-xs text-gray-500">Niveau</h5>
                    <p className="font-medium">
                      {selectedStudent.academic_level === "1"
                        ? "1ère année"
                        : selectedStudent.academic_level === "2"
                        ? "2ème année"
                        : "3ème année"}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-xs text-gray-500">Date d'Inscription</h5>
                    <p className="font-medium">{formatDate(selectedStudent.created_at)}</p>
                  </div>
                  <div>
                    <h5 className="text-xs text-gray-500">Dernier Mise à Jour</h5>
                    <p className="font-medium">{formatDate(selectedStudent.updated_at)}</p>
                  </div>
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
