"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, Scan, FileText, ImageIcon, AlertCircle, Loader2, Copy, Download } from "lucide-react"
import { createWorker } from "tesseract.js"

interface OCRResult {
  text: string
  confidence: number
  words: Array<{
    text: string
    confidence: number
    bbox: {
      x0: number
      y0: number
      x1: number
      y1: number
    }
  }>
}

interface OCRScannerProps {
  onTextExtracted: (text: string) => void
  onError?: (error: string) => void
}

export default function OCRScannerFr({ onTextExtracted, onError }: OCRScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<OCRResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("upload")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setResult(null)
    }
  }

  const processOCR = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setProgress(0)

    try {
      const worker = await createWorker("fra", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100))
          }
        },
      })

      const { data } = await worker.recognize(selectedFile)

      const ocrResult: OCRResult = {
        text: data.text,
        confidence: data.confidence,
        words: Array.isArray((data as any).words)
          ? (data as any).words.map((word: any) => ({
              text: word.text,
              confidence: word.confidence,
              bbox: word.bbox,
            }))
          : [],
      }

      setResult(ocrResult)
      onTextExtracted(data.text)

      await worker.terminate()
    } catch (error) {
      console.error("Erreur OCR:", error)
      const errorMessage = error instanceof Error ? error.message : "Le traitement OCR a échoué"
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const copyToClipboard = async () => {
    if (result?.text) {
      try {
        await navigator.clipboard.writeText(result.text)
        // Vous pourriez ajouter une notification toast ici
      } catch (error) {
        console.error("Impossible de copier le texte:", error)
      }
    }
  }

  const downloadText = () => {
    if (result?.text) {
      const blob = new Blob([result.text], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "texte-extrait.txt"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600"
    if (confidence >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return { variant: "default" as const, label: "Élevée" }
    if (confidence >= 60) return { variant: "secondary" as const, label: "Moyenne" }
    return { variant: "destructive" as const, label: "Faible" }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Scan className="h-5 w-5 text-blue-600" />
            <CardTitle>Scanner de Texte OCR</CardTitle>
          </div>
          <CardDescription>
            Extrayez du texte à partir d'images et de documents numérisés grâce à une technologie OCR avancée
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Télécharger & Scanner</TabsTrigger>
          <TabsTrigger value="results">Texte Extrait</TabsTrigger>
          <TabsTrigger value="analysis">Analyse de Qualité</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Télécharger un Document</CardTitle>
              <CardDescription>Sélectionnez une image ou un fichier PDF pour en extraire le texte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="space-y-4">
                    <div className="max-w-md mx-auto">
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Aperçu"
                        className="max-h-64 mx-auto rounded-lg shadow-md"
                      />
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{selectedFile?.name}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">Télécharger un document</p>
                      <p className="text-sm text-gray-500">Prend en charge les fichiers JPG, PNG, PDF jusqu'à 10 Mo</p>
                    </div>
                  </div>
                )}

                <div className="mt-4 space-x-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{selectedFile ? "Changer de Fichier" : "Sélectionner un Fichier"}</span>
                  </Button>

                  {selectedFile && (
                    <Button onClick={processOCR} disabled={isProcessing} className="flex items-center space-x-2">
                      {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />}
                      <span>{isProcessing ? "Traitement en cours..." : "Extraire le Texte"}</span>
                    </Button>
                  )}
                </div>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Traitement du document...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {result ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Texte Extrait</CardTitle>
                    <CardDescription>
                      Texte extrait de votre document avec {result.confidence.toFixed(1)}% de confiance
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge {...getConfidenceBadge(result.confidence)}>{result.confidence.toFixed(1)}% de Confiance</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={result.text}
                  readOnly
                  className="min-h-[300px] font-mono text-sm"
                  placeholder="Le texte extrait apparaîtra ici..."
                />

                <div className="flex space-x-2">
                  <Button onClick={copyToClipboard} variant="outline" size="sm" className="flex items-center space-x-1">
                    <Copy className="h-3 w-3" />
                    <span>Copier le Texte</span>
                  </Button>
                  <Button onClick={downloadText} variant="outline" size="sm" className="flex items-center space-x-1">
                    <Download className="h-3 w-3" />
                    <span>Télécharger</span>
                  </Button>
                  <Button
                    onClick={() => onTextExtracted(result.text)}
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <FileText className="h-3 w-3" />
                    <span>Utiliser dans le Document</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Aucun texte extrait pour le moment. Téléchargez et scannez un document pour voir les résultats ici.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {result ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Qualité Globale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Score de Confiance</span>
                      <span className={`font-medium ${getConfidenceColor(result.confidence)}`}>
                        {result.confidence.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={result.confidence} />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mots Détectés</span>
                      <span className="font-medium">{result.words.length}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Caractères</span>
                      <span className="font-medium">{result.text.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Confiance par Mot</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {result.words.slice(0, 10).map((word, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="truncate max-w-[120px]">{word.text}</span>
                        <Badge
                          variant={
                            word.confidence >= 80 ? "default" : word.confidence >= 60 ? "secondary" : "destructive"
                          }
                          className="text-xs"
                        >
                          {word.confidence.toFixed(0)}%
                        </Badge>
                      </div>
                    ))}
                    {result.words.length > 10 && (
                      <p className="text-xs text-gray-500 text-center">... et {result.words.length - 10} autres mots</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Aucune analyse disponible. Traitez d'abord un document pour voir les métriques de qualité.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
