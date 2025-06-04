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
import { Plus, Search, Filter, Edit, Eye, Mail, Phone, Loader2, GraduationCap } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { permissions, type UserRole } from "@/lib/permissions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface AcademicStaff {
  id: number
  name: string
  email: string
  phone: string
  department: string
  position: string
  specialization: string
  office: string
  created_at: string
  updated_at: string
  supervised_students?: number
  active_projects?: number
}

export default function AcademicStaffManagementFr() {  const { user, userRole } = useAuth()
  const [staff, setStaff] = useState<AcademicStaff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [filterPosition, setFilterPosition] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<AcademicStaff | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  })

  // Vérifier si l'utilisateur a l'autorisation d'accéder à ce composant
  if (!permissions.canViewAcademicStaff(userRole)) {
    return null // Cacher le composant entier - seuls les administrateurs peuvent le voir
  }

  const loadStaff = async () => {
    try {
      setLoading(true)
      setError("")

      // Données fictives pour le personnel académique - dans une vraie application, cela viendrait de l'API
      const mockStaff: AcademicStaff[] = [
        {
          id: 1,
          name: "Dr. Ahmed Ben Ali",
          email: "ahmed.benali@university.tn",
          phone: "+216 71 123 456",
          department: "Informatique",
          position: "Professeur",
          specialization: "Intelligence Artificielle",
          office: "CS-201",
          created_at: "2023-01-15",
          updated_at: "2024-01-15",
          supervised_students: 12,
          active_projects: 3,
        },
        {
          id: 2,
          name: "Dr. Fatma Gharbi",
          email: "fatma.gharbi@university.tn",
          phone: "+216 71 234 567",
          department: "Génie Logiciel",
          position: "Maître de Conférences",
          specialization: "Architecture Logicielle",
          office: "SE-105",
          created_at: "2023-02-20",
          updated_at: "2024-01-10",
          supervised_students: 8,
          active_projects: 2,
        },
        {
          id: 3,
          name: "Dr. Mohamed Trabelsi",
          email: "mohamed.trabelsi@university.tn",
          phone: "+216 71 345 678",
          department: "Informatique",
          position: "Maître Assistant",
          specialization: "Systèmes de Bases de Données",
          office: "CS-150",
          created_at: "2023-03-10",
          updated_at: "2024-01-05",
          supervised_students: 6,
          active_projects: 1,
        },
      ]

      // Appliquer les filtres
      const filteredStaff = mockStaff.filter((member) => {
        const matchesSearch =
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.specialization.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesDepartment = filterDepartment === "all" || member.department === filterDepartment
        const matchesPosition = filterPosition === "all" || member.position === filterPosition

        return matchesSearch && matchesDepartment && matchesPosition
      })

      setStaff(filteredStaff)
      setPagination((prev) => ({
        ...prev,
        total: filteredStaff.length,
      }))
    } catch (err) {
      setError("Échec du chargement du personnel académique. Veuillez réessayer.")
      console.error("Erreur de chargement du personnel:", err)
      setStaff([])
    } finally {
      setLoading(false)
    }
  }

  const timeoutRef = useRef<number | null>(null)
  const loadStaffRef = useRef(loadStaff)

  useEffect(() => {
    loadStaffRef.current = loadStaff
  }, [loadStaff])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }))

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      loadStaffRef.current()
    }, 300)

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [searchTerm, filterDepartment, filterPosition])

  useEffect(() => {
    loadStaff()
  }, [pagination.page, pagination.limit, userRole])

  const getPositionBadge = (position: string) => {
    const colors: Record<string, string> = {
      "Professeur": "bg-purple-100 text-purple-800",
      "Maître de Conférences": "bg-blue-100 text-blue-800",
      "Maître Assistant": "bg-green-100 text-green-800",
      "Chargé de Cours": "bg-orange-100 text-orange-800",
    }
    return (
      <Badge variant="outline" className={colors[position] || "bg-gray-100 text-gray-800"}>
        {position}
      </Badge>
    )
  }

  const AddStaffForm = () => {
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      specialization: "",
      office: "",
    })
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setSubmitting(true)

      try {
        // Dans une vraie application, cela appellerait l'API
        console.log("Création d'un membre du personnel:", formData)
        setIsAddDialogOpen(false)
        loadStaff()
        setFormData({
          name: "",
          email: "",
          phone: "",
          department: "",
          position: "",
          specialization: "",
          office: "",
        })
      } catch (error) {
        console.error("Erreur de création du personnel:", error)
        setError("Échec de la création du membre du personnel. Veuillez réessayer.")
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nom Complet</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Dr. Jean Dupont"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jean.dupont@university.tn"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+216 71 123 456"
              required
            />
          </div>
          <div>
            <Label htmlFor="office">Bureau</Label>
            <Input
              id="office"
              value={formData.office}
              onChange={(e) => setFormData({ ...formData, office: e.target.value })}
              placeholder="CS-201"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="department">Département</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un département" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Informatique">Informatique</SelectItem>
                <SelectItem value="Génie Logiciel">Génie Logiciel</SelectItem>
                <SelectItem value="Systèmes d'Information">Systèmes d'Information</SelectItem>
                <SelectItem value="Mathématiques">Mathématiques</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="position">Poste</Label>
            <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un poste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Professeur">Professeur</SelectItem>
                <SelectItem value="Maître de Conférences">Maître de Conférences</SelectItem>
                <SelectItem value="Maître Assistant">Maître Assistant</SelectItem>
                <SelectItem value="Chargé de Cours">Chargé de Cours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="specialization">Spécialisation</Label>
          <Input
            id="specialization"
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            placeholder="Intelligence Artificielle, Bases de Données, etc."
            required
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={submitting}>
            Annuler
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création en cours...
              </>
            ) : (
              "Ajouter un membre"
            )}
          </Button>
        </div>
      </form>
    )
  }

  const StaffDetailsDialog = () => {
    if (!selectedStaff) return null

    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails du membre du personnel</DialogTitle>
          <DialogDescription>Informations complètes pour {selectedStaff.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Département</Label>
              <p className="text-sm">{selectedStaff.department}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Poste</Label>
              <div className="mt-1">{getPositionBadge(selectedStaff.position)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Spécialisation</Label>
              <p className="text-sm">{selectedStaff.specialization}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Bureau</Label>
              <p className="text-sm">{selectedStaff.office}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{selectedStaff.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{selectedStaff.phone}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Étudiants Supervisés</Label>
              <p className="text-sm font-medium text-blue-600">{selectedStaff.supervised_students || 0}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Projets Actifs</Label>
              <p className="text-sm font-medium text-green-600">{selectedStaff.active_projects || 0}</p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-500">Date d'Embauche</Label>
            <p className="text-sm">{new Intl.DateTimeFormat('fr-FR').format(new Date(selectedStaff.created_at))}</p>
          </div>
        </div>
      </DialogContent>
    )
  }

  if (loading && staff.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement du personnel académique...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion du Personnel Académique</h2>
          <p className="text-gray-600">Gérer les enseignants et superviseurs académiques</p>
        </div>
        {permissions.canCreateAcademicStaff(userRole) && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un membre
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ajouter un Nouveau Membre</DialogTitle>
                <DialogDescription>Entrez les informations du personnel académique</DialogDescription>
              </DialogHeader>
              <AddStaffForm />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Recherche & Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, email ou spécialisation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par département" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les Départements</SelectItem>
                <SelectItem value="Informatique">Informatique</SelectItem>
                <SelectItem value="Génie Logiciel">Génie Logiciel</SelectItem>
                <SelectItem value="Systèmes d'Information">Systèmes d'Information</SelectItem>
                <SelectItem value="Mathématiques">Mathématiques</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPosition} onValueChange={setFilterPosition}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par poste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les Postes</SelectItem>
                <SelectItem value="Professeur">Professeur</SelectItem>
                <SelectItem value="Maître de Conférences">Maître de Conférences</SelectItem>
                <SelectItem value="Maître Assistant">Maître Assistant</SelectItem>
                <SelectItem value="Chargé de Cours">Chargé de Cours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau du Personnel */}
      <Card>
        <CardHeader>
          <CardTitle>Personnel Académique ({pagination.total})</CardTitle>
          <CardDescription>Enseignants et superviseurs académiques</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Chargement en cours...</span>
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun membre du personnel trouvé.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead>Spécialisation</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Étudiants</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <GraduationCap className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.office}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{member.department}</p>
                    </TableCell>
                    <TableCell>{getPositionBadge(member.position)}</TableCell>
                    <TableCell>
                      <p className="text-sm">{member.specialization}</p>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {member.email}
                        </div>
                        <div className="flex items-center mt-1">
                          <Phone className="h-3 w-3 mr-1" />
                          {member.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <p className="font-medium text-blue-600">{member.supervised_students || 0}</p>
                        <p className="text-xs text-gray-500">Supervisés</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStaff(member)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {permissions.canEditAcademicStaff(userRole) && (
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Affichage de {(pagination.page - 1) * pagination.limit + 1} à{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} membres
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page * pagination.limit >= pagination.total}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogue des Détails du Personnel */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <StaffDetailsDialog />
      </Dialog>
    </div>
  )
}
