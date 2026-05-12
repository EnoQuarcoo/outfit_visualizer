import { createClient } from '@supabase/supabase-js'
import { config } from './config'

export const supabse = createClient(
    config.supabaseURL, config.supabaseKey
)