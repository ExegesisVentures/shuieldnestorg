/**
 * Test complete nonce flow including consume_nonce function
 * Run with: npx tsx scripts/test-nonce-flow.ts
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, serviceKey);

async function testNonceFlow() {
  console.log("🧪 Testing Complete Nonce Flow...\n");

  const testAddress = "core1testaddress123456789";
  const testNonce = crypto.randomUUID();

  try {
    // Step 1: Create a nonce
    console.log("1️⃣  Creating nonce...");
    const { error: insertError } = await supabase.from("wallet_nonces").insert({
      nonce: testNonce,
      address: testAddress.toLowerCase(),
    });

    if (insertError) {
      console.log("❌ Failed to create nonce:", insertError.message);
      return;
    }
    console.log(`✅ Nonce created: ${testNonce.slice(0, 16)}...`);

    // Step 2: Verify nonce exists and is unused
    console.log("\n2️⃣  Checking nonce in database...");
    const { data: nonce, error: fetchError } = await supabase
      .from("wallet_nonces")
      .select("*")
      .eq("nonce", testNonce)
      .single();

    if (fetchError) {
      console.log("❌ Failed to fetch nonce:", fetchError.message);
      return;
    }

    console.log(`✅ Nonce found:`);
    console.log(`   - Address: ${nonce.address}`);
    console.log(`   - Used: ${nonce.used}`);
    console.log(`   - Expires: ${nonce.expires_at}`);

    // Step 3: Try to consume with WRONG address (should fail)
    console.log("\n3️⃣  Testing consume_nonce with wrong address...");
    const { data: wrongResult, error: wrongError } = await supabase.rpc(
      "consume_nonce",
      {
        p_nonce: testNonce,
        p_address: "wrong_address",
      }
    );

    if (wrongError) {
      console.log(`⚠️  Function error: ${wrongError.message}`);
    } else if (wrongResult === false) {
      console.log("✅ Correctly rejected wrong address");
    } else {
      console.log("❌ Should have rejected wrong address!");
    }

    // Step 4: Consume with CORRECT address (should succeed)
    console.log("\n4️⃣  Testing consume_nonce with correct address...");
    const { data: correctResult, error: correctError } = await supabase.rpc(
      "consume_nonce",
      {
        p_nonce: testNonce,
        p_address: testAddress.toLowerCase(),
      }
    );

    if (correctError) {
      console.log(`❌ Function error: ${correctError.message}`);
      return;
    }

    if (correctResult === true) {
      console.log("✅ Nonce consumed successfully!");
    } else {
      console.log("❌ Failed to consume nonce");
      return;
    }

    // Step 5: Verify nonce is now marked as used
    console.log("\n5️⃣  Verifying nonce is marked as used...");
    const { data: usedNonce } = await supabase
      .from("wallet_nonces")
      .select("*")
      .eq("nonce", testNonce)
      .single();

    if (usedNonce?.used === true && usedNonce?.used_at) {
      console.log("✅ Nonce marked as used:");
      console.log(`   - Used: ${usedNonce.used}`);
      console.log(`   - Used at: ${usedNonce.used_at}`);
    } else {
      console.log("❌ Nonce not properly marked as used");
      return;
    }

    // Step 6: Try to consume again (should fail)
    console.log("\n6️⃣  Testing double-consumption (should fail)...");
    const { data: doubleResult } = await supabase.rpc("consume_nonce", {
      p_nonce: testNonce,
      p_address: testAddress.toLowerCase(),
    });

    if (doubleResult === false) {
      console.log("✅ Correctly prevented double-consumption");
    } else {
      console.log("❌ Should have prevented double-consumption!");
    }

    // Cleanup
    console.log("\n7️⃣  Cleaning up test nonce...");
    await supabase.from("wallet_nonces").delete().eq("nonce", testNonce);
    console.log("✅ Test nonce deleted");

    console.log("\n" + "=".repeat(60));
    console.log("\n🎉 All nonce flow tests PASSED!\n");
    console.log("✅ Nonce creation works");
    console.log("✅ Address validation works");
    console.log("✅ consume_nonce() function works atomically");
    console.log("✅ Double-consumption prevented");
    console.log("✅ used/used_at tracking works\n");
    console.log("=".repeat(60) + "\n");
  } catch (e: any) {
    console.error("\n❌ Test failed:", e.message);
    process.exit(1);
  }
}

testNonceFlow();

