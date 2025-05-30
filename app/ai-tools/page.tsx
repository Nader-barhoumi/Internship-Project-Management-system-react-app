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
      title: "AI Document Assistant",
      description: "Get intelligent suggestions and auto-generate professional document content",
      benefits: ["Smart content suggestions", "Grammar and style improvements", "Template generation"],
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Scan,
      title: "OCR Text Scanner",
      description: "Extract text from images and scanned documents with high accuracy",
      benefits: ["99%+ accuracy", "Multiple file formats", "Instant text extraction"],
      color: "bg-green-100 text-green-600",
    },
    {
      icon: FileText,
      title: "PDF Tools",
      description: "View, analyze, and work with PDF documents directly in your browser",
      benefits: ["In-browser viewing", "Text extraction", "Document analysis"],
      color: "bg-purple-100 text-purple-600",
    },
  ]

  const useCases = [
    {
      title: "Document Creation",
      description: "Use AI to generate professional internship agreements and reports",
      steps: ["Select document type", "Get AI suggestions", "Review and customize", "Generate final document"],
    },
    {
      title: "Text Digitization",
      description: "Convert scanned documents and handwritten notes to digital text",
      steps: ["Upload image/scan", "OCR processing", "Review extracted text", "Export or use in documents"],
    },
    {
      title: "Document Analysis",
      description: "Analyze PDF documents for completeness and quality",
      steps: ["Upload PDF", "AI analysis", "Get improvement suggestions", "Apply recommendations"],
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
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI & OCR Tools</h1>
                <p className="text-gray-600">Intelligent document processing and automation</p>
              </div>
            </div>
            <Badge variant="default" className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
            <TabsTrigger value="ocr-scanner">OCR Scanner</TabsTrigger>
            <TabsTrigger value="pdf-tools">PDF Tools</TabsTrigger>
            <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Hero Section */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-white rounded-full shadow-lg">
                      <Bot className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Supercharge Your Document Workflow</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Leverage cutting-edge AI and OCR technology to automate document creation, extract text from images,
                    and enhance your productivity.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <Zap className="h-4 w-4 text-green-500 mr-2" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full mt-4"
                      variant="outline"
                      onClick={() => {
                        if (index === 0) setActiveTab("ai-assistant")
                        if (index === 1) setActiveTab("ocr-scanner")
                        if (index === 2) setActiveTab("pdf-tools")
                      }}
                    >
                      Try Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Use Cases */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Common Use Cases
                </CardTitle>
                <CardDescription>See how these tools can streamline your workflow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {useCases.map((useCase, index) => (
                    <div key={index} className="space-y-3">
                      <h4 className="font-semibold text-lg">{useCase.title}</h4>
                      <p className="text-gray-600 text-sm">{useCase.description}</p>
                      <ol className="space-y-1">
                        {useCase.steps.map((step, idx) => (
                          <li key={idx} className="flex items-center text-sm">
                            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                              {idx + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-assistant" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="h-5 w-5 mr-2" />
                  AI Document Assistant
                </CardTitle>
                <CardDescription>
                  Generate intelligent content suggestions and improve your documents with AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIDocumentAssistant
                  documentType="general"
                  currentContent={generatedContent}
                  onContentUpdate={setGeneratedContent}
                  onSuggestionApply={(suggestion) => {
                    setGeneratedContent((prev) => prev + "\n\n" + suggestion.suggestion)
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ocr-scanner" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scan className="h-5 w-5 mr-2" />
                  OCR Text Scanner
                </CardTitle>
                <CardDescription>Extract text from images and scanned documents with high accuracy</CardDescription>
              </CardHeader>
              <CardContent>
                <OCRScanner
                  onTextExtracted={setExtractedText}
                  onError={(error) => console.error("OCR Error:", error)}
                />

                {extractedText && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Extracted Text</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">{extractedText}</pre>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button variant="outline" onClick={() => navigator.clipboard.writeText(extractedText)}>
                          Copy Text
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const blob = new Blob([extractedText], { type: "text/plain" })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement("a")
                            a.href = url
                            a.download = "extracted-text.txt"
                            a.click()
                          }}
                        >
                          Download as TXT
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pdf-tools" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  PDF Viewer & Tools
                </CardTitle>
                <CardDescription>View, analyze, and work with PDF documents in your browser</CardDescription>
              </CardHeader>
              <CardContent>
                <PDFViewerDemo onFileSelect={(file) => console.log("PDF selected:", file.name)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tutorials" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started with AI Assistant</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Step 1: Choose Document Type</h4>
                    <p className="text-sm text-gray-600">Select the type of document you want to create or improve.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Step 2: Input Content</h4>
                    <p className="text-sm text-gray-600">Add your existing content or start from scratch.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Step 3: Get Suggestions</h4>
                    <p className="text-sm text-gray-600">
                      Click "Get AI Suggestions" to receive intelligent recommendations.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Step 4: Apply & Refine</h4>
                    <p className="text-sm text-gray-600">Apply suggestions and continue refining your document.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>OCR Best Practices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Image Quality</h4>
                    <p className="text-sm text-gray-600">
                      Use high-resolution images with good contrast for best results.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Supported Formats</h4>
                    <p className="text-sm text-gray-600">JPG, PNG, and PDF files are supported for text extraction.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Text Orientation</h4>
                    <p className="text-sm text-gray-600">
                      Ensure text is properly oriented and not skewed for accuracy.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Review Results</h4>
                    <p className="text-sm text-gray-600">Always review extracted text for accuracy before using.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
