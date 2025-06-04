"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, GraduationCap } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("login")
  const router = useRouter()
  const { login, register, isAuthenticated, isLoading: authLoading } = useAuth()

  // État du formulaire de connexion
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    role: "",
  })

  // État du formulaire d'inscription
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    department: "",
    phone: "",
  })

  // Rediriger si déjà authentifié
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push("/")
    }
  }, [isAuthenticated, authLoading, router])

  // Aide aux identifiants de démonstration
  const fillDemoCredentials = (role: string) => {
    const demoCredentials = {
      admin: { email: "admin@university.edu", password: "password", role: "admin" },
      student: { email: "student@university.edu", password: "password", role: "student" },
      teacher: { email: "tutor@university.edu", password: "password", role: "teacher" },
      industrial_tutor: { email: "supervisor@company.com", password: "password", role: "industrial_tutor" },
    }

    const credentials = demoCredentials[role as keyof typeof demoCredentials]
    if (credentials) {
      setLoginForm(credentials)
      setError("") // Effacer les erreurs précédentes
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (!loginForm.email || !loginForm.password || !loginForm.role) {
      setError("Veuillez remplir tous les champs")
      setIsLoading(false)
      return
    }

    try {
      const result = await login(loginForm.email, loginForm.password, loginForm.role)

      if (result.success) {
        setSuccess("Connexion réussie ! Redirection...")
        setTimeout(() => {
          router.push("/")
        }, 1000)
      } else {
        setError(result.error || "Échec de la connexion")
      }
    } catch (error) {
      setError("Une erreur inattendue s'est produite")
      console.error("Erreur de connexion:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Validation
    if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.role) {
      setError("Veuillez remplir tous les champs obligatoires")
      setIsLoading(false)
      return
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    try {
      const result = await register({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        role: registerForm.role,
        department: registerForm.department,
        phone: registerForm.phone,
      })

      if (result.success) {
        setSuccess("Inscription réussie ! Vous pouvez maintenant vous connecter.")
        setActiveTab("login")
        setRegisterForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "",
          department: "",
          phone: "",
        })
      } else {
        setError(result.error || "Échec de l'inscription")
      }
    } catch (error) {
      setError("Une erreur inattendue s'est produite")
      console.error("Erreur d'inscription:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col md:flex-row">
      {/* Left side - Promo Content */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 flex-col justify-center">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-8">
            <GraduationCap className="h-10 w-10 text-blue-200 mr-3" />
            <div>
              <h1 className="text-2xl font-bold">Système de Gestion Académique</h1>
              <p className="text-blue-200">Gestion des Stages & Projets</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-6">Bienvenue à la plateforme de gestion académique</h2>
          <p className="text-xl text-blue-100 mb-8">
            Connectez-vous ou créez un compte pour accéder aux outils de gestion des stages, des projets et au système de collaboration académique.
          </p>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-white/10 rounded-full p-2 mr-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Gestion des stages simplifiée</h3>
                <p className="text-blue-100">Suivi des stages, évaluation et documentation simplifiés</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-white/10 rounded-full p-2 mr-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Collaboration améliorée</h3>
                <p className="text-blue-100">Communication fluide entre étudiants, enseignants et tuteurs industriels</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-white/10 rounded-full p-2 mr-4">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Des outils IA avancés</h3>
                <p className="text-blue-100">Extraction de documents et analyses via technologie OCR et IA</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Forms */}
      <div className="w-full md:w-1/2 p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl border-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader>
              <div className="flex items-center mb-2">
                <GraduationCap className="h-6 w-6 text-blue-600 mr-2 md:hidden" />
                <CardTitle className="text-2xl">Authentification</CardTitle>
              </div>
              <CardDescription>Connectez-vous ou créez un nouveau compte</CardDescription>

              <TabsList className="grid w-full grid-cols-2 mt-4">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="register">Inscription</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre.email@exemple.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle</Label>
                    <Select
                      value={loginForm.role}
                      onValueChange={(value) => setLoginForm({ ...loginForm, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Étudiant</SelectItem>
                        <SelectItem value="teacher">Enseignant</SelectItem>
                        <SelectItem value="industrial_tutor">Tuteur industriel</SelectItem>
                        <SelectItem value="admin">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Comptes de démonstration */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                    <p className="font-medium mb-2">Comptes de démonstration :</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fillDemoCredentials("student")}
                      >
                        Étudiant
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fillDemoCredentials("teacher")}
                      >
                        Enseignant
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fillDemoCredentials("industrial_tutor")}
                      >
                        Tuteur Industrie
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fillDemoCredentials("admin")}
                      >
                        Admin
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="bg-green-50 text-green-800 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion en cours...
                      </>
                    ) : (
                      "Se Connecter"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Form */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      placeholder="Jean Dupont"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="votre.email@exemple.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-role">Rôle</Label>
                    <Select
                      value={registerForm.role}
                      onValueChange={(value) => setRegisterForm({ ...registerForm, role: value })}
                    >
                      <SelectTrigger id="register-role">
                        <SelectValue placeholder="Sélectionnez votre rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Étudiant</SelectItem>
                        <SelectItem value="teacher">Enseignant</SelectItem>
                        <SelectItem value="industrial_tutor">Tuteur industriel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Département/Entreprise</Label>
                    <Input
                      id="department"
                      placeholder="Informatique / Nom de l'entreprise"
                      value={registerForm.department}
                      onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone (optionnel)</Label>
                    <Input
                      id="phone"
                      placeholder="+33 6 12 34 56 78"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="bg-green-50 text-green-800 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Inscription en cours...
                      </>
                    ) : (
                      "S'inscrire"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
