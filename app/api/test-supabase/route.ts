import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabase.from("order").select("*");

  return new Response(JSON.stringify({ data, error }), {
    status: error ? 500 : 200,
    headers: { "Content-Type": "application/json" },
  });
}
