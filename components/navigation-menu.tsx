"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, BookOpen, Bot, Scan, FileText, GraduationCap, Settings, ChevronDown, Sparkles } from "lucide-react"

export default function NavigationMenu() {
  const pathname = usePathname()
  const [isToolsOpen, setIsToolsOpen] = useState(false)

  const navigationItems = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: GraduationCap },
    { href: "/library", label: "Library", icon: BookOpen },
  ]

  const aiToolsItems = [
    { href: "/ai-tools", label: "AI Tools Overview", icon: Sparkles },
    { href: "/ai-tools?tab=ai-assistant", label: "AI Assistant", icon: Bot },
    { href: "/ai-tools?tab=ocr-scanner", label: "OCR Scanner", icon: Scan },
    { href: "/ai-tools?tab=pdf-tools", label: "PDF Tools", icon: FileText },
  ]

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/home" className="flex items-center">
            <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
            <span className="text-xl font-bold text-gray-900">AMS</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}

            {/* AI Tools Dropdown */}
            <DropdownMenu open={isToolsOpen} onOpenChange={setIsToolsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={pathname.startsWith("/ai-tools") ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Bot className="h-4 w-4" />
                  <span>AI Tools</span>
                  <Badge
                    variant="secondary"
                    className="ml-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700"
                  >
                    New
                  </Badge>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {aiToolsItems.map((item, index) => (
                  <div key={item.href}>
                    <DropdownMenuItem asChild>
                      <Link href={item.href} className="flex items-center w-full">
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.label}</span>
                        {index === 0 && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            New
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    {index === 0 && <DropdownMenuSeparator />}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {navigationItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center w-full">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {aiToolsItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center w-full">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
