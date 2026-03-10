# TypeScript SDK - API Governance Service

Auto-generated TypeScript client for API Governance Service using `openapi-typescript-codegen`.

## Installation

The SDK is already included in this project. No additional installation needed.

## Quick Start

### 1. Configure Base URL

```typescript
import { OpenAPI } from '@/lib/api-client'

// Set base URL (default: http://localhost:5001)
OpenAPI.BASE = process.env.NEXT_PUBLIC_API_GOVERNANCE_URL || 'http://localhost:5001'

// Optional: Set Bearer token for authentication
OpenAPI.TOKEN = 'your-jwt-token-here'

// Optional: Include credentials (cookies)
OpenAPI.WITH_CREDENTIALS = true
OpenAPI.CREDENTIALS = 'include'
```

### 2. Use Services

```typescript
import { GeographicService, OtpService, ApiCatalogService } from '@/lib/api-client'

// Example 1: Get all provinces
const provinces = await GeographicService.getProvinces()
console.log(provinces.data) // Array<Province>

// Example 2: Get districts by province
const districts = await GeographicService.getDistrictsByProvince('10') // Bangkok
console.log(districts.data) // Array<District>

// Example 3: Send OTP
await OtpService.sendOtp({
  email: 'user@example.com',
  purpose: 'registration'
})

// Example 4: Verify OTP
const result = await OtpService.verifyOtp({
  email: 'user@example.com',
  otp_code: '123456'
})

// Example 5: Get API catalog
const services = await ApiCatalogService.getApiServices()
console.log(services.data) // Array<APIService>
```

## Available Services

### 1. GeographicService
- `getProvinces()` - Get all provinces
- `getDistrictsByProvince(code)` - Get districts by province code
- `getSubdistrictsByDistrict(code)` - Get subdistricts by district code
- `searchByPostalCode(postalCode)` - Search location by postal code

### 2. OccupationsService
- `getOccupations()` - Get all occupations (TISCO classification)

### 3. OtpService
- `sendOtp(request)` - Send OTP to email
- `verifyOtp(request)` - Verify OTP code

### 4. ProfilesService
- `getProfile(identityId)` - Get user profile by Kratos identity ID

### 5. ApiCatalogService
- `getApiServices(categoryId?, providerId?, status?, page?, limit?)` - Get API services (filterable)
- `getApiServiceBySlug(slug)` - Get single API service by slug
- `getApiServiceById(id)` - Get single API service by ID

### 6. ApiCategoriesService
- `getApiCategories()` - Get all API categories

### 7. ApiProvidersService
- `getApiProviders()` - Get all API providers
- `getApiProviderById(id)` - Get single API provider by ID

### 8. HealthService
- `healthCheck()` - Health check endpoint
- `getHealthLive()` - Liveness probe
- `getHealthReady()` - Readiness probe

## TypeScript Types

All request/response types are auto-generated:

```typescript
import type {
  Province,
  District,
  Subdistrict,
  Occupation,
  APIService,
  APICategory,
  APIProvider,
  SendOTPRequest,
  VerifyOTPRequest,
  ErrorResponse
} from '@/lib/api-client'
```

## Error Handling

```typescript
import { ApiError } from '@/lib/api-client'

try {
  const result = await OtpService.sendOtp({
    email: 'invalid-email',
    purpose: 'registration'
  })
} catch (error) {
  if (error instanceof ApiError) {
    console.error('Status:', error.status)
    console.error('Message:', error.message)
    console.error('Body:', error.body)
  }
}
```

## Usage in React Components

### Example 1: Province Selector

```typescript
'use client'

import { useState, useEffect } from 'react'
import { GeographicService, type Province } from '@/lib/api-client'

export default function ProvinceSelector() {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    GeographicService.getProvinces()
      .then(res => {
        setProvinces(res.data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <select>
      {provinces.map(p => (
        <option key={p.code} value={p.code}>
          {p.name_th}
        </option>
      ))}
    </select>
  )
}
```

### Example 2: API Catalog

