import React, { useState } from 'react';
import { useGameEngine } from '../useGameEngine';

export default function Bank({ engine }: { engine: ReturnType<typeof useGameEngine> }) {
  const { state, bankDeposit, bankWithdraw, takeLoan, repayLoan } = engine;
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">First National Bank</h2>
        <p className="text-neutral-400 mt-1">Manage your finances. 1% daily interest on deposits, 2% on loans.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Savings Account */}
        <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800">
          <h3 className="text-xl font-bold mb-2">Savings Account</h3>
          <p className="text-3xl font-mono text-emerald-400 mb-6">${state.bankBalance.toFixed(2)}</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-neutral-500 uppercase tracking-wider mb-1 block">Deposit</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Amount"
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => {
                    bankDeposit(parseFloat(depositAmount));
                    setDepositAmount('');
                  }}
                  disabled={!depositAmount || parseFloat(depositAmount) <= 0 || parseFloat(depositAmount) > state.money}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                  Deposit
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-neutral-500 uppercase tracking-wider mb-1 block">Withdraw</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Amount"
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => {
                    bankWithdraw(parseFloat(withdrawAmount));
                    setWithdrawAmount('');
                  }}
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > state.bankBalance}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loan Account */}
        <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800">
          <h3 className="text-xl font-bold mb-2">Active Loan</h3>
          <p className="text-3xl font-mono text-red-400 mb-6">${state.loanAmount.toFixed(2)}</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-neutral-500 uppercase tracking-wider mb-1 block">Take Loan</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="Amount"
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => {
                    takeLoan(parseFloat(loanAmount));
                    setLoanAmount('');
                  }}
                  disabled={!loanAmount || parseFloat(loanAmount) <= 0}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                  Borrow
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-neutral-500 uppercase tracking-wider mb-1 block">Repay Loan</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  placeholder="Amount"
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => {
                    repayLoan(parseFloat(repayAmount));
                    setRepayAmount('');
                  }}
                  disabled={!repayAmount || parseFloat(repayAmount) <= 0 || parseFloat(repayAmount) > state.money || state.loanAmount <= 0}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-medium disabled:opacity-50 transition-colors"
                >
                  Repay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
