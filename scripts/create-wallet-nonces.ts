/**
 * Create wallet_nonces table
 * Run with: npx tsx scripts/create-wallet-nonces.ts
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!serviceKey) {
  console.log("❌ SUPABASE_SERVICE_ROLE_KEY required to create tables");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function createTable() {
  console.log("🔨 Creating wallet_nonces table...\n");

  const sql = `
    -- Create wallet_nonces table
    CREATE TABLE IF NOT EXISTS wallet_nonces (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      nonce text UNIQUE NOT NULL,
      address text,
      expires_at timestamptz NOT NULL,
      used boolean DEFAULT false,
      used_at timestamptz,
      created_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE wallet_nonces ENABLE ROW LEVEL SECURITY;

    -- Drop policies if they exist
    DROP POLICY IF EXISTS "Anyone can read nonces" ON wallet_nonces;
    DROP POLICY IF EXISTS "Anyone can create nonces" ON wallet_nonces;
    DROP POLICY IF EXISTS "Anyone can update nonces" ON wallet_nonces;

    -- Create policies
    CREATE POLICY "Anyone can read nonces"
    ON wallet_nonces FOR SELECT 
    TO authenticated, anon 
    USING (true);

    CREATE POLICY "Anyone can create nonces"
    ON wallet_nonces FOR INSERT 
    TO authenticated, anon 
    WITH CHECK (true);

    CREATE POLICY "Anyone can update nonces"
    ON wallet_nonces FOR UPDATE 
    TO authenticated, anon 
    USING (true);
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql_string: sql });
    
    if (error) {
      // Try direct creation via REST API
      console.log("Trying alternative method...");
      
      // This won't work via JS client, need to use SQL editor
      console.log("\n⚠️  Cannot create table via API.");
      console.log("\n📝 Please run this SQL in your Supabase SQL Editor:");
      console.log("   https://supabase.com/dashboard/project/" + url.split('.')[0].split('//')[1] + "/sql/new");
      console.log("\n" + sql);
      process.exit(1);
    }

    console.log("✅ wallet_nonces table created successfully!");
    
  } catch (e: any) {
    console.log("\n⚠️  Cannot create table via API.");
    console.log("\n📝 Please copy and run this SQL in your Supabase SQL Editor:");
    console.log("   Dashboard → SQL Editor → New Query\n");
    console.log("```sql");
    console.log(sql);
    console.log("```\n");
  }
}

createTable();

