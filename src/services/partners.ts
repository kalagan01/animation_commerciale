/**
 * Service pour la gestion des Marques (Brands)
 */

import type { SupabaseClient } from '../lib/supabase';
import type { Brand } from '../types';

export class BrandService {
  constructor(private supabase: SupabaseClient, private tenantId: string) {}

  async getAll(params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const offset = (page - 1) * limit;

    const filter: Record<string, any> = {
      tenant_id: this.tenantId,
    };

    if (params.status) {
      filter.status = params.status;
    }

    const { data, error } = await this.supabase.query<Brand>('brands', {
      filter,
      order: { column: 'name', ascending: true },
      limit,
      offset,
    });

    if (error) {
      throw error;
    }

    const { count } = await this.supabase.count('brands', filter);

    return {
      data: data as Brand[],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
        has_next: (count || 0) > page * limit,
        has_prev: page > 1,
      },
    };
  }

  async getById(id: string) {
    const { data, error } = await this.supabase.query<Brand>('brands', {
      filter: { id, tenant_id: this.tenantId },
      single: true,
    });

    if (error) {
      throw error;
    }

    return data as Brand;
  }

  async create(data: Omit<Brand, 'id' | 'created_at' | 'updated_at' | 'tenant_id'>) {
    const { data: result, error } = await this.supabase.insert<Brand>('brands', {
      ...data,
      tenant_id: this.tenantId,
    });

    if (error) {
      throw error;
    }

    return Array.isArray(result) ? result[0] : result;
  }

  async update(id: string, data: Partial<Brand>) {
    const { data: result, error } = await this.supabase.update<Brand>(
      'brands',
      { id, tenant_id: this.tenantId },
      data
    );

    if (error) {
      throw error;
    }

    return Array.isArray(result) ? result[0] : result;
  }

  async delete(id: string) {
    const { error } = await this.supabase.delete('brands', {
      id,
      tenant_id: this.tenantId,
    });

    if (error) {
      throw error;
    }

    return { success: true };
  }
}

/**
 * Service pour la gestion des Enseignes (Banners)
 */
export class BannerService {
  constructor(private supabase: SupabaseClient, private tenantId: string) {}

  async getAll(params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const offset = (page - 1) * limit;

    const filter: Record<string, any> = {
      tenant_id: this.tenantId,
    };

    if (params.status) {
      filter.status = params.status;
    }

    const { data, error } = await this.supabase.query('banners', {
      filter,
      order: { column: 'name', ascending: true },
      limit,
      offset,
    });

    if (error) {
      throw error;
    }

    const { count } = await this.supabase.count('banners', filter);

    return {
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
        has_next: (count || 0) > page * limit,
        has_prev: page > 1,
      },
    };
  }

  async getById(id: string) {
    const { data, error } = await this.supabase.query('banners', {
      filter: { id, tenant_id: this.tenantId },
      single: true,
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async create(data: any) {
    const { data: result, error } = await this.supabase.insert('banners', {
      ...data,
      tenant_id: this.tenantId,
    });

    if (error) {
      throw error;
    }

    return Array.isArray(result) ? result[0] : result;
  }

  async update(id: string, data: any) {
    const { data: result, error } = await this.supabase.update(
      'banners',
      { id, tenant_id: this.tenantId },
      data
    );

    if (error) {
      throw error;
    }

    return Array.isArray(result) ? result[0] : result;
  }

  async delete(id: string) {
    const { error } = await this.supabase.delete('banners', {
      id,
      tenant_id: this.tenantId,
    });

    if (error) {
      throw error;
    }

    return { success: true };
  }
}

/**
 * Service pour la gestion des Stores
 */
export class StoreService {
  constructor(private supabase: SupabaseClient, private tenantId: string) {}

  async getAll(params: {
    page?: number;
    limit?: number;
    status?: string;
    territory_id?: string;
    banner_id?: string;
    city?: string;
  } = {}) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const offset = (page - 1) * limit;

    const filter: Record<string, any> = {
      tenant_id: this.tenantId,
    };

    if (params.status) filter.status = params.status;
    if (params.territory_id) filter.territory_id = params.territory_id;
    if (params.banner_id) filter.banner_id = params.banner_id;
    if (params.city) filter.city = params.city;

    const { data, error } = await this.supabase.query('stores', {
      select: '*,banner:banners(*),territory:territories(*)',
      filter,
      order: { column: 'name', ascending: true },
      limit,
      offset,
    });

    if (error) {
      throw error;
    }

    const { count } = await this.supabase.count('stores', filter);

    return {
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
        has_next: (count || 0) > page * limit,
        has_prev: page > 1,
      },
    };
  }

  async getById(id: string) {
    const { data, error } = await this.supabase.query('stores', {
      select: '*,banner:banners(*),territory:territories(*)',
      filter: { id, tenant_id: this.tenantId },
      single: true,
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async create(data: any) {
    const { data: result, error } = await this.supabase.insert('stores', {
      ...data,
      tenant_id: this.tenantId,
    });

    if (error) {
      throw error;
    }

    return Array.isArray(result) ? result[0] : result;
  }

  async update(id: string, data: any) {
    const { data: result, error } = await this.supabase.update(
      'stores',
      { id, tenant_id: this.tenantId },
      data
    );

    if (error) {
      throw error;
    }

    return Array.isArray(result) ? result[0] : result;
  }

  async delete(id: string) {
    const { error } = await this.supabase.delete('stores', {
      id,
      tenant_id: this.tenantId,
    });

    if (error) {
      throw error;
    }

    return { success: true };
  }
}
