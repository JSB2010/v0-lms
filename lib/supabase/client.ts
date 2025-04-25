import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

export const createClient = () => {
  return createClientComponentClient<Database>()
}

// Also export a pre-initialized client for convenience
export const supabase = createClient()
