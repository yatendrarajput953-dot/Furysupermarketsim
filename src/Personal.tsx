import React, { useState, useEffect } from 'react';
import { useGameEngine } from '../useGameEngine';
import { PERSONAL_ITEMS, RECIPES } from '../hooks/constants';
import { Heart, Moon, Utensils, Coffee, ShoppingBag, Flame, ChefHat, CheckCircle2, XCircle } from 'lucide-react';

export default function Personal({ engine }: { engine: ReturnType<typeof useGameEngine> }) {
  const { state, sleep, eat, buyPersonalItem, cook, createRecipe } = engine;
  const [activeTab, setActiveTab] = useState<'status' | 'shop' | 'kitchen' | 'create_recipe'>('status');
  
  const [cookingState, setCookingState] = useState<{
    recipeId: string | null;
    progress: number;
    status: 'idle' | 'cooking' | 'success' | 'failure';
  }>({
    recipeId: null,
    progress: 0,
    status: 'idle'
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cookingState.status === 'cooking') {
      interval = setInterval(() => {
        setCookingState(prev => {
          if (prev.progress >= 100) {
            clearInterval(interval);
            const success = Math.random() > 0.2; // 80% success rate
            if (success && prev.recipeId) {
              cook(prev.recipeId);
            }
            return { ...prev, status: success ? 'success' : 'failure' };
          }
          return { ...prev, progress: prev.progress + 10 };
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [cookingState.status, cook]);

  const handleCook = (recipeId: string) => {
    setCookingState({
      recipeId,
      progress: 0,
      status: 'cooking'
    });
  };

  const resetCooking = () => {
    setCookingState({
      recipeId: null,
      progress: 0,
      status: 'idle'
    });
  };

  const [newRecipe, setNewRecipe] = useState({
    name: '',
    utensil: '',
    produces: '',
    requires: {} as Record<string, number>
  });

  const handleCreateRecipe = () => {
    if (!newRecipe.name || !newRecipe.utensil || !newRecipe.produces || Object.keys(newRecipe.requires).length === 0) return;
    
    createRecipe({
      id: `custom_${Date.now()}`,
      name: newRecipe.name,
      utensil: newRecipe.utensil,
      produces: newRecipe.produces,
      requires: newRecipe.requires
    });
    
    setNewRecipe({
      name: '',
      utensil: '',
      produces: '',
      requires: {}
    });
    setActiveTab('kitchen');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'food': return <Coffee className="text-amber-400" size={20} />;
      case 'utensil': return <Utensils className="text-neutral-400" size={20} />;
      case 'ingredient': return <ShoppingBag className="text-emerald-400" size={20} />;
      default: return <ShoppingBag className="text-neutral-400" size={20} />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Personal Life</h2>
        <p className="text-neutral-400 mt-1">Manage your health, sleep, and meals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="text-red-400" size={24} />
            <h3 className="text-xl font-bold">Health Status</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-400">Energy</span>
                <span className="font-mono">{Math.round(state.energy)}/100</span>
              </div>
              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${state.energy > 50 ? 'bg-emerald-500' : state.energy > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${state.energy}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-400">Hunger (Fullness)</span>
                <span className="font-mono">{Math.round(state.hunger)}/100</span>
              </div>
              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${state.hunger > 50 ? 'bg-emerald-500' : state.hunger > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${state.hunger}%` }}
                />
              </div>
            </div>
            <button
              onClick={sleep}
              className="w-full mt-4 py-3 rounded-xl font-medium transition-colors bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center space-x-2"
            >
              <Moon size={20} />
              <span>Sleep (Advance to Next Day)</span>
            </button>
          </div>
        </div>

        <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800">
          <div className="flex items-center space-x-3 mb-4">
            <ShoppingBag className="text-emerald-400" size={24} />
            <h3 className="text-xl font-bold">My Inventory</h3>
          </div>
          {Object.keys(state.personalInventory).length === 0 ? (
            <p className="text-neutral-500 text-center py-4">Your fridge and cupboards are empty.</p>
          ) : (
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {Object.entries(state.personalInventory).map(([itemId, qty]) => {
                const item = PERSONAL_ITEMS.find(i => i.id === itemId);
                if (!item) return null;
                return (
                  <div key={itemId} className="flex items-center justify-between p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                    <div className="flex items-center space-x-3">
                      {getIcon(item.type)}
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-neutral-500">Owned: {qty}</div>
                      </div>
                    </div>
                    {item.type === 'food' && (
                      <button
                        onClick={() => eat(itemId)}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      >
                        Eat
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-2 border-b border-neutral-800 pb-4">
        <button
          onClick={() => setActiveTab('shop')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'shop' ? 'bg-emerald-500 text-neutral-950' : 'text-neutral-400 hover:bg-neutral-800'}`}
        >
          Supermarket
        </button>
        <button
          onClick={() => setActiveTab('kitchen')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'kitchen' ? 'bg-emerald-500 text-neutral-950' : 'text-neutral-400 hover:bg-neutral-800'}`}
        >
          Kitchen
        </button>
        <button
          onClick={() => setActiveTab('create_recipe')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'create_recipe' ? 'bg-emerald-500 text-neutral-950' : 'text-neutral-400 hover:bg-neutral-800'}`}
        >
          Create Recipe
        </button>
      </div>

      {activeTab === 'shop' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PERSONAL_ITEMS.filter(i => i.cost > 0).map(item => (
            <div key={item.id} className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex flex-col">
              <div className="flex items-center space-x-3 mb-2">
                {getIcon(item.type)}
                <div className="font-medium">{item.name}</div>
              </div>
              <div className="text-sm text-neutral-500 mb-4">
                {item.type === 'food' && `Restores ${item.hungerRestore} Hunger, ${item.energyRestore} Energy`}
                {item.type === 'utensil' && `Used for cooking`}
                {item.type === 'ingredient' && `Used in recipes`}
              </div>
              <div className="mt-auto flex items-center justify-between">
                <span className="font-mono text-emerald-400">${item.cost.toFixed(2)}</span>
                <button
                  onClick={() => buyPersonalItem(item.id, 1)}
                  disabled={state.money < item.cost}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 transition-colors"
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'kitchen' && (
        <div className="space-y-6">
          {cookingState.status !== 'idle' && (
            <div className={`p-6 rounded-2xl border ${
              cookingState.status === 'cooking' ? 'bg-neutral-900 border-neutral-700' :
              cookingState.status === 'success' ? 'bg-emerald-950 border-emerald-800' :
              'bg-red-950 border-red-800'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {cookingState.status === 'cooking' && <ChefHat className="text-orange-400 animate-bounce" size={24} />}
                  {cookingState.status === 'success' && <CheckCircle2 className="text-emerald-400" size={24} />}
                  {cookingState.status === 'failure' && <XCircle className="text-red-400" size={24} />}
                  <h3 className="text-xl font-bold">
                    {cookingState.status === 'cooking' && 'Cooking in progress...'}
                    {cookingState.status === 'success' && 'Cooking Successful!'}
                    {cookingState.status === 'failure' && 'Cooking Failed!'}
                  </h3>
                </div>
                {(cookingState.status === 'success' || cookingState.status === 'failure') && (
                  <button
                    onClick={resetCooking}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-neutral-800 hover:bg-neutral-700 transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
              
              {cookingState.status === 'cooking' && (
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 transition-all duration-200"
                    style={{ width: `${cookingState.progress}%` }}
                  />
                </div>
              )}
              
              {cookingState.status === 'failure' && (
                <p className="text-red-400">You burnt the food! Ingredients were lost.</p>
              )}
              {cookingState.status === 'success' && (
                <p className="text-emerald-400">Delicious! The meal has been added to your inventory.</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...RECIPES, ...(state.customRecipes || [])].map(recipe => {
              const utensil = PERSONAL_ITEMS.find(i => i.id === recipe.utensil);
              const hasUtensil = !!state.personalInventory[recipe.utensil];
              
              let canCook = hasUtensil;
              const missingIngredients: string[] = [];
              
              Object.entries(recipe.requires).forEach(([reqId, reqQty]) => {
                if ((state.personalInventory[reqId] || 0) < reqQty) {
                  canCook = false;
                  missingIngredients.push(PERSONAL_ITEMS.find(i => i.id === reqId)?.name || reqId);
                }
              });

              return (
                <div key={recipe.id} className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex flex-col">
                  <div className="flex items-center space-x-3 mb-4">
                    <Flame className="text-orange-400" size={24} />
                    <div className="font-bold text-lg">{recipe.name}</div>
                  </div>
                  
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Requires Utensil:</span>
                      <span className={hasUtensil ? 'text-emerald-400' : 'text-red-400'}>{utensil?.name}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block mb-1">Ingredients:</span>
                      <ul className="list-disc list-inside text-neutral-300 pl-2">
                        {Object.entries(recipe.requires).map(([reqId, reqQty]) => {
                          const item = PERSONAL_ITEMS.find(i => i.id === reqId);
                          const owned = state.personalInventory[reqId] || 0;
                          return (
                            <li key={reqId} className={owned >= reqQty ? 'text-emerald-400' : 'text-red-400'}>
                              {reqQty}x {item?.name} ({owned} owned)
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCook(recipe.id)}
                    disabled={!canCook || cookingState.status === 'cooking'}
                    className="mt-auto w-full py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-orange-500 hover:bg-orange-600 text-neutral-950"
                  >
                    Cook
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {activeTab === 'create_recipe' && (
        <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 max-w-2xl">
          <h3 className="text-xl font-bold mb-6">Create Custom Recipe</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-1">Recipe Name</label>
              <input 
                type="text" 
                value={newRecipe.name}
                onChange={e => setNewRecipe(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Super Salad"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">Required Utensil</label>
              <select 
                value={newRecipe.utensil}
                onChange={e => setNewRecipe(prev => ({ ...prev, utensil: e.target.value }))}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select a utensil...</option>
                {PERSONAL_ITEMS.filter(i => i.type === 'utensil').map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">Produces</label>
              <select 
                value={newRecipe.produces}
                onChange={e => setNewRecipe(prev => ({ ...prev, produces: e.target.value }))}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select result...</option>
                {PERSONAL_ITEMS.filter(i => i.type === 'food').map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-2">Ingredients</label>
              <div className="space-y-2">
                {PERSONAL_ITEMS.filter(i => i.type === 'ingredient' || i.type === 'food').map(item => {
                  const qty = newRecipe.requires[item.id] || 0;
                  return (
                    <div key={item.id} className="flex items-center justify-between bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                      <span>{item.name}</span>
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => setNewRecipe(prev => {
                            const reqs = { ...prev.requires };
                            if (reqs[item.id] > 1) reqs[item.id]--;
                            else delete reqs[item.id];
                            return { ...prev, requires: reqs };
                          })}
                          className="w-8 h-8 rounded bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center"
                        >-</button>
                        <span className="w-4 text-center">{qty}</span>
                        <button 
                          onClick={() => setNewRecipe(prev => ({
                            ...prev, 
                            requires: { ...prev.requires, [item.id]: qty + 1 }
                          }))}
                          className="w-8 h-8 rounded bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center"
                        >+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleCreateRecipe}
              disabled={!newRecipe.name || !newRecipe.utensil || !newRecipe.produces || Object.keys(newRecipe.requires).length === 0}
              className="w-full mt-6 py-3 rounded-xl font-medium transition-colors bg-emerald-500 hover:bg-emerald-600 text-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Recipe
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
