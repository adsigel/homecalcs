'use client'

import React, { useEffect } from 'react'
import { Calculator, Home, TrendingUp, DollarSign, Plus } from 'lucide-react'
import { trackEmptyStateViewed } from '@/utils/amplitude'

interface EmptyStateProps {
  onShowNewPropertyDialog: () => void
}

export default function EmptyState({ onShowNewPropertyDialog }: EmptyStateProps) {
  useEffect(() => {
    // Track when empty state is viewed
    trackEmptyStateViewed()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* App Logo/Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-4">
            <Calculator className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to HomeCalcs alpha</h1>
          <p className="text-lg text-gray-600">Plan your real estate decisions</p>
        </div>

        {/* What HomeCalcs Does */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">What can you do with HomeCalcs?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Investment Analysis</h3>
              <p className="text-sm text-gray-600">Calculate PITI, DSCR, cash flow, and ROI for rental properties</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Sale Analysis</h3>
              <p className="text-sm text-gray-600">Analyze home sales, calculate net proceeds, and explore 1031 exchanges</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Multi-Property Management</h3>
              <p className="text-sm text-gray-600">Compare properties, track performance, and manage your portfolio</p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-12 text-left bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span><strong>PITI Calculator:</strong> Principal, Interest, Taxes, and Insurance calculations</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span><strong>DSCR Analysis:</strong> Debt Service Coverage Ratio for investment properties</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span><strong>Cash Flow Projections:</strong> Monthly and annual cash flow analysis</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span><strong>1031 Exchange Planning:</strong> Tax-deferred exchange calculations</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span><strong>Home Sale Analysis:</strong> Net proceeds, capital gains, and closing costs</span>
            </li>
          </ul>
        </div>

        {/* Get Started Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready to get started?</h3>
          <p className="text-gray-600 mb-6">
            Create your first property to start analyzing real estate investments and sales scenarios.
          </p>
          
          <button
            onClick={onShowNewPropertyDialog}
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Property
          </button>
        </div>

        {/* Tips */}
        <div className="text-sm text-gray-500">
          <p className="mb-2"><strong>Tip:</strong> Start with a property you're considering or already own</p>
          <p><strong>Tip:</strong> You can always edit property details later</p>
        </div>
      </div>
    </div>
  )
}
