import React from 'react'
import { signInWithGoogle, signOutUser, getCurrentUser } from '@/utils/firebase'
import { trackGoogleSignIn } from '@/utils/amplitude'

interface GoogleSignInProps {
  onAuthStateChange: (user: any) => void
}

export default function GoogleSignIn({ onAuthStateChange }: GoogleSignInProps) {
  const currentUser = getCurrentUser()

  const handleSignIn = async () => {
    try {
      console.log('🔄 Starting Google sign-in process...')
      const user = await signInWithGoogle()
      console.log('✅ Google sign-in successful:', user.email)
      
      // Track successful sign-in with Amplitude
      trackGoogleSignIn(user.uid, user.email || undefined)
      
      onAuthStateChange(user)
    } catch (error: any) {
      console.error('❌ Sign-in failed:', error)
      console.error('❌ Error code:', error.code)
      console.error('❌ Error message:', error.message)
      
      // Show user-friendly error message
      if (error.code === 'auth/popup-closed-by-user') {
        alert('Sign-in was cancelled. Please try again.')
      } else if (error.code === 'auth/popup-blocked') {
        alert('Pop-up was blocked. Please allow pop-ups for this site and try again.')
      } else if (error.code === 'auth/unauthorized-domain') {
        alert('This domain is not authorized for Google sign-in. Please contact support.')
      } else {
        alert(`Sign-in failed: ${error.message}`)
      }
    }
  }

  const handleSignOut = async () => {
    try {
      await signOutUser()
      onAuthStateChange(null)
    } catch (error) {
      console.error('Sign-out failed:', error)
    }
  }

  if (currentUser) {
    return (
      <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">
            Signed in as {currentUser.email}
          </p>
          <p className="text-xs text-green-600">
            Your properties will sync across all devices
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex-1">
        <p className="text-sm font-medium text-blue-800">
          Sign in to sync properties across devices
        </p>
        <p className="text-xs text-blue-600">
          Use your Google account for seamless access
        </p>
      </div>
      <button
        onClick={handleSignIn}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Sign In with Google
      </button>
    </div>
  )
}
