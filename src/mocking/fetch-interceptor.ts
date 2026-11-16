type MockResponse = {
  status?: number
  statusText?: string
  body?: any
  headers?: Record<string, string>
  delay?: number
}

type MockHandler = MockResponse | MockResponse[] | ((request: Request) => MockResponse | Promise<MockResponse>)

const mockMap = new Map<string, MockHandler>()
let originalFetch: typeof fetch | null = null
let isMocking = false

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url, window.location.origin)
    return u.pathname + u.search
  } catch {
    return url
  }
}

function matchUrl(pattern: string, requestUrl: string): boolean {
  const normalizedPattern = normalizeUrl(pattern)
  const normalizedRequest = normalizeUrl(requestUrl)
  
  if (normalizedPattern === normalizedRequest) return true
  
  if (pattern.endsWith('*')) {
    const prefix = pattern.slice(0, -1)
    return normalizedRequest.startsWith(normalizeUrl(prefix))
  }
  
  if (pattern.includes(':')) {
    const regexPattern = pattern.replace(/:([^/]+)/g, '([^/]+)')
    const regex = new RegExp(`^${regexPattern}$`)
    return regex.test(normalizedRequest)
  }
  
  return false
}

async function createMockResponse(mock: MockResponse): Promise<Response> {
  const { status = 200, statusText = 'OK', body, headers = {}, delay = 0 } = mock
  
  if (delay > 0) {
    await new Promise(r => setTimeout(r, delay))
  }
  
  const responseHeaders = new Headers({
    'Content-Type': 'application/json',
    ...headers,
  })
  
  return new Response(JSON.stringify(body), {
    status,
    statusText,
    headers: responseHeaders,
  })
}

function isMockResponse(handler: MockHandler): handler is MockResponse {
  return !Array.isArray(handler) && typeof handler !== 'function'
}

export function mockFetch(config: Record<string, MockHandler>): void {
  if (!isMocking) {
    originalFetch = window.fetch.bind(window)
    isMocking = true
  }
  
  mockMap.clear()
  
  for (const [url, responses] of Object.entries(config)) {
    mockMap.set(url, responses)
  }
  
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = input instanceof Request ? input : new Request(input, init)
    const url = request.url
    
    for (const [pattern, handler] of mockMap.entries()) {
      if (matchUrl(pattern, url)) {
        let response: MockResponse | undefined
        
        if (Array.isArray(handler)) {
          // handler is MockResponse[], take the first one if available and it's a MockResponse
          if (handler.length > 0) {
            const first = handler[0]
            if (typeof first === 'object' && !Array.isArray(first) && 'status' in first) {
              response = first as MockResponse
            }
          }
        } else if (typeof handler === 'function') {
          response = await handler(request)
        } else if (isMockResponse(handler)) {
          // handler is a single MockResponse
          response = handler as MockResponse
        }
        
        if (response) {
          return createMockResponse(response)
        }
      }
    }
    
    if (originalFetch) {
      return originalFetch(input, init)
    }
    throw new Error(`No mock found for ${url} and original fetch not available`)
  }
}

export function mockFetchOnce(config: Record<string, MockHandler>): void {
  if (!isMocking) {
    originalFetch = window.fetch.bind(window)
    isMocking = true
  }
  
  for (const [url, handler] of Object.entries(config)) {
    const existing = mockMap.get(url)
    if (existing) {
      if (Array.isArray(existing)) {
        // existing is MockResponse[], add handler to the end
        const existingArr = existing as MockResponse[]
        mockMap.set(url, [...existingArr, handler] as MockHandler)
      } else {
        // existing is a single MockResponse, create array with both
        const existingSingle = existing as MockResponse
        mockMap.set(url, [existingSingle, handler] as MockHandler)
      }
    } else {
      mockMap.set(url, handler)
    }
  }
}

export function unmockFetch(): void {
  if (originalFetch) {
    window.fetch = originalFetch
    originalFetch = null
  }
  mockMap.clear()
  isMocking = false
}

export const fetchMock = {
  mock: mockFetch,
  mockOnce: mockFetchOnce,
  unmock: unmockFetch,
  getCalls: () => [],
}