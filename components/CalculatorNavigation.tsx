'use client'

import React from 'react'
import { Calculator, TrendingUp, Home } from 'lucide-react'

export type CalculatorType = 'piti' | 'dscr'

interface CalculatorNavigationProps {
  activeCalculator: CalculatorType
  onCalculatorChange: (calculator: CalculatorType) => void
}

export default function CalculatorNavigation({ activeCalculator, onCalculatorChange }: CalculatorNavigationProps) {
  const calculators = [
    {
      id: 'piti' as CalculatorType,
      name: 'PITI Calculator',
      description: 'Principal, Interest, Taxes & Insurance',
      icon: Home,
    },
    {
      id: 'dscr' as CalculatorType,
      name: 'DSCR Calculator',
      description: 'Debt Service Coverage Ratio',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="card mb-6">
      <div className="flex flex-wrap gap-2">
        {calculators.map((calculator) => {
          const Icon = calculator.icon
          const isActive = activeCalculator === calculator.id
          
          return (
            <button
              key={calculator.id}
              onClick={() => onCalculatorChange(calculator.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                isActive
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-primary-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-primary-600'}`} />
              <div className="text-left">
                <div className={`font-medium ${isActive ? 'text-white' : 'text-gray-900'}`}>
                  {calculator.name}
                </div>
                <div className={`text-sm ${isActive ? 'text-primary-100' : 'text-gray-500'}`}>
                  {calculator.description}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
} 