"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FileText,
  Upload,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react"

interface PDFViewerDemoProps {
  onFileSelect?: (file: File) => void
}

export default function PDFViewerDemo({ onFileSelect }: PDFViewerDemoProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        if (file.type !== "application/pdf") {
          setError("Please select a valid PDF file")
          return
        }
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          setError("File size must be less than 10MB")
          return
        }

        setError(null)
        setSelectedFile(file)
        setIsProcessing(true)

        // Simulate processing
        setTimeout(() => {
          setIsProcessing(false)
          onFileSelect?.(file)
        }, 1500)
      }
    },
    [onFileSelect],
  )

  const resetViewer = () => {
    setSelectedFile(null)
    setError(null)
    setIsProcessing(false)
  }

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <Card className={selectedFile ? "border-green-200 bg-green-50" : "border-dashed border-gray-300"}>
        <CardContent className="p-6">
          {!selectedFile ? (
            <div className="text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload PDF Document</h3>
              <p className="text-gray-600 mb-4">Select a PDF file to view with our advanced PDF viewer</p>
              <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" id="pdf-upload-demo" />
              <label htmlFor="pdf-upload-demo">
                <Button variant="outline" className="cursor-pointer">
                  <FileText className="h-4 w-4 mr-2" />
                  Choose PDF File
                </Button>
              </label>
              <p className="text-xs text-gray-500 mt-2">Maximum file size: 10MB</p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{selectedFile.name}</h4>
                  <p className="text-sm text-gray-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isProcessing ? (
                  <Badge variant="secondary">Processing...</Badge>
                ) : (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ready
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={resetViewer}>
                  Change File
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* PDF Viewer Interface Demo */}
      {selectedFile && !isProcessing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                PDF Viewer
              </span>
              <Badge variant="outline">Demo Mode</Badge>
            </CardTitle>
            <CardDescription>Interactive PDF viewer with full navigation and zoom controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Viewer Controls */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-1">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm px-2">Page 1 of 5</span>
                <Button variant="outline" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-1">
                <Button variant="outline" size="sm">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm px-2">100%</span>
                <Button variant="outline" size="sm">
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              <Button variant="outline" size="sm">
                <RotateCw className="h-4 w-4" />
              </Button>

              <Button variant="outline" size="sm">
                <Maximize2 className="h-4 w-4" />
              </Button>

              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>

            {/* Simulated PDF Display */}
            <div className="border border-gray-300 rounded-lg bg-white shadow-inner">
              <div className="aspect-[8.5/11] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-700">PDF Content Preview</h3>
                    <p className="text-gray-500 max-w-md">
                      Your PDF document would be displayed here with full interactive capabilities including zoom,
                      navigation, and text selection.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline">Searchable Text</Badge>
                    <Badge variant="outline">High Quality Rendering</Badge>
                    <Badge variant="outline">Fast Loading</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <ZoomIn className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-blue-900">Zoom & Pan</h4>
                <p className="text-sm text-blue-700">Zoom from 50% to 300% with smooth panning</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-green-900">Text Selection</h4>
                <p className="text-sm text-green-700">Select and copy text directly from PDFs</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Download className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium text-purple-900">Export Options</h4>
                <p className="text-sm text-purple-700">Download or print with various options</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
