// API Gamification & Leaderboards
// src/routes/gamification.ts

import { Hono } from 'hono';
import type { Context } from 'hono';

const app = new Hono();

// Types
interface UserStats {
  user_id: string;
  total_points: number;
  level: string;
  badges: string[];
  actions: Record<string, number>;
  streak_start: string;
  created_at: string;
  updated_at: string;
}

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  points: number;
  level: string;
  badges_count: number;
  trend: 'up' | 'down' | 'stable';
}

// GET /api/v1/gamification/users/:userId/stats
// Récupérer statistiques utilisateur
app.get('/users/:userId/stats', async (c: Context) => {
  const { userId } = c.req.param();
  const { env } = c;

  try {
    // Récupérer depuis DB
    const result = await env.DB.prepare(`
      SELECT * FROM gamification_stats WHERE user_id = ?
    `).bind(userId).first();

    if (!result) {
      // Créer stats par défaut
      const defaultStats: UserStats = {
        user_id: userId,
        total_points: 0,
        level: 'Bronze',
        badges: [],
        actions: {},
        streak_start: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await env.DB.prepare(`
        INSERT INTO gamification_stats (user_id, total_points, level, badges, actions, streak_start, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        defaultStats.user_id,
        defaultStats.total_points,
        defaultStats.level,
        JSON.stringify(defaultStats.badges),
        JSON.stringify(defaultStats.actions),
        defaultStats.streak_start,
        defaultStats.created_at,
        defaultStats.updated_at
      ).run();

      return c.json(defaultStats);
    }

    // Parser JSON fields
    return c.json({
      ...result,
      badges: JSON.parse(result.badges as string),
      actions: JSON.parse(result.actions as string)
    });

  } catch (error) {
    console.error('[Gamification API] Erreur récupération stats:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// POST /api/v1/gamification/users/:userId/stats
// Mettre à jour statistiques utilisateur
app.post('/users/:userId/stats', async (c: Context) => {
  const { userId } = c.req.param();
  const stats = await c.req.json();
  const { env } = c;

  try {
    await env.DB.prepare(`
      INSERT OR REPLACE INTO gamification_stats 
      (user_id, total_points, level, badges, actions, streak_start, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      stats.total_points,
      stats.level,
      JSON.stringify(stats.badges),
      JSON.stringify(stats.actions),
      stats.streak_start,
      new Date().toISOString()
    ).run();

    return c.json({ success: true });

  } catch (error) {
    console.error('[Gamification API] Erreur sauvegarde stats:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// POST /api/v1/gamification/actions/:action
// Enregistrer une action et calculer points
app.post('/actions/:action', async (c: Context) => {
  const { action } = c.req.param();
  const { user_id, metadata = {} } = await c.req.json();
  const { env } = c;

  try {
    // Récupérer stats actuelles
    const stats = await env.DB.prepare(`
      SELECT * FROM gamification_stats WHERE user_id = ?
    `).bind(user_id).first();

    if (!stats) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }

    // Calculer points (logique simplifiée, à synchroniser avec frontend)
    const pointsMap: Record<string, number> = {
      visit_completed: 10,
      crv_submitted: 15,
      action_completed: 8,
      lead_created: 12,
      sale_closed: 100
    };

    const basePoints = pointsMap[action] || 0;
    const bonusMultiplier = metadata.quality === 'excellent' ? 1.5 : 1;
    const totalPoints = Math.round(basePoints * bonusMultiplier);

    // Mettre à jour stats
    const newTotalPoints = stats.total_points + totalPoints;
    const actions = JSON.parse(stats.actions as string);
    actions[action] = (actions[action] || 0) + 1;

    await env.DB.prepare(`
      UPDATE gamification_stats 
      SET total_points = ?, actions = ?, updated_at = ?
      WHERE user_id = ?
    `).bind(
      newTotalPoints,
      JSON.stringify(actions),
      new Date().toISOString(),
      user_id
    ).run();

    // Enregistrer dans historique
    await env.DB.prepare(`
      INSERT INTO gamification_history (user_id, action, points, metadata, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      user_id,
      action,
      totalPoints,
      JSON.stringify(metadata),
      new Date().toISOString()
    ).run();

    return c.json({
      success: true,
      points_earned: totalPoints,
      total_points: newTotalPoints
    });

  } catch (error) {
    console.error('[Gamification API] Erreur action:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// GET /api/v1/gamification/leaderboard/:period
// Récupérer leaderboard
app.get('/leaderboard/:period', async (c: Context) => {
  const { period } = c.req.param(); // today, week, month, alltime
  const { limit = '20', user_id } = c.req.query();
  const { env } = c;

  try {
    // Calculer période
    const now = new Date();
    let dateFilter = '';
    
    switch (period) {
      case 'today':
        dateFilter = `DATE(h.created_at) = DATE('${now.toISOString().split('T')[0]}')`;
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = `h.created_at >= '${weekAgo.toISOString()}'`;
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = `h.created_at >= '${monthAgo.toISOString()}'`;
        break;
      default: // alltime
        dateFilter = '1=1';
    }

    // Query leaderboard
    const query = `
      SELECT 
        u.id as user_id,
        u.name as user_name,
        u.avatar as user_avatar,
        s.level,
        s.badges,
        COALESCE(SUM(h.points), 0) as points,
        ROW_NUMBER() OVER (ORDER BY points DESC) as rank
      FROM users u
      LEFT JOIN gamification_stats s ON u.id = s.user_id
      LEFT JOIN gamification_history h ON u.id = h.user_id AND ${dateFilter}
      WHERE u.role IN ('agent', 'supervisor', 'manager')
      GROUP BY u.id
      ORDER BY points DESC
      LIMIT ?
    `;

    const results = await env.DB.prepare(query).bind(parseInt(limit)).all();

    // Parser et enrichir
    const leaderboard: LeaderboardEntry[] = results.results.map((row: any, index: number) => ({
      rank: index + 1,
      user_id: row.user_id,
      user_name: row.user_name,
      user_avatar: row.user_avatar,
      points: row.points || 0,
      level: row.level || 'Bronze',
      badges_count: row.badges ? JSON.parse(row.badges).length : 0,
      trend: 'stable' // TODO: calculer tendance vs période précédente
    }));

    // Rang de l'utilisateur demandé
    let userRank = null;
    if (user_id) {
      const userEntry = leaderboard.find(entry => entry.user_id === user_id);
      if (userEntry) {
        userRank = {
          ...userEntry,
          total_users: leaderboard.length
        };
      }
    }

    return c.json({
      period,
      leaderboard,
      user_rank: userRank,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Gamification API] Erreur leaderboard:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// GET /api/v1/gamification/badges
// Liste de tous les badges disponibles
app.get('/badges', async (c: Context) => {
  const badges = [
    {
      id: 'rookie',
      name: 'Recrue',
      description: 'Première visite complétée',
      icon: '🌟',
      rarity: 'common'
    },
    {
      id: 'explorer',
      name: 'Explorateur',
      description: '10 visites complétées',
      icon: '🗺️',
      rarity: 'common'
    },
    {
      id: 'veteran',
      name: 'Vétéran',
      description: '50 visites complétées',
      icon: '⭐',
      rarity: 'rare'
    },
    {
      id: 'master',
      name: 'Maître',
      description: '100 visites complétées',
      icon: '🏆',
      rarity: 'epic'
    },
    {
      id: 'salesman',
      name: 'Vendeur Pro',
      description: '10 ventes conclues',
      icon: '💰',
      rarity: 'rare'
    },
    {
      id: 'speedster',
      name: 'Flash',
      description: '5 actions complétées en une journée',
      icon: '⚡',
      rarity: 'rare'
    },
    {
      id: 'champion',
      name: 'Champion',
      description: 'Top 3 du leaderboard mensuel',
      icon: '🏅',
      rarity: 'legendary'
    },
    {
      id: 'consistent',
      name: 'Régularité',
      description: '30 jours consécutifs actifs',
      icon: '📅',
      rarity: 'epic'
    }
  ];

  return c.json({ badges });
});

// GET /api/v1/gamification/challenges
// Challenges actifs
app.get('/challenges', async (c: Context) => {
  const now = new Date();
  const challenges = [
    {
      id: 'weekly_visits',
      name: 'Marathon Hebdomadaire',
      description: 'Compléter 20 visites cette semaine',
      type: 'weekly',
      goal: 20,
      reward_points: 100,
      reward_badge: null,
      start_date: new Date(now.setDate(now.getDate() - now.getDay())).toISOString(),
      end_date: new Date(now.setDate(now.getDate() - now.getDay() + 7)).toISOString(),
      participants: 45,
      icon: '🎯'
    },
    {
      id: 'perfect_crv',
      name: 'Perfection CRV',
      description: '10 CRV approuvés sans remarque',
      type: 'monthly',
      goal: 10,
      reward_points: 150,
      reward_badge: 'perfectionist',
      start_date: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      end_date: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
      participants: 32,
      icon: '✨'
    }
  ];

  return c.json({ challenges });
});

export default app;
