# Custom Hooks Guide

## useOnce Hook

### Problem
React Strict Mode (enabled in `next.config.mjs`) causes `useEffect` to run **twice** in development mode. This leads to:
- Duplicate API calls
- Double initialization
- Wasted network requests
- Race conditions

### Solution
Use `useOnce` or `useOnceAsync` hooks to ensure effects run only once, even in Strict Mode.

---

## Usage

### Basic Example (Sync Effect)

```typescript
import { useOnce } from '@/hooks/useOnce';

function MyComponent() {
  useOnce(() => {
    console.log('This runs only once, not twice');
    // Initialize something
  });

  return <div>Content</div>;
}
```

### API Call Example (Async Effect)

```typescript
import { useOnceAsync } from '@/hooks/useOnce';
import { useState } from 'react';

function UserProfile() {
  const [user, setUser] = useState(null);

  useOnceAsync(async () => {
    const response = await fetch('/api/account/profile');
    const data = await response.json();
    setUser(data);
  });

  return <div>{user?.name}</div>;
}
```

### With Dependencies

```typescript
import { useOnceAsync } from '@/hooks/useOnce';

function UserDetails({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);

  // Runs once when userId changes
  useOnceAsync(async () => {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json();
    setUser(data);
  }, [userId]); // Re-run when userId changes

  return <div>{user?.name}</div>;
}
```

### With Cleanup

```typescript
import { useOnce } from '@/hooks/useOnce';

function WebSocketComponent() {
  useOnce(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onmessage = (event) => {
      console.log('Message:', event.data);
    };

    // Cleanup function
    return () => {
      ws.close();
    };
  });

  return <div>WebSocket connected</div>;
}
```

---

## When to Use

### [RECOMMENDED] Use `useOnce` when:
- Making API calls on component mount
- Initializing third-party libraries
- Setting up event listeners
- Running analytics tracking
- Fetching data that shouldn't be refetched
- Any side effect that should run exactly once

### [NOT RECOMMENDED] Don't use `useOnce` when:
- You need the effect to re-run on dependency changes (use regular `useEffect`)
- You're handling user interactions (use event handlers)
- You need the double-run for testing (keep regular `useEffect`)

---

## Comparison

### Before (useEffect - runs twice)
```typescript
import { useEffect, useState, useRef } from 'react';

function BadExample() {
  const hasCalledAPI = useRef(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Manual guard to prevent double call
    if (hasCalledAPI.current) return;
    hasCalledAPI.current = true;

    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);

  return <div>{data}</div>;
}
```

### After (useOnceAsync - runs once)
```typescript
import { useOnceAsync } from '@/hooks/useOnce';
import { useState } from 'react';

function GoodExample() {
  const [data, setData] = useState(null);

  useOnceAsync(async () => {
    const response = await fetch('/api/data');
    const data = await response.json();
    setData(data);
  });

  return <div>{data}</div>;
}
```

---

## Implementation Details

### How it works:
1. Uses `useRef` to track if effect has run
2. Checks ref before executing effect
3. Marks as run after first execution
4. Skips subsequent runs (including Strict Mode double-run)

### Type Safety:
```typescript
// Sync effect
useOnce(effect: () => void | (() => void), deps?: DependencyList)

// Async effect
useOnceAsync(effect: () => Promise<void | (() => void)>, deps?: DependencyList)
```

---

## Migration Guide

### Step 1: Import the hook
```typescript
import { useOnce, useOnceAsync } from '@/hooks/useOnce';
```

### Step 2: Replace useEffect with useOnce/useOnceAsync
```typescript
// Old
useEffect(() => {
  fetchData();
}, []);

// New
useOnceAsync(async () => {
  await fetchData();
});
```

### Step 3: Remove manual guards
```typescript
// Old
const hasRun = useRef(false);
useEffect(() => {
  if (hasRun.current) return;
  hasRun.current = true;
  fetchData();
}, []);

// New
useOnceAsync(async () => {
  await fetchData();
});
```

---

## Common Patterns

### 1. OAuth Callback (CRITICAL - prevent double token exchange)
```typescript
// frontend/src/app/auth/callback/page.tsx
useOnceAsync(async () => {
  const code = searchParams.get('code');
  const response = await fetch('/api/auth/token', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
  // Handle response...
});
```

### 2. Profile Loading
```typescript
// frontend/src/app/account/profile/page.tsx
useOnceAsync(async () => {
  const response = await fetch('/api/account/profile');
  const data = await response.json();
  setProfile(data);
});
```

### 3. Settings Page
```typescript
// frontend/src/app/platform-admin/settings/page.tsx
useOnceAsync(async () => {
  const [profile, settings] = await Promise.all([
    fetch('/api/account/profile').then(r => r.json()),
    fetch('/api/account/settings').then(r => r.json()),
  ]);
  setProfile(profile);
  setSettings(settings);
});
```

---

## Debugging

### Enable logs to verify single execution:
```typescript
useOnceAsync(async () => {
  console.log('[DEBUG] This should appear only once');
  const data = await fetchData();
  console.log('[DEBUG] Data loaded:', data);
});
```

### Check React DevTools:
- Open React DevTools
- Look for component re-renders
- Verify effect runs only once even during re-renders

---

## Related Files
- Hook implementation: `frontend/src/hooks/useOnce.ts`
- Usage example: `frontend/src/app/auth/callback/page.tsx`
- Next.js config: `frontend/next.config.mjs` (reactStrictMode: true)

---

## FAQ

**Q: Why not just disable Strict Mode?**
A: Strict Mode helps catch bugs. Better to fix the code than disable safety features.

**Q: Does this work in production?**
A: Yes! Though Strict Mode only runs in development, the hook works in both environments.

**Q: Can I use this with external libraries?**
A: Yes! Perfect for initializing analytics, monitoring tools, etc.

**Q: What about AbortController for cleanup?**
A: You can still use AbortController in the effect and return cleanup:
```typescript
useOnceAsync(async () => {
  const controller = new AbortController();
  await fetch('/api/data', { signal: controller.signal });

  return () => controller.abort();
});
```

---

Last updated: 2025-12-21
