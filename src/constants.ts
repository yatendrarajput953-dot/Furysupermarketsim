import { Product, Stock, Room, Vehicle, PersonalItem, Recipe } from '../types';

export const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Bread', baseCost: 2, category: 'food', description: 'Freshly baked daily.' },
  { id: 'p2', name: 'Milk', baseCost: 3, category: 'food', description: 'Whole milk from local farms.' },
  { id: 'p3', name: 'Eggs', baseCost: 4, category: 'food', description: 'A dozen free-range eggs.' },
  { id: 'p4', name: 'T-Shirt', baseCost: 15, category: 'clothes', description: 'Comfortable cotton t-shirt.' },
  { id: 'p5', name: 'Jeans', baseCost: 30, category: 'clothes', description: 'Durable blue denim jeans.' },
  { id: 'p6', name: 'Smartphone', baseCost: 300, category: 'electronics', description: 'Latest model with high-res camera.' },
  { id: 'p7', name: 'Headphones', baseCost: 50, category: 'electronics', description: 'Noise-cancelling wireless headphones.' },
];

export const INITIAL_STOCKS: Stock[] = [
  { id: 's1', name: 'TechCorp', currentPrice: 150, history: [150] },
  { id: 's2', name: 'FoodInc', currentPrice: 40, history: [40] },
  { id: 's3', name: 'RetailGroup', currentPrice: 80, history: [80] },
];

export const SHOP_UPGRADES = [
  { level: 1, cost: 0, capacity: 100 },
  { level: 2, cost: 5000, capacity: 300 },
  { level: 3, cost: 15000, capacity: 1000 },
  { level: 4, cost: 50000, capacity: 5000 },
];

export const AVAILABLE_ROOMS: Room[] = [
  { id: 'r1', name: 'Backroom Storage', type: 'storage', capacityBonus: 500, cost: 2000, built: false },
  { id: 'r2', name: 'Warehouse Expansion', type: 'storage', capacityBonus: 2000, cost: 10000, built: false },
  { id: 'r3', name: 'Sales Floor Expansion 1', type: 'sales', capacityBonus: 200, cost: 5000, built: false },
  { id: 'r4', name: 'Sales Floor Expansion 2', type: 'sales', capacityBonus: 500, cost: 15000, built: false },
  { id: 'r5', name: 'Manager Office', type: 'office', capacityBonus: 0, cost: 8000, built: false },
];

export const AVAILABLE_VEHICLES: Vehicle[] = [
  { id: 'v1', name: 'Delivery Bike', type: 'bike', capacityBonus: 50, cost: 500 },
  { id: 'v2', name: 'Cargo Van', type: 'van', capacityBonus: 300, cost: 4000 },
  { id: 'v3', name: 'Heavy Truck', type: 'truck', capacityBonus: 1000, cost: 12000 },
];

export const PERSONAL_ITEMS: PersonalItem[] = [
  { id: 'apple', name: 'Apple', type: 'food', cost: 5, hungerRestore: 15, energyRestore: 5 },
  { id: 'bread', name: 'Bread Loaf', type: 'food', cost: 8, hungerRestore: 25, energyRestore: 10 },
  { id: 'raw_meat', name: 'Raw Meat', type: 'ingredient', cost: 15 },
  { id: 'raw_fish', name: 'Raw Fish', type: 'ingredient', cost: 12 },
  { id: 'vegetables', name: 'Vegetables', type: 'ingredient', cost: 6 },
  { id: 'pan', name: 'Frying Pan', type: 'utensil', cost: 50 },
  { id: 'pot', name: 'Cooking Pot', type: 'utensil', cost: 60 },
  { id: 'knife', name: 'Chef Knife', type: 'utensil', cost: 40 },
  { id: 'cooked_steak', name: 'Cooked Steak', type: 'food', cost: 0, hungerRestore: 60, energyRestore: 30 },
  { id: 'fish_soup', name: 'Fish Soup', type: 'food', cost: 0, hungerRestore: 50, energyRestore: 40 },
  { id: 'salad', name: 'Fresh Salad', type: 'food', cost: 0, hungerRestore: 30, energyRestore: 20 },
];

export const RECIPES: Recipe[] = [
  {
    id: 'cook_steak',
    name: 'Cook Steak',
    requires: { 'raw_meat': 1 },
    utensil: 'pan',
    produces: 'cooked_steak'
  },
  {
    id: 'make_soup',
    name: 'Fish Soup',
    requires: { 'raw_fish': 1, 'vegetables': 1 },
    utensil: 'pot',
    produces: 'fish_soup'
  },
  {
    id: 'make_salad',
    name: 'Fresh Salad',
    requires: { 'vegetables': 2 },
    utensil: 'knife',
    produces: 'salad'
  }
];
