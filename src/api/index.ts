import { Hono } from 'hono'
import authRoutes from '../api/auth'
import partnersRoutes from '../api/partners'
import visitsRoutes from '../api/visits'
import crvRoutes from '../api/crv'
import actionsRoutes from '../api/actions'
import incidentsRoutes from '../api/incidents'
import dashboardRoutes from '../api/dashboard'
import organisationsRoutes from '../api/organisations'
import territoriesRoutes from '../api/territories'

const app = new Hono()

// Routes API Auth
app.route('/auth', authRoutes)

// Routes API Partners
app.route('/partners', partnersRoutes)

// Routes API Organisation
app.route('/organisations', organisationsRoutes)

// Routes API Territories
app.route('/territories', territoriesRoutes)

// Routes API Visits
app.route('/visits', visitsRoutes)

// Routes API CRV
app.route('/crv', crvRoutes)

// Routes API Actions
app.route('/actions', actionsRoutes)

// Routes API Incidents
app.route('/incidents', incidentsRoutes)

// Routes API Dashboard
app.route('/dashboard', dashboardRoutes)

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.ENVIRONMENT || 'development',
  })
})

// KPIs Dashboard
app.get('/dashboard/kpis', (c) => {
  return c.json({
    success: true,
    data: {
      visits_planned: 150,
      visits_completed: 120,
      visits_missed: 5,
      completion_rate: 0.80,
      crvs_submitted: 110,
      crvs_pending: 10,
      actions_open: 45,
      actions_completed: 180,
      incidents_open: 8,
      sla_compliance: 0.92
    }
  })
})

export default app
