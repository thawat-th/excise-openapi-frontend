'use client'

import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/components/LanguageProvider'

interface Environment {
  url: string
  description: string
}

export default function APIDocsPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { language } = useLanguage()
  const [bearerToken, setBearerToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEnv, setSelectedEnv] = useState<string>('local')
  const [favoriteEndpoints, setFavoriteEndpoints] = useState<string[]>([])

  // Available environments
  const environments: Record<string, Environment> = {
    local: {
      url: 'http://localhost:5001',
      description: language === 'th' ? 'การพัฒนาในเครื่อง' : 'Local Development',
    },
    dev: {
      url: 'https://hub.gdldevserv.com/api/governance',
      description: language === 'th' ? 'เซิร์ฟเวอร์พัฒนา' : 'Development Server',
    },
    uat: {
      url: 'https://uat.excise.go.th/api/governance',
      description: language === 'th' ? 'UAT (ระบบทดสอบ)' : 'UAT Environment',
    },
    production: {
      url: 'https://api.excise.go.th/api/governance',
      description: language === 'th' ? 'Production (ระบบจริง)' : 'Production',
    },
  }

  // Load environment preference from localStorage
  useEffect(() => {
    const savedEnv = localStorage.getItem('scalar-environment')
    if (savedEnv && environments[savedEnv]) {
      setSelectedEnv(savedEnv)
    }

    const savedFavorites = localStorage.getItem('scalar-favorites')
    if (savedFavorites) {
      try {
        setFavoriteEndpoints(JSON.parse(savedFavorites))
      } catch {
        setFavoriteEndpoints([])
      }
    }
  }, [])

  // Save environment preference
  const handleEnvChange = (env: string) => {
    setSelectedEnv(env)
    localStorage.setItem('scalar-environment', env)
  }

  // Toggle favorite endpoint
  const toggleFavorite = (endpoint: string) => {
    const newFavorites = favoriteEndpoints.includes(endpoint)
      ? favoriteEndpoints.filter(e => e !== endpoint)
      : [...favoriteEndpoints, endpoint]

    setFavoriteEndpoints(newFavorites)
    localStorage.setItem('scalar-favorites', JSON.stringify(newFavorites))
  }

  // Fetch Bearer token from session
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/auth/scalar-token')
        if (response.ok) {
          const data = await response.json()
          setBearerToken(data.token)
        } else {
          console.warn('[scalar] No active session, token not available')
          setBearerToken(null)
        }
      } catch (error) {
        console.error('[scalar] Failed to fetch token:', error)
        setBearerToken(null)
      } finally {
        setLoading(false)
      }
    }

    fetchToken()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || loading) return

    // Clear container
    containerRef.current.innerHTML = ''

    // Build authentication config
    const authConfig: any = {
      preferredSecurityScheme: 'BearerAuth',
    }

    // Auto-inject Bearer token if available
    if (bearerToken) {
      authConfig.apiKey = {
        token: bearerToken,
      }
    }

    // Get selected environment
    const currentEnv = environments[selectedEnv] || environments.local

    // Build servers list for environment switching
    const serversList = Object.entries(environments).map(([key, env]) => ({
      url: env.url,
      description: env.description,
    }))

    // Create script element for Scalar
    const script = document.createElement('script')
    script.id = 'api-reference'
    script.setAttribute('data-url', `${currentEnv.url}/api-docs/openapi.yaml`)
    script.setAttribute(
      'data-configuration',
      JSON.stringify({
        theme: 'purple',
        darkMode: true,
        layout: 'modern',
        showSidebar: true,
        searchHotKey: 'k',
        servers: serversList,
        defaultServer: currentEnv.url,
        customCss: `
          :root {
            --scalar-color-1: hsl(var(--primary));
            --scalar-color-2: hsl(var(--accent));
            --scalar-color-3: hsl(var(--muted));
            --scalar-background-1: hsl(var(--background));
            --scalar-background-2: hsl(var(--card));
            --scalar-background-3: hsl(var(--muted));
            --scalar-border-color: hsl(var(--border));
          }
          .dark-mode {
            --scalar-background-1: hsl(var(--background));
            --scalar-background-2: hsl(var(--card));
          }
        `,
        authentication: authConfig,
      })
    )

    containerRef.current.appendChild(script)

    // Load Scalar library
    const scalarScript = document.createElement('script')
    scalarScript.src = 'https://cdn.jsdelivr.net/npm/@scalar/api-reference'
    scalarScript.async = true
    document.body.appendChild(scalarScript)

    return () => {
      // Cleanup
      if (scalarScript.parentNode) {
        scalarScript.parentNode.removeChild(scalarScript)
      }
    }
  }, [language, bearerToken, loading, selectedEnv])

  return (
    <div className="flex flex-col h-full w-full">
      {/* Environment Selector */}
      <div className="border-b bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">
              {language === 'th' ? 'Environment:' : 'Environment:'}
            </label>
            <select
              value={selectedEnv}
              onChange={(e) => handleEnvChange(e.target.value)}
              className="px-3 py-1.5 text-sm border rounded-md bg-background"
            >
              {Object.entries(environments).map(([key, env]) => (
                <option key={key} value={key}>
                  {env.description}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-muted-foreground">
            {bearerToken ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {language === 'th' ? 'เข้าสู่ระบบแล้ว' : 'Authenticated'}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                {language === 'th' ? 'ไม่ได้เข้าสู่ระบบ' : 'Not authenticated'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Scalar Container */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-muted-foreground">
              {language === 'th' ? 'กำลังโหลด...' : 'Loading...'}
            </div>
          </div>
        )}
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  )
}