```typescript
'use client'

import { useState, useEffect } from 'react'
import { ApiCatalogService, type APIService } from '@/lib/api-client'

export default function ApiCatalog() {
  const [services, setServices] = useState<APIService[]>([])

  useEffect(() => {
    ApiCatalogService.getApiServices(
      undefined, // categoryId
      undefined, // providerId
      'published', // status
      1, // page
      10 // limit
    ).then(res => setServices(res.data || []))
  }, [])

  return (
    <div>
      {services.map(service => (
        <div key={service.id}>
          <h3>{service.name}</h3>
          <p>{service.description}</p>
          <span>{service.status}</span>
        </div>
      ))}
    </div>
  )
}
```

### Example 3: OTP Verification

```typescript
'use client'

import { useState } from 'react'
import { OtpService } from '@/lib/api-client'

export default function OTPForm() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'send' | 'verify'>('send')

  const handleSendOTP = async () => {
    try {
      await OtpService.sendOtp({
        email,
        purpose: 'registration'
      })
      setStep('verify')
      alert('OTP sent to your email')
    } catch (error) {
      alert('Failed to send OTP')
    }
  }

  const handleVerifyOTP = async () => {
    try {
      const result = await OtpService.verifyOtp({
        email,
        otp_code: otp
      })
      if (result.valid) {
        alert('OTP verified successfully!')
      }
    } catch (error) {
      alert('Invalid OTP')
    }
  }

  if (step === 'send') {
    return (
      <div>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter email"
        />
        <button onClick={handleSendOTP}>Send OTP</button>
      </div>
    )
  }

  return (
    <div>
      <input
        type="text"
        value={otp}
        onChange={e => setOtp(e.target.value)}
        placeholder="Enter OTP"
      />
      <button onClick={handleVerifyOTP}>Verify OTP</button>
    </div>
  )
}
```

## Server-Side Usage (Next.js App Router)

```typescript
// app/api/provinces/route.ts
import { GeographicService, OpenAPI } from '@/lib/api-client'
import { NextResponse } from 'next/server'

// Configure for server-side
OpenAPI.BASE = process.env.API_GOVERNANCE_URL || 'http://localhost:5001'

export async function GET() {
  try {
    const provinces = await GeographicService.getProvinces()
    return NextResponse.json(provinces)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch provinces' }, { status: 500 })
  }
}
```

## Configuration Options

```typescript
import { OpenAPI } from '@/lib/api-client'

// Base URL (required)
OpenAPI.BASE = 'https://hub.gdldevserv.com/api/governance'

// Version (read-only)
console.log(OpenAPI.VERSION) // '1.0.0'

// Authentication
OpenAPI.TOKEN = async () => {
  // Dynamic token retrieval
  const session = await getSession()
  return session.access_token
}

// Or static token
OpenAPI.TOKEN = 'your-bearer-token'

// Credentials
OpenAPI.WITH_CREDENTIALS = true
OpenAPI.CREDENTIALS = 'include' // or 'omit' | 'same-origin'

// Custom headers
OpenAPI.HEADERS = {
  'X-Custom-Header': 'value'
}

// Or dynamic headers
OpenAPI.HEADERS = async () => {
  return {
    'X-Request-ID': generateRequestId()
  }
}
```

## Regenerating SDK

When the OpenAPI spec changes:

```bash
cd frontend
npx openapi-typescript-codegen \
  --input ../backend/services/api-governance-service/api/openapi.yaml \
  --output ./src/lib/api-client \
  --client axios
```

Or use the running service:

```bash
npx openapi-typescript-codegen \
  --input http://localhost:5001/api-docs/openapi.yaml \
  --output ./src/lib/api-client \
  --client axios
```

## Notes

- All files are auto-generated - DO NOT edit manually
- Types are inferred from OpenAPI spec
- Full TypeScript support with autocomplete
- Cancellable promises for all requests
- Axios-based HTTP client

## References

- OpenAPI Spec: [http://localhost:5001/api-docs/openapi.yaml](http://localhost:5001/api-docs/openapi.yaml)
- Scalar UI: [http://localhost:5001/api-docs](http://localhost:5001/api-docs)
- Platform Admin: [http://localhost:3000/platform-admin/api-docs](http://localhost:3000/platform-admin/api-docs)
