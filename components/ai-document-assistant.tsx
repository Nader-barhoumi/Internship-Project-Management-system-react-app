"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, Lightbulb, CheckCircle, AlertCircle, Loader2, Wand2 } from "lucide-react"

interface AISuggestion {
  id: string
  type: "content" | "structure" | "improvement"
  title: string
  suggestion: string
  confidence: number
  category: string
}

interface DocumentAnalysis {
  wordCount: number
  readabilityScore: number
  completeness: number
  suggestions: AISuggestion[]
  missingElements: string[]
}

interface AIDocumentAssistantProps {
  documentType: string
  currentContent: string
  onContentUpdate: (content: string) => void
  onSuggestionApply: (suggestion: AISuggestion) => void
}

export default function AIDocumentAssistant({
  documentType,
  currentContent,
  onContentUpdate,
  onSuggestionApply,
}: AIDocumentAssistantProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null)
  const [activeTab, setActiveTab] = useState("suggestions")

  // Mock AI analysis - in production, this would call your AI service
  const analyzeDocument = async () => {
    setIsAnalyzing(true)

    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockAnalysis: DocumentAnalysis = {
      wordCount: currentContent.split(" ").length,
      readabilityScore: Math.floor(Math.random() * 40) + 60, // 60-100
      completeness: Math.floor(Math.random() * 30) + 70, // 70-100
      suggestions: [
        {
          id: "1",
          type: "content",
          title: "Add Specific Objectives",
          suggestion:
            "Consider adding more specific learning objectives for this internship. For example: 'Develop proficiency in React.js and Next.js frameworks' or 'Gain experience in agile development methodologies.'",
          confidence: 85,
          category: "Content Enhancement",
        },
        {
          id: "2",
          type: "structure",
          title: "Improve Document Structure",
          suggestion:
            "Add clear section headers to improve readability. Suggested sections: Introduction, Objectives, Tasks and Responsibilities, Timeline, Evaluation Criteria.",
          confidence: 92,
          category: "Structure",
        },
        {
          id: "3",
          type: "improvement",
          title: "Enhance Professional Language",
          suggestion:
            "Replace informal phrases with more professional language. For example, change 'work on stuff' to 'collaborate on project deliverables.'",
          confidence: 78,
          category: "Language",
        },
        {
          id: "4",
          type: "content",
          title: "Add Compliance Information",
          suggestion:
            "Include information about data protection compliance and confidentiality agreements as required by Tunisian labor law.",
          confidence: 95,
          category: "Legal Compliance",
        },
      ],
      missingElements: [
        "Student contact information",
        "Emergency contact details",
        "Insurance information",
        "Evaluation criteria",
      ],
    }

    setAnalysis(mockAnalysis)
    setIsAnalyzing(false)
  }

  // Mock AI content generation
  const generateContent = async (prompt: string) => {
    setIsGenerating(true)

    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const templates = {
      internship_agreement: `
INTERNSHIP AGREEMENT

1. PARTIES
This agreement is entered into between:
- Student: [Student Name]
- University: [University Name]
- Company: [Company Name]

2. INTERNSHIP DETAILS
- Position: [Internship Position]
- Department: [Department Name]
- Duration: [Start Date] to [End Date]
- Working Hours: [Hours per week]

3. OBJECTIVES
The primary objectives of this internship are to:
- Provide practical experience in [Field/Industry]
- Develop professional skills in [Specific Skills]
- Apply theoretical knowledge in real-world scenarios
- Foster professional development and career readiness

4. RESPONSIBILITIES
Student Responsibilities:
- Maintain professional conduct at all times
- Complete assigned tasks diligently and on time
- Follow company policies and procedures
- Maintain confidentiality of company information

Company Responsibilities:
- Provide adequate supervision and guidance
- Ensure a safe working environment
- Provide necessary resources and training
- Conduct regular performance evaluations

5. EVALUATION
Performance will be evaluated based on:
- Quality of work completed
- Professional behavior and attitude
- Initiative and problem-solving abilities
- Adherence to deadlines and schedules

6. TERMS AND CONDITIONS
- This internship is unpaid/paid [specify]
- Student must maintain [minimum GPA/requirements]
- Any intellectual property created belongs to [specify ownership]
- Either party may terminate with [notice period] notice

7. SIGNATURES
Student: _________________ Date: _________
Company Supervisor: _________________ Date: _________
Academic Supervisor: _________________ Date: _________
`,
      evaluation: `
INTERNSHIP EVALUATION FORM

Student Information:
- Name: [Student Name]
- Student ID: [ID Number]
- Program: [Degree Program]
- Internship Period: [Start Date] - [End Date]

Company Information:
- Company: [Company Name]
- Supervisor: [Supervisor Name]
- Department: [Department]

PERFORMANCE EVALUATION

1. Technical Skills (25%)
□ Excellent (90-100%) □ Good (80-89%) □ Satisfactory (70-79%) □ Needs Improvement (<70%)
Comments: ________________________________

2. Professional Behavior (25%)
□ Excellent (90-100%) □ Good (80-89%) □ Satisfactory (70-79%) □ Needs Improvement (<70%)
Comments: ________________________________

3. Communication Skills (25%)
□ Excellent (90-100%) □ Good (80-89%) □ Satisfactory (70-79%) □ Needs Improvement (<70%)
Comments: ________________________________

4. Initiative and Problem Solving (25%)
□ Excellent (90-100%) □ Good (80-89%) □ Satisfactory (70-79%) □ Needs Improvement (<70%)
Comments: ________________________________

OVERALL PERFORMANCE:
□ Excellent □ Good □ Satisfactory □ Needs Improvement

RECOMMENDATIONS:
_________________________________________________

Supervisor Signature: _________________ Date: _________
`,
      pfe_report: `
FINAL YEAR PROJECT REPORT TEMPLATE

TITLE PAGE
- Project Title: [Your Project Title]
- Student Name: [Your Name]
- Student ID: [Your ID]
- Academic Year: [Year]
- Supervisor: [Supervisor Name]
- Company: [Company Name] (if applicable)

ABSTRACT
[Brief summary of the project, objectives, methodology, and key findings - 200-300 words]

TABLE OF CONTENTS
1. Introduction
2. Literature Review
3. Methodology
4. Implementation
5. Results and Analysis
6. Conclusion and Future Work
7. References
8. Appendices

1. INTRODUCTION
1.1 Background and Context
[Provide context for your project]

1.2 Problem Statement
[Clearly define the problem you're addressing]

1.3 Objectives
- Primary Objective: [Main goal]
- Secondary Objectives: [Supporting goals]

1.4 Scope and Limitations
[Define what is included and excluded]

2. LITERATURE REVIEW
[Review relevant academic and industry sources]

3. METHODOLOGY
3.1 Research Approach
[Describe your methodology]

3.2 Tools and Technologies
[List technologies, frameworks, tools used]

3.3 Development Process
[Describe your development approach]

4. IMPLEMENTATION
4.1 System Architecture
[Describe the overall system design]

4.2 Key Features
[Detail main features implemented]

4.3 Challenges and Solutions
[Discuss problems encountered and how you solved them]

5. RESULTS AND ANALYSIS
5.1 Testing Results
[Present test results and performance metrics]

5.2 User Feedback
[Include user testing feedback if applicable]

5.3 Analysis
[Analyze and interpret your results]

6. CONCLUSION AND FUTURE WORK
6.1 Summary of Achievements
[Summarize what you accomplished]

6.2 Lessons Learned
[Reflect on the learning experience]

6.3 Future Enhancements
[Suggest improvements and extensions]

REFERENCES
[List all sources cited in APA format]

APPENDICES
A. Source Code (if applicable)
B. User Manual
C. Additional Documentation
`,
    }

    const generatedContent =
      templates[documentType as keyof typeof templates] ||
      `Generated content for ${documentType}:\n\n${prompt}\n\nThis is AI-generated content based on your requirements.`

    onContentUpdate(generatedContent)
    setIsGenerating(false)
  }

  const applySuggestion = (suggestion: AISuggestion) => {
    onSuggestionApply(suggestion)
    // Remove applied suggestion from the list
    if (analysis) {
      setAnalysis({
        ...analysis,
        suggestions: analysis.suggestions.filter((s) => s.id !== suggestion.id),
      })
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-500"
    if (confidence >= 75) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) return "high"
    if (confidence >= 75) return "medium"
    return "low"
  }

  return (
    <div className="space-y-6">
      {/* AI Assistant Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <CardTitle>AI Document Assistant</CardTitle>
          </div>
          <CardDescription>
            Get intelligent suggestions and automated content generation for your documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button
              onClick={analyzeDocument}
              disabled={isAnalyzing || !currentContent.trim()}
              className="flex items-center space-x-2"
            >
              {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
              <span>{isAnalyzing ? "Analyzing..." : "Analyze Document"}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => generateContent("Generate comprehensive content")}
              disabled={isGenerating}
              className="flex items-center space-x-2"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              <span>{isGenerating ? "Generating..." : "Generate Template"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
            <TabsTrigger value="analysis">Document Analysis</TabsTrigger>
            <TabsTrigger value="checklist">Completeness Check</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4">
            {analysis.suggestions.length > 0 ? (
              analysis.suggestions.map((suggestion) => (
                <Card key={suggestion.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <CardTitle className="text-base">{suggestion.title}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{suggestion.category}</Badge>
                        <Badge variant={getConfidenceBadge(suggestion.confidence) === "high" ? "default" : "secondary"}>
                          {suggestion.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{suggestion.suggestion}</p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => applySuggestion(suggestion)}
                        className="flex items-center space-x-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        <span>Apply Suggestion</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No suggestions available. Click "Analyze Document" to get AI-powered recommendations.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Word Count</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.wordCount}</div>
                  <p className="text-xs text-gray-500">words</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Readability Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.readabilityScore}/100</div>
                  <Progress value={analysis.readabilityScore} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Completeness</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analysis.completeness}%</div>
                  <Progress value={analysis.completeness} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="checklist" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Missing Elements</CardTitle>
                <CardDescription>
                  Important sections or information that should be included in your document
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysis.missingElements.length > 0 ? (
                  <div className="space-y-2">
                    {analysis.missingElements.map((element, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">{element}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">All required elements are present!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
