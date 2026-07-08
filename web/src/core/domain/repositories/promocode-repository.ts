import type { Promocode } from "../promocode";

export interface PromocodeRepository {
  findByCode(code: string): Promise<Promocode | null>;
}
