import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { renderer } from './renderer'

// Types Cloudflare
type Bindings = {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_KEY?: string;
  JWT_SECRET?: string;
  JWT_EXPIRES_IN?: string;
  USE_MOCK_DATA?: string;
}

const app = new Hono<{ Bindings: Bindings }>()

// ============================================================================
// MIDDLEWARE GLOBAUX
// ============================================================================

// Logger pour toutes les requêtes
app.use('*', logger())

// CORS pour API
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 600,
  credentials: true,
}))

// ============================================================================
// ROUTES AUTH (Public)
// ============================================================================

import authRoutes from './routes/auth'
app.route('/api/auth', authRoutes)

// ============================================================================
// ROUTES API V1 - Import centralisé
// ============================================================================

import apiRoutes from './api/index'
app.route('/api/v1', apiRoutes)

// ============================================================================
// ROUTES FRONTEND
// ============================================================================

app.use('*', renderer)

// Page d'accueil
app.get('/', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎯 NeoImpact Animation Commerciale
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Solution de pilotage d'activité terrain et animation commerciale
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="text-lg font-semibold mb-2">Interface Mobile-First</h3>
              <p className="text-gray-600">Optimisée pour usage terrain sur tablettes et smartphones</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="text-lg font-semibold mb-2">Visites & CRV</h3>
              <p className="text-gray-600">Planification, exécution et reporting digitalisés</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold mb-2">Dashboards KPI</h3>
              <p className="text-gray-600">Pilotage multi-niveaux en temps réel</p>
            </div>
          </div>
          
          <div className="mt-12 space-x-4">
            <a 
              href="/static/dashboard.html" 
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Accéder au Dashboard
            </a>
            <a 
              href="/api/v1/health" 
              className="inline-block bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              API Health Check
            </a>
          </div>
          
          <div className="mt-12 p-6 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">📋 Statut du Projet</h3>
            <p className="text-gray-700">
              <strong>Phase 1 - MVP</strong> : 10/12 modules complétés<br/>
              <span className="text-green-600">✅ Infrastructure</span> • 
              <span className="text-green-600">✅ Backend API 100%</span> • 
              <span className="text-green-600">✅ Frontend UI 80%</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})

// Route Components Demo
import { ComponentsDemo } from './pages/ComponentsDemo'
app.get('/components', (c) => {
  return c.html(ComponentsDemo())
})

// Route login (placeholder)
app.get('/login', (c) => {
  return c.render(
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Connexion</h2>
        <p className="text-center text-gray-600 mb-6">
          Authentification SSO Supabase<br/>
          (En cours de configuration)
        </p>
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
          Se connecter avec SSO
        </button>
        <p className="text-center text-sm text-gray-500 mt-4">
          <a href="/" className="text-blue-600 hover:underline">← Retour à l'accueil</a>
        </p>
      </div>
    </div>
  )
})

// Route login.html - Serve complete HTML login page
import { loginPageHTML } from './templates/loginPage'
app.get('/login.html', (c) => {
  return c.html(loginPageHTML)
})

// 404 handler
app.notFound((c) => {
  return c.render(
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Page non trouvée</p>
        <a href="/" className="text-blue-600 hover:underline">Retour à l'accueil</a>
      </div>
    </div>
  )
})

// Error handler
app.onError((err, c) => {
  console.error(`Error: ${err.message}`, err)
  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  }, 500)
})

export default app
