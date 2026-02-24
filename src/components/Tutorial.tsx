import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const TUTORIAL_STEPS = [
  {
    title: "Welcome to Fury Supermarket Sim!",
    content: "In this game, you'll manage your own supermarket. Your goal is to buy products, set prices, and grow your business."
  },
  {
    title: "Wholesale Market",
    content: "Go to the Wholesale tab to buy products. You need to buy inventory before you can sell anything. Keep an eye on your storage space!"
  },
  {
    title: "My Shop",
    content: "In the My Shop tab, you can set the selling price for your products. A good markup is around 20-50%. If prices are too high, customers won't buy!"
  },
  {
    title: "Construction",
    content: "As you earn money, use the Construction tab to build more storage or expand your sales floor. This increases your capacity."
  },
  {
    title: "Bank & Stocks",
    content: "Deposit extra cash in the Bank to earn 1% daily interest, or invest in the Stock Market for higher risks and rewards."
  },
  {
    title: "Time & Multiplayer",
    content: "The shop is open from 8:00 to 22:00. In multiplayer, you share the shop and bank account with your friends. Work together to build the ultimate supermarket!"
  }
];

export default function Tutorial({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-neutral-800">
          <h3 className="font-bold text-emerald-400">Tutorial ({step + 1}/{TUTORIAL_STEPS.length})</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-300">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 min-h-[200px] flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-4">{TUTORIAL_STEPS[step].title}</h2>
          <p className="text-neutral-300 leading-relaxed">{TUTORIAL_STEPS[step].content}</p>
        </div>

        <div className="flex justify-between items-center p-4 border-t border-neutral-800 bg-neutral-950">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center space-x-1 px-4 py-2 rounded-lg text-neutral-400 hover:text-neutral-200 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
            <span>Previous</span>
          </button>
          
          {step < TUTORIAL_STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => Math.min(TUTORIAL_STEPS.length - 1, s + 1))}
              className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-medium"
            >
              <span>Next</span>
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-medium"
            >
              Start Playing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
