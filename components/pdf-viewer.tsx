"use client"

import { useState, useCallback } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  FileText,
  Loader2,
  AlertCircle,
  Maximize2,
} from "lucide-react"

// Set up PDF.js worker with fallback options
if (typeof window !== "undefined") {
  // Try multiple CDN sources for better reliability
  const workerSources = [
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`,
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`,
    `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`,
  ]

  // Set the first available worker source
  pdfjs.GlobalWorkerOptions.workerSrc = workerSources[0]
}

interface PDFViewerProps {
  file: File | string | null
  onError?: (error: string) => void
  onLoadSuccess?: (numPages: number) => void
}

export default function PDFViewer({ file, onError, onLoadSuccess }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [rotation, setRotation] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages)
      setPageNumber(1)
      setIsLoading(false)
      setError(null)
      onLoadSuccess?.(numPages)
    },
    [onLoadSuccess],
  )

  const onDocumentLoadError = useCallback(
    (error: Error) => {
      setIsLoading(false)
      const errorMessage = `Failed to load PDF: ${error.message}`
      setError(errorMessage)
      onError?.(errorMessage)
    },
    [onError],
  )

  const onPageLoadSuccess = useCallback(() => {
    setIsLoading(false)
  }, [])

  const onPageLoadError = useCallback(
    (error: Error) => {
      setIsLoading(false)
      const errorMessage = `Failed to load page: ${error.message}`
      setError(errorMessage)
      onError?.(errorMessage)
    },
    [onError],
  )

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages))
  }

  const goToPage = (page: number) => {
    const pageNum = Math.max(1, Math.min(page, numPages))
    setPageNumber(pageNum)
  }

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3.0))
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5))
  }

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const resetView = () => {
    setScale(1.0)
    setRotation(0)
  }

  const downloadPDF = () => {
    if (file instanceof File) {
      const url = URL.createObjectURL(file)
      const a = document.createElement("a")
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else if (typeof file === "string") {
      window.open(file, "_blank")
    }
  }

  if (!file) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No PDF Selected</h3>
          <p className="text-gray-600 mb-4">Upload a PDF file to view it here</p>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0]
              if (selectedFile && selectedFile.type === "application/pdf") {
                // This would be handled by parent component
                console.log("PDF file selected:", selectedFile.name)
              }
            }}
            className="hidden"
            id="pdf-file-input"
          />
          <label htmlFor="pdf-file-input">
            <Button variant="outline" className="cursor-pointer">
              <FileText className="h-4 w-4 mr-2" />
              Choose PDF File
            </Button>
          </label>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* PDF Viewer Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle className="text-lg">PDF Viewer</CardTitle>
                <CardDescription>{numPages > 0 && `${numPages} pages • Page ${pageNumber}`}</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{Math.round(scale * 100)}% zoom</Badge>
              {rotation > 0 && <Badge variant="outline">{rotation}° rotated</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Navigation */}
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={pageNumber <= 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={pageNumber}
                  onChange={(e) => goToPage(Number.parseInt(e.target.value) || 1)}
                  className="w-16 text-center"
                  min={1}
                  max={numPages}
                />
                <span className="text-sm text-gray-500">of {numPages}</span>
              </div>
              <Button variant="outline" size="sm" onClick={goToNextPage} disabled={pageNumber >= numPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm" onClick={zoomOut} disabled={scale <= 0.5}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={zoomIn} disabled={scale >= 3.0}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* Rotation */}
            <Button variant="outline" size="sm" onClick={rotate}>
              <RotateCw className="h-4 w-4" />
            </Button>

            {/* Reset */}
            <Button variant="outline" size="sm" onClick={resetView}>
              Reset View
            </Button>

            {/* Fullscreen */}
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
              <Maximize2 className="h-4 w-4" />
            </Button>

            {/* Download */}
            <Button variant="outline" size="sm" onClick={downloadPDF}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PDF Document */}
      <Card className={isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}>
        <CardContent className={`p-4 ${isFullscreen ? "h-full overflow-auto" : ""}`}>
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="flex justify-center">
              <div className="border border-gray-300 shadow-lg">
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <span className="ml-2">Loading PDF...</span>
                    </div>
                  }
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    rotate={rotation}
                    onLoadSuccess={onPageLoadSuccess}
                    onLoadError={onPageLoadError}
                    loading={
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      </div>
                    }
                  />
                </Document>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Page Progress */}
      {numPages > 1 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Progress:</span>
          <Progress value={(pageNumber / numPages) * 100} className="flex-1" />
          <span className="text-sm text-gray-500">{Math.round((pageNumber / numPages) * 100)}%</span>
        </div>
      )}
    </div>
  )
}
