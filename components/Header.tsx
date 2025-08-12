'use client'

import React, { useState } from 'react'
import { Menu, X, Home, Settings, LogIn, LogOut, User } from 'lucide-react'
import GoogleSignIn from './GoogleSignIn'

interface HeaderProps {
  onShowManageModal: () => void
  onAuthStateChange: (user: any) => void
}

export default function Header({ onShowManageModal, onAuthStateChange }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* App Logo/Name */}
          <div className="flex items-center">
            <Home className="w-8 h-8 text-primary-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">HomeCalcs</h1>
          </div>

          {/* Hamburger Menu Button - Always Visible */}
          <div>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Dropdown Menu - Always Below Header */}
        {isMenuOpen && (
          <div className="border-t border-gray-200 bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Google Sign In/Out */}
              <div className="px-3 py-2">
                <GoogleSignIn onAuthStateChange={onAuthStateChange} />
              </div>
              
              {/* Manage Properties */}
              <button
                onClick={() => {
                  onShowManageModal()
                  closeMenu()
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <Settings className="w-4 h-4" />
                Manage Properties
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
