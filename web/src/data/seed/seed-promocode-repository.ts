import type { Promocode } from "@/core/domain/promocode";
import type { PromocodeRepository } from "@/core/domain/repositories/promocode-repository";
import { seedPromocodes } from "./seed-data";

export class SeedPromocodeRepository implements PromocodeRepository {
  async findByCode(code: string): Promise<Promocode | null> {
    const normalized = code.trim().toLowerCase();
    if (!normalized) return null;
    return (
      seedPromocodes.find(
        (p) => p.active && p.code.toLowerCase() === normalized,
      ) ?? null
    );
  }
}
