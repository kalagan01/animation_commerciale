/**
 * Supabase Client pour Cloudflare Workers
 * 
 * Note: Utilise fetch natif (pas de dépendance @supabase/supabase-js)
 * Compatible avec Cloudflare Workers
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceKey?: string;
}

export class SupabaseClient {
  private url: string;
  private anonKey: string;
  private serviceKey?: string;

  constructor(config: SupabaseConfig) {
    this.url = config.url;
    this.anonKey = config.anonKey;
    this.serviceKey = config.serviceKey;
  }

  /**
   * Exécute une requête SQL via l'API REST Supabase
   */
  async query<T = any>(
    table: string,
    options: {
      select?: string;
      filter?: Record<string, any>;
      order?: { column: string; ascending?: boolean };
      limit?: number;
      offset?: number;
      single?: boolean;
    } = {}
  ): Promise<{ data: T | T[] | null; error: Error | null }> {
    try {
      let url = `${this.url}/rest/v1/${table}`;
      
      // SELECT
      const select = options.select || '*';
      url += `?select=${select}`;
      
      // FILTERS
      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          url += `&${key}=eq.${value}`;
        });
      }
      
      // ORDER
      if (options.order) {
        const direction = options.order.ascending === false ? 'desc' : 'asc';
        url += `&order=${options.order.column}.${direction}`;
      }
      
      // LIMIT & OFFSET
      if (options.limit) {
        url += `&limit=${options.limit}`;
      }
      if (options.offset) {
        url += `&offset=${options.offset}`;
      }

      const headers: Record<string, string> = {
        'apikey': this.anonKey,
        'Authorization': `Bearer ${this.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': options.single ? 'return=representation' : 'return=representation',
      };

      if (options.single) {
        headers['Accept'] = 'application/vnd.pgrst.object+json';
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase query error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return { data: data as T | T[], error: null };
    } catch (error) {
      console.error('Supabase query error:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Insert un enregistrement
   */
  async insert<T = any>(
    table: string,
    data: Record<string, any> | Record<string, any>[]
  ): Promise<{ data: T | T[] | null; error: Error | null }> {
    try {
      const url = `${this.url}/rest/v1/${table}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': this.anonKey,
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase insert error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      return { data: result as T | T[], error: null };
    } catch (error) {
      console.error('Supabase insert error:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Update un enregistrement
   */
  async update<T = any>(
    table: string,
    filter: Record<string, any>,
    data: Record<string, any>
  ): Promise<{ data: T | T[] | null; error: Error | null }> {
    try {
      let url = `${this.url}/rest/v1/${table}?`;
      
      // Filters
      Object.entries(filter).forEach(([key, value], index) => {
        if (index > 0) url += '&';
        url += `${key}=eq.${value}`;
      });

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'apikey': this.anonKey,
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase update error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      return { data: result as T | T[], error: null };
    } catch (error) {
      console.error('Supabase update error:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Delete un enregistrement
   */
  async delete(
    table: string,
    filter: Record<string, any>
  ): Promise<{ data: null; error: Error | null }> {
    try {
      let url = `${this.url}/rest/v1/${table}?`;
      
      // Filters
      Object.entries(filter).forEach(([key, value], index) => {
        if (index > 0) url += '&';
        url += `${key}=eq.${value}`;
      });

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'apikey': this.anonKey,
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase delete error: ${response.status} ${errorText}`);
      }

      return { data: null, error: null };
    } catch (error) {
      console.error('Supabase delete error:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Compte le nombre d'enregistrements
   */
  async count(
    table: string,
    filter?: Record<string, any>
  ): Promise<{ count: number | null; error: Error | null }> {
    try {
      let url = `${this.url}/rest/v1/${table}?select=count`;
      
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          url += `&${key}=eq.${value}`;
        });
      }

      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'apikey': this.anonKey,
          'Authorization': `Bearer ${this.anonKey}`,
          'Prefer': 'count=exact',
        },
      });

      if (!response.ok) {
        throw new Error(`Supabase count error: ${response.status}`);
      }

      const contentRange = response.headers.get('content-range');
      const count = contentRange ? parseInt(contentRange.split('/')[1]) : 0;

      return { count, error: null };
    } catch (error) {
      console.error('Supabase count error:', error);
      return { count: null, error: error as Error };
    }
  }
}

/**
 * Factory pour créer une instance Supabase
 */
export function createSupabaseClient(env: {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_KEY?: string;
}): SupabaseClient | null {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured: SUPABASE_URL or SUPABASE_ANON_KEY missing');
    return null;
  }

  return new SupabaseClient({
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY,
    serviceKey: env.SUPABASE_SERVICE_KEY,
  });
}
