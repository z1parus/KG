import type { MenuRepository } from "@/core/domain/repositories/menu-repository";
import type { OrderRepository } from "@/core/domain/repositories/order-repository";
import type { PromocodeRepository } from "@/core/domain/repositories/promocode-repository";
import type { RestaurantRepository } from "@/core/domain/repositories/restaurant-repository";
import { isSupabaseConfigured } from "@/data/supabase/supabase-client";
import { SupabaseMenuRepository } from "@/data/supabase/supabase-menu-repository";
import { SupabaseOrderRepository } from "@/data/supabase/supabase-order-repository";
import { SupabasePromocodeRepository } from "@/data/supabase/supabase-promocode-repository";
import { SupabaseRestaurantRepository } from "@/data/supabase/supabase-restaurant-repository";
import { SeedMenuRepository } from "@/data/seed/seed-menu-repository";
import { SeedOrderRepository } from "@/data/seed/seed-order-repository";
import { SeedPromocodeRepository } from "@/data/seed/seed-promocode-repository";
import { SeedRestaurantRepository } from "@/data/seed/seed-restaurant-repository";

const useSupabase = isSupabaseConfigured();

export const menuRepository: MenuRepository = useSupabase
  ? new SupabaseMenuRepository()
  : new SeedMenuRepository();

export const restaurantRepository: RestaurantRepository = useSupabase
  ? new SupabaseRestaurantRepository()
  : new SeedRestaurantRepository();

export const promocodeRepository: PromocodeRepository = useSupabase
  ? new SupabasePromocodeRepository()
  : new SeedPromocodeRepository();

export const orderRepository: OrderRepository = useSupabase
  ? new SupabaseOrderRepository()
  : new SeedOrderRepository(
      menuRepository,
      restaurantRepository,
      promocodeRepository,
    );

export const dataSourceName = useSupabase ? "supabase" : "seed";
