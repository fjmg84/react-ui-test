// Provider configuration for react-ui-test
// Detects hooks used in components and maps them to required providers
// For MVP: uses simple file scanning with fallback to BrowserRouter

// Mapa de hooks integrados -> providers conocidos  
// null significa que el hook no necesita provider externo
const BUILTIN_PROVIDERS: Record<string, { import: string; from: string } | null> = {
  'useNavigate': { import: 'BrowserRouter', from: 'react-router-dom' },
  'useLocation': { import: 'BrowserRouter', from: 'react-router-dom' },
  'useParams': { import: 'BrowserRouter', from: 'react-router-dom' },
  'useSearchParams': { import: 'BrowserRouter', from: 'react-router-dom' },
  'useQuery': { import: 'QueryClientProvider', from: '@tanstack/react-query' },
  'useMutation': { import: 'QueryClientProvider', from: '@tanstack/react-query' },
  'useQueryClient': { import: 'QueryClientProvider', from: '@tanstack/react-query' },
  // Hooks que no necesitan provider external
  'useState': null,
  'useEffect': null,
  'useReducer': null,
  'useRef': null,
  'useContext': null,
  'useCallback': null,
  'useMemo': null,
}

// Providers configurados por el usuario
// Cada entrada: { import, from, props? }
let userProviderMap: Record<string, { import: string; from: string; props?: any }> = {}

// Configurar providers definidos por el usuario
export function configureProviders(map: Record<string, { import: string; from: string; props?: any }>): void {
  userProviderMap = map
}

// Escanear hooks en un archivo de componente
// Usa regex simple para encontrar imports de hooks
export function scanHooks(componentFile: string): string[] {
  const hooks: string[] = []
  
  try {
    const fs = require('fs')
    const path = require('path')
    const content = fs.readFileSync(path.resolve(componentFile), 'utf-8')
    
    // Buscar imports nombrados que empiecen con use
    const importMatches = content.match(/import\s+[\s\S]*?from\s['"][^'"]+['"]/g) || []
    
    importMatches.forEach((imp: any) => {
      // Extraer nombres importados
      const namedMatches = imp.match(/[\w]+/g) || []
      namedMatches.forEach((name: any) => {
        if (name.startsWith('use')) {
          const hookName = name.replace('use', '')
          // Verificar si está en el mapabuiltin o configurado por el usuario
          if ((BUILTIN_PROVIDERS[hookName] || userProviderMap[hookName]) && !hooks.includes(hookName)) {
            hooks.push(hookName)
          }
        }
      })
    })
    
    // También buscar llamadas use* en el componente
    const useCallMatches = content.match(/use\w+\s*\(/g) || []
    useCallMatches.forEach((match: any) => {
      const hookName = match.replace('use', '').replace('(', '')
      if ((BUILTIN_PROVIDERS[hookName] || userProviderMap[hookName]) && !hooks.includes(hookName)) {
        hooks.push(hookName)
      }
    })
    
  } catch {
    // Si no puede leer el archivo, retornar vacío
  }
  
  return hooks
}

// Resolver providers para un componente determinado
// Retorna array de { import, from } para los providers necesarios
export function resolveProviders(componentFile: string): { import: string; from: string }[] {
  const detectedHooks = scanHooks(componentFile)
  const configs: { import: string; from: string }[] = []
  
  // Primero: providers del usuario (tienen prioridad)
  for (const hook of detectedHooks) {
    const userConfig = userProviderMap[hook]
    if (userConfig) {
      configs.push(userConfig)
    } else if (BUILTIN_PROVIDERS[hook] && BUILTIN_PROVIDERS[hook]?.import) {
      configs.push(BUILTIN_PROVIDERS[hook]!)
    }
  }
  
  // Si no se detectaron hooks que requieren providers,
  // usar BrowserRouter por defecto para que los tests funcionen
  if (configs.length === 0) {
    configs.push({ import: 'BrowserRouter', from: 'react-router-dom' })
  }
  
  return configs
}