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
  ArrowLeft,
  Filter,
  Bot,
} from "lucide-react"
import Link from "next/link"

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const documents = [
    {
      id: 1,
      title: "Internship Agreement Template",
      description: "Standard template for internship agreements between students, universities, and companies",
      category: "templates",
      type: "PDF",
      size: "245 KB",
      downloads: 1250,
      tags: ["internship", "agreement", "legal"],
    },
    {
      id: 2,
      title: "Student Evaluation Form",
      description: "Comprehensive evaluation form for assessing student performance during internships",
      category: "academic",
      type: "PDF",
      size: "180 KB",
      downloads: 890,
      tags: ["evaluation", "assessment", "performance"],
    },
    {
      id: 3,
      title: "Company Registration Guide",
      description: "Step-by-step guide for companies to register and participate in the internship program",
      category: "guides",
      type: "PDF",
      size: "320 KB",
      downloads: 567,
      tags: ["company", "registration", "guide"],
    },
    {
      id: 4,
      title: "Legal Framework for Internships",
      description: "Comprehensive overview of legal requirements and regulations for internship programs",
      category: "legal",
      type: "PDF",
      size: "450 KB",
      downloads: 423,
      tags: ["legal", "regulations", "compliance"],
    },
    {
      id: 5,
      title: "Project Proposal Template",
      description: "Template for students to submit their final year project proposals",
      category: "templates",
      type: "DOCX",
      size: "125 KB",
      downloads: 1100,
      tags: ["project", "proposal", "template"],
    },
    {
      id: 6,
      title: "Academic Calendar 2024",
      description: "Official academic calendar with important dates and deadlines",
      category: "academic",
      type: "PDF",
      size: "95 KB",
      downloads: 2100,
      tags: ["calendar", "dates", "academic"],
    },
    {
      id: 7,
      title: "Internship Best Practices",
      description: "Guidelines and best practices for successful internship experiences",
      category: "guides",
      type: "PDF",
      size: "280 KB",
      downloads: 756,
      tags: ["best practices", "guidelines", "success"],
    },
    {
      id: 8,
      title: "Data Protection Policy",
      description: "University policy on data protection and privacy for student information",
      category: "legal",
      type: "PDF",
      size: "210 KB",
      downloads: 345,
      tags: ["data protection", "privacy", "policy"],
    },
  ]

  const categories = [
    { id: "all", label: "All Documents", icon: FileText, count: documents.length },
    {
      id: "academic",
      label: "Academic",
      icon: BookOpen,
      count: documents.filter((d) => d.category === "academic").length,
    },
    { id: "legal", label: "Legal", icon: Scale, count: documents.filter((d) => d.category === "legal").length },
    {
      id: "templates",
      label: "Templates",
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
    // Simulate download
    console.log(`Downloading: ${document.title}`)
    // In a real app, this would trigger an actual download
  }

  const handlePreview = (document: any) => {
    // Simulate preview
    console.log(`Previewing: ${document.title}`)
    // In a real app, this would open a preview modal or new tab
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
                <h1 className="text-xl font-bold text-gray-900">Document Library</h1>
                <p className="text-xs text-gray-500">Public Resources & Templates</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/home">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Home</span>
                </Button>
              </Link>
              <Link href="/ai-tools">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <span>AI Tools</span>
                  <Badge variant="secondary" className="ml-1">
                    New
                  </Badge>
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Document Library</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Access templates, guides, and resources for academic management. No account required.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search documents, templates, guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
                  <category.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{category.label}</span>
                  <Badge variant="secondary" className="ml-1">
                    {category.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredDocuments.length} of {documents.length} documents
          </p>
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{document.title}</CardTitle>
                    <CardDescription className="text-sm">{document.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {document.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {document.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{document.size}</span>
                    <span>{document.downloads} downloads</span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handlePreview(document)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleDownload(document)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-500">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="h-6 w-6 text-blue-400 mr-2" />
            <span className="font-semibold">Academic Management System</span>
          </div>
          <p className="text-gray-400">&copy; 2024 Academic Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
