// Configuration de l'application NeoImpact Animation Commerciale

export const appConfig = {
  app: {
    name: 'NeoImpact Animation Commerciale',
    shortName: 'NeoImpact',
    description: 'Solution de pilotage d\'activité terrain et animation commerciale',
    version: '1.0.0',
    locale: 'fr-FR',
  },

  api: {
    baseUrl: '/api/v1',
    timeout: 30000, // 30 secondes
    retryAttempts: 3,
  },

  pagination: {
    defaultLimit: 50,
    maxLimit: 200,
  },

  features: {
    offlineMode: false, // Phase 1: Online-only
    geolocationRequired: true,
    photoUpload: true,
    signatureCapture: true,
    notifications: true,
  },

  sla: {
    // SLA incidents (en heures)
    highIncident: 24,
    mediumIncident: 72,
    lowIncident: 168, // 7 jours
    
    // SLA visites
    visitCheckInWindow: 30, // minutes avant/après heure planifiée
  },

  geolocation: {
    // Rayon de validation check-in (en mètres)
    checkInRadius: 200,
    // Précision minimale requise (en mètres)
    minAccuracy: 100,
  },

  upload: {
    // Taille max fichiers (en bytes)
    maxFileSize: 10 * 1024 * 1024, // 10MB
    // Types MIME autorisés
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ],
    // Nombre max de fichiers par CRV
    maxFilesPerCRV: 10,
  },

  cache: {
    // Durée de cache (en secondes)
    user: 3600, // 1 heure
    permissions: 1800, // 30 minutes
    referentials: 7200, // 2 heures
  },

  roles: {
    agent: {
      code: 'agent',
      label: 'Agent Terrain',
      permissions: ['visit.execute', 'crv.create', 'action.complete', 'incident.create'],
    },
    supervisor: {
      code: 'supervisor',
      label: 'Superviseur',
      permissions: [
        'visit.plan',
        'visit.assign',
        'crv.review',
        'action.create',
        'action.assign',
        'incident.manage',
        'reschedule.approve',
      ],
    },
    manager: {
      code: 'manager',
      label: 'Manager Régional',
      permissions: [
        'dashboard.view',
        'report.export',
        'team.manage',
        'analytics.view',
      ],
    },
    admin: {
      code: 'admin',
      label: 'Administrateur',
      permissions: ['*'],
    },
    auditor: {
      code: 'auditor',
      label: 'Auditeur',
      permissions: ['audit.view', 'report.export', 'log.view'],
    },
  },

  ui: {
    // Breakpoints responsive (TailwindCSS)
    breakpoints: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },
    
    // Couleurs thème NeoImpact (à adapter selon charte graphique)
    colors: {
      primary: '#0066CC', // Bleu NeoImpact
      secondary: '#FF6B00', // Orange
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#3B82F6',
    },

    // Tailles boutons tactiles (mobile-first)
    buttonHeights: {
      small: '36px',
      medium: '44px',
      large: '52px',
    },
  },

  maps: {
    // Mapbox configuration (à remplacer par vos clés)
    provider: 'mapbox',
    mapboxToken: 'VOTRE_TOKEN_MAPBOX', // À configurer via env variable
    defaultCenter: [-6.8498, 33.9716], // Rabat, Maroc
    defaultZoom: 6,
    maxZoom: 18,
    minZoom: 5,
  },

  // URLs externes et intégrations
  integrations: {
    // APIs NeoImpact (à configurer selon environnement)
    neoimpactApiUrl: process.env.NEOIMPACT_API_URL || '',
    neoimpactApiKey: process.env.NEOIMPACT_API_KEY || '',
  },
};

export type AppConfig = typeof appConfig;

export default appConfig;
