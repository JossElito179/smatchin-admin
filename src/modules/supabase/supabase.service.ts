import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  public supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    this.logger.log(`Initializing Supabase with URL: ${supabaseUrl}`);
    
    if (!supabaseUrl || !supabaseKey) {
      this.logger.error('Configuration manquante !');
      this.logger.error(`URL: ${supabaseUrl || 'MANQUANTE'}`);
      this.logger.error(`Clé SERVICE_ROLE: ${supabaseKey ? 'PRÉSENTE' : 'MANQUANTE'}`);
      this.logger.error('NOTE: Vous devez utiliser SUPABASE_SERVICE_ROLE_KEY, pas SUPABASE_ANON_KEY');
      throw new Error('Configuration Supabase manquante');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    
    this.logger.log('✅ Client Supabase initialisé');
  }
}