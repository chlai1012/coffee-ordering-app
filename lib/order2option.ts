import { supabase } from "@/lib/supabaseClient";

interface Order2OptionRow {
  order_fk: string;
  option_fk: number;
}

/**
 * Insert order2option records into the database.
 * Supports both OptionItem arrays and numeric ID arrays.
 */
export async function insertOrder2Options(
  rows: Order2OptionRow[]
): Promise<{ error?: string }> {
  if (!rows || rows.length === 0) {
    return {};
  }

  const { error } = await supabase.from("order2option").insert(rows);

  if (error) {
    console.error("Failed to insert order2option:", error);
    return { error: error.message };
  }

  return {};
}

/**
 * Extract option IDs from either selectedOptionIds or selectedOptions.
 * Handles both numeric IDs and OptionItem objects.
 */
export function extractOptionIds(item: any): number[] {
  if (!item) return [];

  // If selectedOptionIds exists and has items, use it
  if (Array.isArray(item.selectedOptionIds) && item.selectedOptionIds.length > 0) {
    return item.selectedOptionIds;
  }

  // Otherwise, extract from selectedOptions (OptionItem array)
  if (Array.isArray(item.selectedOptions) && item.selectedOptions.length > 0) {
    return item.selectedOptions
      .map((opt: any) => (typeof opt === "object" ? opt.id : opt))
      .filter((id: any) => id !== undefined && id !== null)
      .map((id: any) => Number(id));
  }

  return [];
}
