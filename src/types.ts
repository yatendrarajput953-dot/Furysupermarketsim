export type Category = 'food' | 'clothes' | 'electronics';
export type Location = 'village' | 'city' | 'downtown';

export interface Product {
  id: string;
  name: string;
  baseCost: number;
  category: Category;
  description: string;
}

export interface InventoryItem {
  productId: string;
  quantity: number;
  sellPrice: number;
}

export interface Stock {
  id: string;
  name: string;
  currentPrice: number;
  history: number[];
}

export interface Room {
  id: string;
  name: string;
  type: 'storage' | 'sales' | 'office';
  capacityBonus: number;
  cost: number;
  built: boolean;
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'bike' | 'van' | 'truck';
  capacityBonus: number;
  cost: number;
}

export interface PersonalItem {
  id: string;
  name: string;
  type: 'food' | 'utensil' | 'ingredient';
  cost: number;
  hungerRestore?: number;
  energyRestore?: number;
}

export interface Recipe {
  id: string;
  name: string;
  requires: Record<string, number>;
  utensil: string;
  produces: string;
}

export interface GameState {
  money: number;
  day: number;
  hour: number;
  shopName: string;
  shopLevel: number;
  maxInventory: number;
  inventory: Record<string, InventoryItem>;
  bankBalance: number;
  loanAmount: number;
  stocks: Record<string, { owned: number; avgPrice: number }>;
  reputation: number;
  messages: string[];
  rooms: Record<string, Room>;
  vehicles: Record<string, Vehicle>;
  energy: number;
  hunger: number;
  personalInventory: Record<string, number>;
  customRecipes: Recipe[];
  location: Location;
}
