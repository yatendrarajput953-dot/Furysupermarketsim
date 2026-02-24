import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Product, Stock } from './types';
import { PRODUCTS, INITIAL_STOCKS, SHOP_UPGRADES, AVAILABLE_ROOMS, AVAILABLE_VEHICLES, PERSONAL_ITEMS, RECIPES } from './hooks/constants';
import { io, Socket } from 'socket.io-client';

const INITIAL_STATE: GameState = {
  money: 10000,
  day: 1,
  hour: 8,
  shopName: 'Fury Supermarket',
  shopLevel: 1,
  maxInventory: SHOP_UPGRADES[0].capacity,
  inventory: {},
  bankBalance: 0,
  loanAmount: 0,
  stocks: {},
  reputation: 50,
  messages: ['Welcome to Fury Supermarket Sim!'],
  rooms: {},
  vehicles: {},
  energy: 100,
  hunger: 100,
  personalInventory: {},
  customRecipes: [],
  location: 'village',
};

export function useGameEngine(isMultiplayer: boolean = false, roomId: string = '') {
  const [state, setState] = useState<GameState>({
    ...INITIAL_STATE,
    money: isMultiplayer ? 40000 : 10000,
  });
  const [marketStocks, setMarketStocks] = useState<Stock[]>(INITIAL_STOCKS);
  const [isPaused, setIsPaused] = useState(false);
  const [playerCount, setPlayerCount] = useState(1);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isMultiplayer && roomId) {
      socketRef.current = io();
      
      socketRef.current.on('connect', () => {
        socketRef.current?.emit('joinRoom', roomId, state);
      });

      socketRef.current.on('gameState', (newState: GameState) => {
        setState(newState);
      });

      socketRef.current.on('playerCount', (count: number) => {
        setPlayerCount(count);
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [isMultiplayer, roomId]);

  const updateState = useCallback((updater: (prev: GameState) => GameState) => {
    setState(prev => {
      const newState = updater(prev);
      if (isMultiplayer && socketRef.current) {
        socketRef.current.emit('updateState', roomId, newState);
      }
      return newState;
    });
  }, [isMultiplayer, roomId]);

  // Game loop
  useEffect(() => {
    if (isPaused || (isMultiplayer && playerCount === 0)) return;

    const interval = setInterval(() => {
      updateState((prev) => {
        let nextHour = prev.hour + 1;
        let nextDay = prev.day;
        let newMoney = prev.money;
        let newInventory = { ...prev.inventory };
        let newReputation = prev.reputation;
        let newBankBalance = prev.bankBalance;
        let newLoanAmount = prev.loanAmount;
        let newEnergy = prev.energy;
        let newHunger = prev.hunger;
        const newMessages = [...prev.messages];

        const addMessage = (msg: string) => {
          newMessages.push(`[Day ${prev.day} ${prev.hour.toString().padStart(2, '0')}:00] ${msg}`);
          if (newMessages.length > 50) newMessages.shift();
        };

        // Decrease hunger and energy
        newHunger = Math.max(0, newHunger - 2);
        newEnergy = Math.max(0, newEnergy - (newHunger < 20 ? 10 : 5));

        // Pass out if energy is 0
        if (newEnergy <= 0) {
          newEnergy = 50;
          newHunger = 50;
          nextHour = 8;
          nextDay += 1;
          const hospitalBill = 500;
          newMoney = Math.max(0, newMoney - hospitalBill);
          addMessage(`You passed out from exhaustion! Paid ${hospitalBill} hospital bill.`);
        }

        // Simulate sales if shop is open (8 AM to 10 PM)
        if (nextHour >= 8 && nextHour <= 22) {
          let itemsSold = 0;
          let revenue = 0;

          Object.keys(newInventory).forEach((productId) => {
            const item = newInventory[productId];
            if (item.quantity > 0) {
              const product = PRODUCTS.find((p) => p.id === productId);
              if (product) {
                // Simple demand calculation based on markup and reputation
                const markup = item.sellPrice / product.baseCost;
                let demandChance = 0.5; // base chance
                
                if (markup > 2) demandChance -= 0.3;
                else if (markup < 1.2) demandChance += 0.3;
                
                demandChance += (prev.reputation - 50) / 200; // reputation effect
                
                if (Math.random() < demandChance) {
                  // Sell 1 to 5 items
                  const amountToSell = Math.min(item.quantity, Math.floor(Math.random() * 5) + 1);
                  item.quantity -= amountToSell;
                  revenue += amountToSell * item.sellPrice;
                  itemsSold += amountToSell;
                }
              }
            }
          });

          if (revenue > 0) {
             newMoney += revenue;
             // addMessage(`Sold ${itemsSold} items for $${revenue.toFixed(2)}`);
          }
        }

        // End of day logic
        if (nextHour >= 24) {
          nextHour = 0;
          nextDay += 1;
          
          // Bank interest (1% daily on deposits, 2% daily on loans)
          if (newBankBalance > 0) {
            const interest = newBankBalance * 0.01;
            newBankBalance += interest;
            addMessage(`Earned $${interest.toFixed(2)} in bank interest.`);
          }
          if (newLoanAmount > 0) {
            const interest = newLoanAmount * 0.02;
            newLoanAmount += interest;
            addMessage(`Charged $${interest.toFixed(2)} in loan interest.`);
          }

          // Update stock market
          setMarketStocks((prevStocks) => 
            prevStocks.map(stock => {
              const changePercent = (Math.random() - 0.5) * 0.1; // -5% to +5%
              const newPrice = Math.max(1, stock.currentPrice * (1 + changePercent));
              return {
                ...stock,
                currentPrice: newPrice,
                history: [...stock.history, newPrice].slice(-30) // keep last 30 days
              };
            })
          );
        }

        return {
          ...prev,
          hour: nextHour,
          day: nextDay,
          money: newMoney,
          inventory: newInventory,
          bankBalance: newBankBalance,
          loanAmount: newLoanAmount,
          reputation: newReputation,
          messages: newMessages,
          energy: newEnergy,
          hunger: newHunger,
        };
      });
    }, 2000); // 2 seconds real time = 1 hour in game

    return () => clearInterval(interval);
  }, [isPaused]);

  // Actions
  const buyProduct = useCallback((productId: string, quantity: number) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    updateState(prev => {
      const cost = product.baseCost * quantity;
      if (prev.money < cost) {
        return prev; // Not enough money
      }

      const currentTotalItems = Object.values(prev.inventory).reduce((acc, item: any) => acc + item.quantity, 0);
      if (Number(currentTotalItems) + quantity > prev.maxInventory) {
        return prev; // Not enough space
      }

      const newInventory = { ...prev.inventory };
      if (!newInventory[productId]) {
        newInventory[productId] = { productId, quantity: 0, sellPrice: product.baseCost * 1.5 };
      }
      newInventory[productId].quantity += quantity;

      return {
        ...prev,
        money: prev.money - cost,
        inventory: newInventory,
        messages: [...prev.messages, `Bought ${quantity}x ${product.name} for $${cost.toFixed(2)}`]
      };
    });
  }, []);

  const setSellPrice = useCallback((productId: string, price: number) => {
    updateState(prev => {
      if (!prev.inventory[productId]) return prev;
      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          [productId]: { ...prev.inventory[productId], sellPrice: price }
        }
      };
    });
  }, []);

  const upgradeShop = useCallback(() => {
    updateState(prev => {
      const nextLevel = SHOP_UPGRADES.find(u => u.level === prev.shopLevel + 1);
      if (!nextLevel || prev.money < nextLevel.cost) return prev;

      const additionalCapacity = Object.values(prev.rooms || {}).reduce((acc, r: any) => acc + (r.built ? r.capacityBonus : 0), 0);
      const vehicleCapacity = Object.values(prev.vehicles || {}).reduce((acc, v: any) => acc + v.capacityBonus, 0);

      return {
        ...prev,
        money: prev.money - nextLevel.cost,
        shopLevel: nextLevel.level,
        maxInventory: nextLevel.capacity + Number(additionalCapacity) + Number(vehicleCapacity),
        messages: [...prev.messages, `Upgraded shop to level ${nextLevel.level}!`]
      };
    });
  }, []);

  const buildRoom = useCallback((roomId: string) => {
    updateState(prev => {
      const room = AVAILABLE_ROOMS.find(r => r.id === roomId);
      if (!room || prev.money < room.cost || prev.rooms[roomId]?.built) return prev;

      const newRooms = { ...prev.rooms, [roomId]: { ...room, built: true } };
      
      const baseCapacity = SHOP_UPGRADES.find(u => u.level === prev.shopLevel)?.capacity || 100;
      const additionalCapacity = Object.values(newRooms).reduce((acc, r: any) => acc + (r.built ? r.capacityBonus : 0), 0);
      const vehicleCapacity = Object.values(prev.vehicles || {}).reduce((acc, v: any) => acc + v.capacityBonus, 0);

      return {
        ...prev,
        money: prev.money - room.cost,
        rooms: newRooms,
        maxInventory: baseCapacity + Number(additionalCapacity) + Number(vehicleCapacity),
        messages: [...prev.messages, `Built ${room.name} for $${room.cost.toFixed(2)}`]
      };
    });
  }, []);

  const demolishRoom = useCallback((roomId: string) => {
    updateState(prev => {
      const room = prev.rooms[roomId];
      if (!room || !room.built) return prev;

      const currentTotalItems = Object.values(prev.inventory).reduce((acc, item: any) => acc + item.quantity, 0);
      const baseCapacity = SHOP_UPGRADES.find(u => u.level === prev.shopLevel)?.capacity || 100;
      const newRooms = { ...prev.rooms };
      delete newRooms[roomId];
      
      const additionalCapacity = Object.values(newRooms).reduce((acc, r: any) => acc + (r.built ? r.capacityBonus : 0), 0);
      const vehicleCapacity = Object.values(prev.vehicles || {}).reduce((acc, v: any) => acc + v.capacityBonus, 0);
      const newMaxInventory = baseCapacity + Number(additionalCapacity) + Number(vehicleCapacity);

      if (Number(currentTotalItems) > newMaxInventory) {
        return {
          ...prev,
          messages: [...prev.messages, `Cannot demolish ${room.name}: Not enough capacity for current inventory!`]
        };
      }

      const refund = room.cost * 0.5;

      return {
        ...prev,
        money: prev.money + refund,
        rooms: newRooms,
        maxInventory: newMaxInventory,
        messages: [...prev.messages, `Demolished ${room.name} and refunded $${refund.toFixed(2)}`]
      };
    });
  }, []);

  const buyVehicle = useCallback((vehicleId: string) => {
    updateState(prev => {
      const vehicle = AVAILABLE_VEHICLES.find(v => v.id === vehicleId);
      if (!vehicle || prev.money < vehicle.cost || prev.vehicles[vehicleId]) return prev;

      const newVehicles = { ...prev.vehicles, [vehicleId]: vehicle };
      
      const baseCapacity = SHOP_UPGRADES.find(u => u.level === prev.shopLevel)?.capacity || 100;
      const additionalCapacity = Object.values(prev.rooms || {}).reduce((acc, r: any) => acc + (r.built ? r.capacityBonus : 0), 0);
      const vehicleCapacity = Object.values(newVehicles).reduce((acc, v: any) => acc + v.capacityBonus, 0);

      return {
        ...prev,
        money: prev.money - vehicle.cost,
        vehicles: newVehicles,
        maxInventory: baseCapacity + Number(additionalCapacity) + Number(vehicleCapacity),
        messages: [...prev.messages, `Bought ${vehicle.name} for $${vehicle.cost.toFixed(2)}`]
      };
    });
  }, []);

  const bankDeposit = useCallback((amount: number) => {
    updateState(prev => {
      if (prev.money < amount || amount <= 0) return prev;
      return {
        ...prev,
        money: prev.money - amount,
        bankBalance: prev.bankBalance + amount
      };
    });
  }, []);

  const bankWithdraw = useCallback((amount: number) => {
    updateState(prev => {
      if (prev.bankBalance < amount || amount <= 0) return prev;
      return {
        ...prev,
        money: prev.money + amount,
        bankBalance: prev.bankBalance - amount
      };
    });
  }, []);

  const takeLoan = useCallback((amount: number) => {
    updateState(prev => {
      if (amount <= 0) return prev;
      return {
        ...prev,
        money: prev.money + amount,
        loanAmount: prev.loanAmount + amount
      };
    });
  }, []);

  const repayLoan = useCallback((amount: number) => {
    updateState(prev => {
      if (prev.money < amount || amount <= 0 || prev.loanAmount <= 0) return prev;
      const actualRepayment = Math.min(amount, prev.loanAmount);
      return {
        ...prev,
        money: prev.money - actualRepayment,
        loanAmount: prev.loanAmount - actualRepayment
      };
    });
  }, []);

  const buyStock = useCallback((stockId: string, quantity: number) => {
    const stock = marketStocks.find(s => s.id === stockId);
    if (!stock || quantity <= 0) return;

    updateState(prev => {
      const cost = stock.currentPrice * quantity;
      if (prev.money < cost) return prev;

      const newStocks = { ...prev.stocks };
      const currentOwned = newStocks[stockId]?.owned || 0;
      const currentAvgPrice = newStocks[stockId]?.avgPrice || 0;
      
      const newAvgPrice = ((currentOwned * currentAvgPrice) + cost) / (currentOwned + quantity);

      newStocks[stockId] = {
        owned: currentOwned + quantity,
        avgPrice: newAvgPrice
      };

      return {
        ...prev,
        money: prev.money - cost,
        stocks: newStocks,
        messages: [...prev.messages, `Bought ${quantity} shares of ${stock.name} for $${cost.toFixed(2)}`]
      };
    });
  }, [marketStocks]);

  const sellStock = useCallback((stockId: string, quantity: number) => {
    const stock = marketStocks.find(s => s.id === stockId);
    if (!stock || quantity <= 0) return;

    updateState(prev => {
      const owned = prev.stocks[stockId]?.owned || 0;
      if (owned < quantity) return prev;

      const revenue = stock.currentPrice * quantity;
      const newStocks = { ...prev.stocks };
      newStocks[stockId].owned -= quantity;
      
      if (newStocks[stockId].owned === 0) {
        delete newStocks[stockId];
      }

      return {
        ...prev,
        money: prev.money + revenue,
        stocks: newStocks,
        messages: [...prev.messages, `Sold ${quantity} shares of ${stock.name} for $${revenue.toFixed(2)}`]
      };
    });
  }, [marketStocks]);

  const sleep = useCallback(() => {
    updateState(prev => {
      return {
        ...prev,
        hour: 8,
        day: prev.day + 1,
        energy: 100,
        messages: [...prev.messages, `You slept well. Energy restored to 100.`]
      };
    });
  }, []);

  const buyPersonalItem = useCallback((itemId: string, quantity: number) => {
    updateState(prev => {
      const item = PERSONAL_ITEMS.find(i => i.id === itemId);
      if (!item) return prev;

      const cost = item.cost * quantity;
      if (prev.money < cost) return prev;

      const currentQty = prev.personalInventory[itemId] || 0;

      return {
        ...prev,
        money: prev.money - cost,
        personalInventory: {
          ...prev.personalInventory,
          [itemId]: currentQty + quantity
        },
        messages: [...prev.messages, `Bought ${quantity}x ${item.name} for ${cost.toFixed(2)}`]
      };
    });
  }, []);

  const eat = useCallback((itemId: string) => {
    updateState(prev => {
      const item = PERSONAL_ITEMS.find(i => i.id === itemId);
      const currentQty = prev.personalInventory[itemId] || 0;
      if (!item || currentQty <= 0 || item.type !== 'food') return prev;

      const newEnergy = Math.min(100, prev.energy + (item.energyRestore || 0));
      const newHunger = Math.min(100, prev.hunger + (item.hungerRestore || 0));

      const newInventory = { ...prev.personalInventory };
      if (currentQty === 1) {
        delete newInventory[itemId];
      } else {
        newInventory[itemId] = currentQty - 1;
      }

      return {
        ...prev,
        energy: newEnergy,
        hunger: newHunger,
        personalInventory: newInventory,
        messages: [...prev.messages, `Ate ${item.name}. Hunger +${item.hungerRestore || 0}, Energy +${item.energyRestore || 0}`]
      };
    });
  }, []);

  const cook = useCallback((recipeId: string, success: boolean = true) => {
    updateState(prev => {
      const allRecipes = [...RECIPES, ...(prev.customRecipes || [])];
      const recipe = allRecipes.find(r => r.id === recipeId);
      if (!recipe) return prev;

      // Check utensil
      if (!prev.personalInventory[recipe.utensil]) {
        return {
          ...prev,
          messages: [...prev.messages, `You need a ${PERSONAL_ITEMS.find(i => i.id === recipe.utensil)?.name} to cook this!`]
        };
      }

      // Check ingredients
      for (const [reqId, reqQty] of Object.entries(recipe.requires)) {
        if ((prev.personalInventory[reqId] || 0) < reqQty) {
          return {
            ...prev,
            messages: [...prev.messages, `Not enough ${PERSONAL_ITEMS.find(i => i.id === reqId)?.name} to cook ${recipe.name}!`]
          };
        }
      }

      // Deduct ingredients
      const newInventory = { ...prev.personalInventory };
      for (const [reqId, reqQty] of Object.entries(recipe.requires)) {
        newInventory[reqId] -= reqQty;
        if (newInventory[reqId] === 0) delete newInventory[reqId];
      }

      if (!success) {
        return {
          ...prev,
          personalInventory: newInventory,
          messages: [...prev.messages, `Failed to cook ${recipe.name}. Ingredients were lost!`]
        };
      }

      // Add produced item
      newInventory[recipe.produces] = (newInventory[recipe.produces] || 0) + 1;

      return {
        ...prev,
        personalInventory: newInventory,
        messages: [...prev.messages, `Cooked ${recipe.name} successfully!`]
      };
    });
  }, []);

  const createRecipe = useCallback((recipe: import('../types').Recipe) => {
    updateState(prev => ({
      ...prev,
      customRecipes: [...(prev.customRecipes || []), recipe],
      messages: [...prev.messages, `Created new recipe: ${recipe.name}!`]
    }));
  }, []);

  const travel = useCallback((newLocation: import('../types').Location) => {
    updateState(prev => {
      if (prev.location === newLocation) return prev;
      
      if (prev.energy < 10) {
        return {
          ...prev,
          messages: [...prev.messages, `Not enough energy to travel!`]
        };
      }

      return {
        ...prev,
        location: newLocation,
        hour: prev.hour + 1 >= 24 ? 0 : prev.hour + 1,
        day: prev.hour + 1 >= 24 ? prev.day + 1 : prev.day,
        energy: prev.energy - 10,
        messages: [...prev.messages, `Traveled to ${newLocation}.`]
      };
    });
  }, []);

  return {
    state,
    marketStocks,
    isPaused,
    setIsPaused,
    playerCount,
    isMultiplayer,
    buyProduct,
    setSellPrice,
    upgradeShop,
    buildRoom,
    demolishRoom,
    buyVehicle,
    bankDeposit,
    bankWithdraw,
    takeLoan,
    repayLoan,
    buyStock,
    sellStock,
    sleep,
    eat,
    buyPersonalItem,
    cook,
    createRecipe,
    travel
  };
}
