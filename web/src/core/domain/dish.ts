export interface DishOptionChoice {
  id: string;
  title: string;
  priceDelta: number;
}

export interface DishOption {
  id: string;
  title: string;
  required: boolean;
  multiple: boolean;
  choices: DishOptionChoice[];
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  composition: string;
  categoryId: string;
  price: number;
  weight: string;
  imageUrl: string;
  available: boolean;
  popular: boolean;
  options: DishOption[];
  allergens: string[];
}
