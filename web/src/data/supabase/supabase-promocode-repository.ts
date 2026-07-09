import type { Promocode } from "@/core/domain/promocode";
import type { PromocodeRepository } from "@/core/domain/repositories/promocode-repository";
import { getSupabase } from "./supabase-client";
import { rowToPromocode } from "./mappers";

export class SupabasePromocodeRepository implements PromocodeRepository {
  async findByCode(code: string): Promise<Promocode | null> {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return null;
    const { data, error } = await getSupabase()
      .from("promocodes")
      .select("*")
      .eq("code", normalized)
      .eq("active", true)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToPromocode(data) : null;
  }
}
