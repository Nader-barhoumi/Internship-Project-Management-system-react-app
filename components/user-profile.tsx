"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  User,
  Mail,
  Phone,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Key,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  avatar?: string
  role: "admin" | "student" | "tutor" | "company_supervisor"
  department?: string
  studentId?: string
  employeeId?: string
  companyName?: string
  position?: string
  specialization?: string
  yearOfStudy?: string
  enrollmentDate?: string
  hireDate?: string
  bio?: string
  skills?: string[]
  languages?: string[]
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  preferences?: {
    emailNotifications: boolean
    smsNotifications: boolean
    theme: "light" | "dark" | "system"
    language: string
  }
}

export default function UserProfile() {
  const { user, updateProfile } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", content: "" })
  const [activeTab, setActiveTab] = useState("personal")
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  useEffect(() => {
    // Load user profile data
    if (user) {
      const mockProfile: UserProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: "+1-555-0123",
        address: "123 University Ave, City, State 12345",
        avatar: "",
        role: user.role,
        department: user.department,
        studentId: user.role === "student" ? "CS2024001" : undefined,
        employeeId: user.role === "tutor" ? "EMP2021001" : undefined,
        companyName: user.role === "company_supervisor" ? "TechCorp Solutions" : undefined,
        position: user.role === "company_supervisor" ? "Senior Developer" : undefined,
        specialization: user.role === "tutor" ? "Software Engineering" : undefined,
        yearOfStudy: user.role === "student" ? "Final Year" : undefined,
        enrollmentDate: user.role === "student" ? "2021-09-01" : undefined,
        hireDate: user.role === "tutor" ? "2015-09-01" : undefined,
        bio: "Passionate about technology and continuous learning.",
        skills: ["JavaScript", "React", "Node.js", "Python", "Machine Learning"],
        languages: ["English", "French", "Spanish"],
        emergencyContact: {
          name: "Jane Doe",
          phone: "+1-555-0124",
          relationship: "Parent",
        },
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          theme: "light",
          language: "en",
        },
      }
      setProfile(mockProfile)
    }
  }, [user])

  const handleSave = async () => {
    if (!profile) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update auth context
      await updateProfile(profile)

      setMessage({ type: "success", content: "Profile updated successfully!" })
      setIsEditing(false)
    } catch (error) {
      setMessage({ type: "error", content: "Failed to update profile. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", content: "New passwords do not match." })
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: "error", content: "Password must be at least 8 characters long." })
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setMessage({ type: "success", content: "Password changed successfully!" })
      setIsPasswordDialogOpen(false)
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      setMessage({ type: "error", content: "Failed to change password. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && profile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfile({ ...profile, avatar: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const PersonalInfoTab = () => (
    <div className="space-y-4 md:space-y-6">
      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
            <User className="h-5 w-5" />
            <span>Profile Picture</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative">
            <Avatar className="h-20 w-20 md:h-24 md:w-24">
              <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
              <AvatarFallback className="text-lg">
                {profile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold">{profile.name}</h3>
            <p className="text-gray-600 capitalize">{profile.role.replace("_", " ")}</p>
            <Badge variant="outline" className="mt-1">
              {profile.department}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile.email} disabled className="mt-1" />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                disabled={!isEditing}
                placeholder="+1-555-0123"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={profile.role.replace("_", " ")} disabled className="capitalize mt-1" />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={profile.address || ""}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              disabled={!isEditing}
              placeholder="Your address"
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio || ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              disabled={!isEditing}
              placeholder="Tell us about yourself"
              rows={4}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Role-specific Information - Mobile optimized */}
      {profile.role === "student" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Academic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="studentId">Student ID</Label>
                <Input id="studentId" value={profile.studentId || ""} disabled className="mt-1" />
              </div>
              <div>
                <Label htmlFor="yearOfStudy">Year of Study</Label>
                <Select
                  value={profile.yearOfStudy || ""}
                  onValueChange={(value) => setProfile({ ...profile, yearOfStudy: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="First Year">First Year</SelectItem>
                    <SelectItem value="Second Year">Second Year</SelectItem>
                    <SelectItem value="Third Year">Third Year</SelectItem>
                    <SelectItem value="Final Year">Final Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                <Input
                  id="enrollmentDate"
                  type="date"
                  value={profile.enrollmentDate || ""}
                  onChange={(e) => setProfile({ ...profile, enrollmentDate: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {profile.role === "tutor" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Academic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input id="employeeId" value={profile.employeeId || ""} disabled className="mt-1" />
              </div>
              <div>
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={profile.specialization || ""}
                  onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Your area of expertise"
                  className="mt-1"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <Label htmlFor="hireDate">Hire Date</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={profile.hireDate || ""}
                  onChange={(e) => setProfile({ ...profile, hireDate: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {profile.role === "company_supervisor" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={profile.companyName || ""}
                  onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Your company"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={profile.position || ""}
                  onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Your job title"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const SkillsTab = () => (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Skills & Expertise</CardTitle>
          <CardDescription className="text-sm">Add your technical skills and areas of expertise</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="skills" className="text-base font-medium">
              Skills
            </Label>
            <div className="flex flex-wrap gap-2 mt-3">
              {profile.skills?.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1 text-sm py-1 px-2">
                  <span>{skill}</span>
                  {isEditing && (
                    <button
                      onClick={() => {
                        const newSkills = profile.skills?.filter((_, i) => i !== index)
                        setProfile({ ...profile, skills: newSkills })
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="mt-3">
                <Input
                  placeholder="Add a skill and press Enter"
                  className="w-full"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      const value = e.currentTarget.value.trim()
                      if (value && !profile.skills?.includes(value)) {
                        setProfile({
                          ...profile,
                          skills: [...(profile.skills || []), value],
                        })
                        e.currentTarget.value = ""
                      }
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">Press Enter to add a skill</p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="languages" className="text-base font-medium">
              Languages
            </Label>
            <div className="flex flex-wrap gap-2 mt-3">
              {profile.languages?.map((language, index) => (
                <Badge key={index} variant="outline" className="flex items-center space-x-1 text-sm py-1 px-2">
                  <span>{language}</span>
                  {isEditing && (
                    <button
                      onClick={() => {
                        const newLanguages = profile.languages?.filter((_, i) => i !== index)
                        setProfile({ ...profile, languages: newLanguages })
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="mt-3">
                <Input
                  placeholder="Add a language and press Enter"
                  className="w-full"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      const value = e.currentTarget.value.trim()
                      if (value && !profile.languages?.includes(value)) {
                        setProfile({
                          ...profile,
                          languages: [...(profile.languages || []), value],
                        })
                        e.currentTarget.value = ""
                      }
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">Press Enter to add a language</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const EmergencyContactTab = () => (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Emergency Contact</CardTitle>
          <CardDescription className="text-sm">Person to contact in case of emergency</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyName">Contact Name</Label>
              <Input
                id="emergencyName"
                value={profile.emergencyContact?.name || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    emergencyContact: { ...profile.emergencyContact!, name: e.target.value },
                  })
                }
                disabled={!isEditing}
                placeholder="Full name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="emergencyPhone">Phone Number</Label>
              <Input
                id="emergencyPhone"
                value={profile.emergencyContact?.phone || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    emergencyContact: { ...profile.emergencyContact!, phone: e.target.value },
                  })
                }
                disabled={!isEditing}
                placeholder="+1-555-0123"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="emergencyRelationship">Relationship</Label>
            <Select
              value={profile.emergencyContact?.relationship || ""}
              onValueChange={(value) =>
                setProfile({
                  ...profile,
                  emergencyContact: { ...profile.emergencyContact!, relationship: value },
                })
              }
              disabled={!isEditing}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Parent">Parent</SelectItem>
                <SelectItem value="Spouse">Spouse</SelectItem>
                <SelectItem value="Sibling">Sibling</SelectItem>
                <SelectItem value="Friend">Friend</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const PreferencesTab = () => (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Notification Preferences</CardTitle>
          <CardDescription className="text-sm">Choose how you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <Label htmlFor="emailNotifications" className="text-base font-medium">
                Email Notifications
              </Label>
              <p className="text-sm text-gray-500">Receive updates via email</p>
            </div>
            <Button
              variant={profile.preferences?.emailNotifications ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setProfile({
                  ...profile,
                  preferences: {
                    ...profile.preferences!,
                    emailNotifications: !profile.preferences?.emailNotifications,
                  },
                })
              }
              disabled={!isEditing}
              className="w-full sm:w-auto"
            >
              {profile.preferences?.emailNotifications ? "Enabled" : "Disabled"}
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <Label htmlFor="smsNotifications" className="text-base font-medium">
                SMS Notifications
              </Label>
              <p className="text-sm text-gray-500">Receive updates via SMS</p>
            </div>
            <Button
              variant={profile.preferences?.smsNotifications ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setProfile({
                  ...profile,
                  preferences: {
                    ...profile.preferences!,
                    smsNotifications: !profile.preferences?.smsNotifications,
                  },
                })
              }
              disabled={!isEditing}
              className="w-full sm:w-auto"
            >
              {profile.preferences?.smsNotifications ? "Enabled" : "Disabled"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Display Preferences</CardTitle>
          <CardDescription className="text-sm">Customize your interface</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={profile.preferences?.theme || "light"}
                onValueChange={(value) =>
                  setProfile({
                    ...profile,
                    preferences: { ...profile.preferences!, theme: value as any },
                  })
                }
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="language">Language</Label>
              <Select
                value={profile.preferences?.language || "en"}
                onValueChange={(value) =>
                  setProfile({
                    ...profile,
                    preferences: { ...profile.preferences!, language: value },
                  })
                }
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const SecurityTab = () => (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
            <Shield className="h-5 w-5" />
            <span>Security Settings</span>
          </CardTitle>
          <CardDescription className="text-sm">Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-3">
            <div className="flex items-start space-x-3 flex-1">
              <Key className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Password</p>
                <p className="text-sm text-gray-500">Last changed 30 days ago</p>
              </div>
            </div>
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md mx-auto">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>Enter your current password and choose a new one</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Enter new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsPasswordDialogOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handlePasswordChange} disabled={isLoading} className="w-full sm:w-auto">
                      {isLoading ? "Changing..." : "Change Password"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-3">
            <div className="flex items-start space-x-3 flex-1">
              <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Email Verification</p>
                <p className="text-sm text-gray-500">Your email is verified</p>
              </div>
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800 w-fit">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-3">
            <div className="flex items-start space-x-3 flex-1">
              <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              Enable 2FA
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Profile Settings</h2>
          <p className="text-sm md:text-base text-gray-600">Manage your account information and preferences</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {message.content && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertDescription>{message.content}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="sticky top-0 bg-white z-10 border-b pb-4 mb-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
            <TabsTrigger value="personal" className="text-xs md:text-sm py-2">
              <User className="h-4 w-4 md:mr-2" />
              <span className="hidden sm:inline">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="text-xs md:text-sm py-2">
              <span className="hidden sm:inline">Skills</span>
              <span className="sm:hidden">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="emergency" className="text-xs md:text-sm py-2 col-span-2 md:col-span-1">
              <Phone className="h-4 w-4 md:mr-2" />
              <span className="hidden sm:inline">Emergency</span>
              <span className="sm:hidden">Contact</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs md:text-sm py-2 hidden md:flex">
              Preferences
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs md:text-sm py-2 hidden md:flex">
              <Shield className="h-4 w-4 md:mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Mobile-only dropdown for hidden tabs */}
          <div className="md:hidden mt-2">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="More options..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preferences">Preferences</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="personal">
          <PersonalInfoTab />
        </TabsContent>

        <TabsContent value="skills">
          <SkillsTab />
        </TabsContent>

        <TabsContent value="emergency">
          <EmergencyContactTab />
        </TabsContent>

        <TabsContent value="preferences">
          <PreferencesTab />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
