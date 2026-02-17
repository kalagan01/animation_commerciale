// API Push Notifications
// src/routes/push-notifications.ts

import { Hono } from 'hono';
import type { Context } from 'hono';

const app = new Hono();

// Types
interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  user_agent?: string;
  created_at: string;
  last_used?: string;
  status: 'active' | 'expired' | 'disabled';
}

interface NotificationPayload {
  title: string;
  body: string;
  type?: string;
  icon?: string;
  badge?: string;
  url?: string;
  actionData?: any;
  vibrate?: number[];
  requireInteraction?: boolean;
  tag?: string;
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

// POST /api/v1/push/subscribe
// Enregistrer nouvelle subscription push
app.post('/subscribe', async (c: Context) => {
  try {
    const { user_id, subscription, user_agent } = await c.req.json();
    const { env } = c;

    if (!subscription || !subscription.endpoint) {
      return c.json({ error: 'Subscription invalide' }, 400);
    }

    // Vérifier si subscription existe déjà
    const existing = await env.DB.prepare(`
      SELECT id FROM push_subscriptions 
      WHERE user_id = ? AND endpoint = ?
    `).bind(user_id, subscription.endpoint).first();

    if (existing) {
      // Mettre à jour
      await env.DB.prepare(`
        UPDATE push_subscriptions 
        SET keys = ?, user_agent = ?, status = 'active', last_used = ?
        WHERE id = ?
      `).bind(
        JSON.stringify(subscription.keys),
        user_agent || null,
        new Date().toISOString(),
        existing.id
      ).run();

      return c.json({ 
        success: true, 
        subscription_id: existing.id,
        message: 'Subscription mise à jour'
      });
    }

    // Créer nouvelle subscription
    const id = crypto.randomUUID();
    await env.DB.prepare(`
      INSERT INTO push_subscriptions 
      (id, user_id, endpoint, keys, user_agent, created_at, status)
      VALUES (?, ?, ?, ?, ?, ?, 'active')
    `).bind(
      id,
      user_id,
      subscription.endpoint,
      JSON.stringify(subscription.keys),
      user_agent || null,
      new Date().toISOString()
    ).run();

    console.log('[Push] Nouvelle subscription enregistrée:', id);

    return c.json({ 
      success: true, 
      subscription_id: id,
      message: 'Subscription créée avec succès'
    });

  } catch (error) {
    console.error('[Push] Erreur subscribe:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// DELETE /api/v1/push/unsubscribe
// Désactiver subscription
app.delete('/unsubscribe', async (c: Context) => {
  try {
    const { user_id, endpoint } = await c.req.json();
    const { env } = c;

    await env.DB.prepare(`
      UPDATE push_subscriptions 
      SET status = 'disabled', last_used = ?
      WHERE user_id = ? AND endpoint = ?
    `).bind(
      new Date().toISOString(),
      user_id,
      endpoint
    ).run();

    console.log('[Push] Subscription désactivée:', user_id, endpoint);

    return c.json({ success: true, message: 'Désabonnement réussi' });

  } catch (error) {
    console.error('[Push] Erreur unsubscribe:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// GET /api/v1/push/subscriptions/:userId
// Récupérer subscriptions utilisateur
app.get('/subscriptions/:userId', async (c: Context) => {
  try {
    const { userId } = c.req.param();
    const { env } = c;

    const results = await env.DB.prepare(`
      SELECT id, endpoint, user_agent, created_at, last_used, status
      FROM push_subscriptions 
      WHERE user_id = ? AND status = 'active'
      ORDER BY created_at DESC
    `).bind(userId).all();

    return c.json({
      subscriptions: results.results || [],
      count: results.results?.length || 0
    });

  } catch (error) {
    console.error('[Push] Erreur get subscriptions:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// ============================================================================
// SEND NOTIFICATIONS
// ============================================================================

// POST /api/v1/push/send
// Envoyer notification à un utilisateur
app.post('/send', async (c: Context) => {
  try {
    const { user_id, notification } = await c.req.json();
    const { env } = c;

    if (!user_id || !notification) {
      return c.json({ error: 'Paramètres manquants' }, 400);
    }

    // Récupérer subscriptions actives de l'utilisateur
    const subscriptions = await env.DB.prepare(`
      SELECT id, endpoint, keys 
      FROM push_subscriptions 
      WHERE user_id = ? AND status = 'active'
    `).bind(user_id).all();

    if (!subscriptions.results || subscriptions.results.length === 0) {
      return c.json({ 
        success: false, 
        message: 'Aucune subscription active trouvée',
        sent: 0
      });
    }

    // Envoyer à toutes les subscriptions
    const sendResults = await Promise.allSettled(
      subscriptions.results.map(async (sub: any) => {
        return sendPushNotification(
          sub.endpoint,
          JSON.parse(sub.keys),
          notification,
          env
        );
      })
    );

    const successCount = sendResults.filter(r => r.status === 'fulfilled').length;
    const failedCount = sendResults.filter(r => r.status === 'rejected').length;

    // Nettoyer les subscriptions expirées
    if (failedCount > 0) {
      await cleanupExpiredSubscriptions(user_id, env);
    }

    console.log(`[Push] Notifications envoyées: ${successCount}/${subscriptions.results.length}`);

    return c.json({ 
      success: true, 
      sent: successCount,
      failed: failedCount,
      total: subscriptions.results.length
    });

  } catch (error) {
    console.error('[Push] Erreur send:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// POST /api/v1/push/broadcast
// Broadcast notification à plusieurs utilisateurs
app.post('/broadcast', async (c: Context) => {
  try {
    const { user_ids, notification, filters } = await c.req.json();
    const { env } = c;

    let query = `
      SELECT DISTINCT user_id, endpoint, keys 
      FROM push_subscriptions 
      WHERE status = 'active'
    `;
    const bindings: any[] = [];

    if (user_ids && user_ids.length > 0) {
      query += ` AND user_id IN (${user_ids.map(() => '?').join(',')})`;
      bindings.push(...user_ids);
    }

    // Filtres additionnels
    if (filters?.role) {
      query += ` AND user_id IN (SELECT id FROM users WHERE role = ?)`;
      bindings.push(filters.role);
    }

    if (filters?.territory_id) {
      query += ` AND user_id IN (SELECT id FROM users WHERE territory_id = ?)`;
      bindings.push(filters.territory_id);
    }

    const subscriptions = await env.DB.prepare(query).bind(...bindings).all();

    if (!subscriptions.results || subscriptions.results.length === 0) {
      return c.json({ 
        success: false, 
        message: 'Aucune subscription trouvée',
        sent: 0
      });
    }

    // Envoyer en batch
    const sendResults = await Promise.allSettled(
      subscriptions.results.map(async (sub: any) => {
        return sendPushNotification(
          sub.endpoint,
          JSON.parse(sub.keys),
          notification,
          env
        );
      })
    );

    const successCount = sendResults.filter(r => r.status === 'fulfilled').length;

    console.log(`[Push] Broadcast envoyé: ${successCount}/${subscriptions.results.length}`);

    return c.json({ 
      success: true, 
      sent: successCount,
      total: subscriptions.results.length
    });

  } catch (error) {
    console.error('[Push] Erreur broadcast:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// ============================================================================
// NOTIFICATION TEMPLATES
// ============================================================================

// POST /api/v1/push/send/gamification-points
// Shortcut pour notification points gagnés
app.post('/send/gamification-points', async (c: Context) => {
  const { user_id, points, action } = await c.req.json();

  const actionLabels: Record<string, string> = {
    visit_completed: 'Visite complétée',
    crv_submitted: 'CRV soumis',
    sale_closed: 'Vente conclue',
    action_completed: 'Action terrain'
  };

  const notification: NotificationPayload = {
    title: `+${points} points ! 🎯`,
    body: actionLabels[action] || action,
    type: 'gamification-points',
    icon: '/static/icons/icon-192x192.png',
    badge: '/static/icons/badge-96x96.png',
    url: '/static/gamification.html',
    tag: 'gamification-points',
    requireInteraction: false
  };

  return sendNotificationWrapper(c, user_id, notification);
});

// POST /api/v1/push/send/gamification-badge
// Notification nouveau badge
app.post('/send/gamification-badge', async (c: Context) => {
  const { user_id, badge } = await c.req.json();

  const notification: NotificationPayload = {
    title: `Nouveau Badge Débloqué ! ${badge.icon}`,
    body: `${badge.name} - ${badge.rarity}`,
    type: 'gamification-badge',
    icon: '/static/icons/icon-192x192.png',
    badge: '/static/icons/badge-96x96.png',
    url: '/static/gamification.html#badges',
    actionData: { badgeId: badge.id },
    tag: `badge-${badge.id}`,
    vibrate: [300, 100, 300, 100, 300],
    requireInteraction: true
  };

  return sendNotificationWrapper(c, user_id, notification);
});

// POST /api/v1/push/send/gamification-challenge
// Notification challenge complété
app.post('/send/gamification-challenge', async (c: Context) => {
  const { user_id, challenge } = await c.req.json();

  const notification: NotificationPayload = {
    title: `Challenge Complété ! ${challenge.icon}`,
    body: `${challenge.name} - +${challenge.reward_points} points`,
    type: 'gamification-challenge',
    icon: '/static/icons/icon-192x192.png',
    url: '/static/gamification.html#challenges',
    tag: `challenge-${challenge.id}`,
    requireInteraction: false
  };

  return sendNotificationWrapper(c, user_id, notification);
});

// POST /api/v1/push/send/visit-reminder
// Rappel visite programmée
app.post('/send/visit-reminder', async (c: Context) => {
  const { user_id, visit } = await c.req.json();

  const notification: NotificationPayload = {
    title: `🗓️ Rappel Visite`,
    body: `Visite prévue chez ${visit.partner_name} dans 1 heure`,
    type: 'visit-reminder',
    url: '/static/visits-mobile.html',
    actionData: { visitId: visit.id },
    tag: `visit-reminder-${visit.id}`,
    requireInteraction: true
  };

  return sendNotificationWrapper(c, user_id, notification);
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function sendNotificationWrapper(c: Context, user_id: string, notification: NotificationPayload) {
  try {
    const result = await c.env.DB.prepare(`
      SELECT endpoint, keys 
      FROM push_subscriptions 
      WHERE user_id = ? AND status = 'active'
    `).bind(user_id).all();

    if (!result.results || result.results.length === 0) {
      return c.json({ success: false, message: 'Pas de subscription' });
    }

    const sendResults = await Promise.allSettled(
      result.results.map((sub: any) => 
        sendPushNotification(sub.endpoint, JSON.parse(sub.keys), notification, c.env)
      )
    );

    const successCount = sendResults.filter(r => r.status === 'fulfilled').length;

    return c.json({ success: true, sent: successCount });
  } catch (error) {
    console.error('[Push] Erreur wrapper:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
}

async function sendPushNotification(
  endpoint: string, 
  keys: any, 
  payload: NotificationPayload,
  env: any
): Promise<boolean> {
  try {
    // NOTE: Dans un vrai environnement, il faudrait utiliser web-push
    // avec les VAPID keys. Pour la démo, on simule l'envoi.
    
    // const webpush = require('web-push');
    // webpush.setVapidDetails(
    //   'mailto:contact@neoimpact.ma',
    //   env.VAPID_PUBLIC_KEY,
    //   env.VAPID_PRIVATE_KEY
    // );
    // 
    // await webpush.sendNotification(
    //   { endpoint, keys },
    //   JSON.stringify(payload)
    // );

    console.log('[Push] Notification envoyée:', endpoint.substring(0, 50) + '...');
    return true;

  } catch (error: any) {
    console.error('[Push] Erreur envoi notification:', error);
    
    // Gérer les erreurs 410 (subscription expirée)
    if (error.statusCode === 410) {
      console.log('[Push] Subscription expirée:', endpoint);
      throw new Error('Subscription expired');
    }
    
    throw error;
  }
}

async function cleanupExpiredSubscriptions(user_id: string, env: any) {
  try {
    await env.DB.prepare(`
      UPDATE push_subscriptions 
      SET status = 'expired'
      WHERE user_id = ? AND status = 'active'
    `).bind(user_id).run();
    
    console.log('[Push] Subscriptions expirées nettoyées:', user_id);
  } catch (error) {
    console.error('[Push] Erreur cleanup:', error);
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    service: 'push-notifications',
    timestamp: new Date().toISOString()
  });
});

export default app;
