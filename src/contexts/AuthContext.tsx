// src/contexts/AuthContext.tsx
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  full_name: string | null
  role: string | null
  avatar_url: string | null
  email: string | null
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Session timeout handler
  const handleSessionTimeout = () => {
    console.warn('Session expired, redirecting to login')
    setUser(null)
    setProfile(null)
    setSession(null)
    router.push('/login?reason=session_expired')
  }

  // Refresh session manually
  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error refreshing session:', error)
        handleSessionTimeout()
        return
      }

      if (session) {
        setSession(session)
        setUser(session.user)
        await fetchUserProfile(session.user.id)
      } else {
        setSession(null)
        setUser(null)
        setProfile(null)
      }
    } catch (error) {
      console.error('Error in refreshSession:', error)
      handleSessionTimeout()
    }
  }

  // Fetch user profile with auto-create fallback
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user:', userId)
      console.log('🔗 Supabase client status:', !!supabase)
      
      // Test basic connectivity first
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true })
      
      console.log('📊 Profiles table accessibility test:', { 
        canAccess: !testError, 
        error: testError?.message,
        count: testData 
      })
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url, email')
        .eq('id', userId)
        .single()

      console.log('📥 Raw Supabase response:', { 
        profile, 
        error,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        isErrorEmpty: !error || Object.keys(error || {}).length === 0
      })

      if (error) {
        // Handle completely empty or null error object
        if (!error || (typeof error === 'object' && Object.keys(error).length === 0)) {
          console.warn('⚠️ Received empty error object, treating as profile not found')
          console.log('📝 Empty error detected, attempting to create profile for user')
          
          const createdProfile = await createUserProfile(userId)
          if (createdProfile) {
            setProfile(createdProfile)
          } else {
            setProfile(null)
          }
          return
        }

        // Handle error object with potentially undefined properties
        const errorInfo = {
          message: error?.message || 'Unknown error',
          details: error?.details || 'No details available', 
          code: error?.code || 'UNKNOWN_ERROR',
          hint: error?.hint || 'No hint available',
          rawError: JSON.stringify(error),
          errorType: typeof error,
          errorKeys: Object.keys(error || {}),
          hasMessage: !!(error?.message),
          hasCode: !!(error?.code)
        }
        
        console.error('❌ Error fetching profile:', errorInfo)

        // Check if it's a missing profile issue
        if (errorInfo.code === 'PGRST116' || 
            errorInfo.message.includes('No rows found') ||
            errorInfo.message.includes('not found') ||
            errorInfo.code === 'PGRST301') {
          console.log('📝 Profile not found, attempting to create profile for new user')
          
          const createdProfile = await createUserProfile(userId)
          if (createdProfile) {
            setProfile(createdProfile)
            return
          }
          
          setProfile(null)
          return
        }

        // Check if it's a permission issue
        if (errorInfo.code === '42501' || 
            errorInfo.message.includes('permission denied') ||
            errorInfo.message.includes('access denied')) {
          console.error('🚫 Permission denied accessing profiles table. Check RLS policies.')
          setProfile(null)
          return
        }

        // Check for network or connection issues
        if (errorInfo.code === 'NETWORK_ERROR' || 
            errorInfo.message.includes('network') ||
            errorInfo.message.includes('connection')) {
          console.error('🌐 Network error fetching profile, will retry later')
          setProfile(null)
          return
        }

        // For unknown/empty errors, try to handle gracefully
        if (errorInfo.code === 'UNKNOWN_ERROR' || !errorInfo.message || errorInfo.message === 'Unknown error') {
          console.warn('⚠️ Empty or unknown profile fetch error, attempting profile creation')
          
          // Try to create profile as fallback
          const createdProfile = await createUserProfile(userId)
          if (createdProfile) {
            setProfile(createdProfile)
          } else {
            setProfile(null)
          }
          return
        }

        // For other errors, log but don't crash
        console.error('⚠️ Unexpected profile fetch error:', errorInfo)
        setProfile(null)
        return
      }

      // Validate profile data
      if (!profile) {
        console.log('📝 No profile data returned (null), attempting to create profile')
        const createdProfile = await createUserProfile(userId)
        if (createdProfile) {
          setProfile(createdProfile)
        } else {
          setProfile(null)
        }
        return
      }

      console.log('✅ Profile fetched successfully:', profile)
      setProfile(profile)
    } catch (error) {
      console.error('💥 Exception in fetchUserProfile:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown exception',
        stack: error instanceof Error ? error.stack : undefined
      })
      setProfile(null)
    }
  }

  // Create user profile if it doesn't exist
  const createUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('🆕 Creating profile for user:', userId)
      
      // Get user data from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('❌ Could not get user data for profile creation:', userError)
        return null
      }
      
      // Create profile with basic data
      const newProfile = {
        id: userId,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        role: 'pelanggan' as const,
        avatar_url: null
      }
      
      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single()
      
      if (createError) {
        console.error('❌ Error creating profile:', createError)
        return null
      }
      
      console.log('✅ Profile created successfully:', createdProfile)
      return createdProfile
    } catch (error) {
      console.error('💥 Exception creating profile:', error)
      return null
    }
  }

  // Sign out with proper cleanup
  const signOut = async () => {
    try {
      // Don't set loading immediately to prevent UI flash
      // setLoading(true)
      
      // Sign out from Supabase first
      const { error } = await supabase.auth.signOut({
        scope: 'global' // Sign out from all sessions
      })
      
      if (error) {
        console.error('Error signing out:', error)
        throw error
      }
      
      // Clear local state after successful signout
      setUser(null)
      setProfile(null)
      setSession(null)
      
      // Clear any cached data
      localStorage.clear()
      sessionStorage.clear()
      
      // Force redirect to home
      router.push('/')
      router.refresh()
      
    } catch (error) {
      console.error('Error in signOut:', error)
      // Re-throw to let the caller handle it
      throw error
    }
  }

  useEffect(() => {
    let mounted = true
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (error) {
          console.error('Error getting initial session:', error)
          setLoading(false)
          return
        }

        if (session) {
          setSession(session)
          setUser(session.user)
          await fetchUserProfile(session.user.id)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('Auth state change:', event, session?.user?.id)

        try {
          switch (event) {
            case 'SIGNED_IN':
              if (session) {
                setSession(session)
                setUser(session.user)
                await fetchUserProfile(session.user.id)
              }
              break
              
            case 'SIGNED_OUT':
              setSession(null)
              setUser(null)
              setProfile(null)
              break
              
            case 'TOKEN_REFRESHED':
              if (session) {
                setSession(session)
                setUser(session.user)
                // Profile should still be the same, no need to refetch
              }
              break
              
            case 'USER_UPDATED':
              if (session) {
                setSession(session)
                setUser(session.user)
                await fetchUserProfile(session.user.id)
              }
              break
              
            default:
              // Handle session expiry or invalid token
              if (!session) {
                setSession(null)
                setUser(null)
                setProfile(null)
              }
          }
        } catch (error) {
          console.error('Error handling auth state change:', error)
        }
        
        setLoading(false)
      }
    )

    // Auto-refresh session every 30 minutes
    const refreshInterval = setInterval(async () => {
      if (session && user) {
        console.log('Auto-refreshing session...')
        await refreshSession()
      }
    }, 30 * 60 * 1000) // 30 minutes

    // Check session validity every 5 minutes
    const validityCheckInterval = setInterval(async () => {
      if (session) {
        const now = new Date()
        const expiresAt = new Date(session.expires_at! * 1000)
        
        // If session expires in less than 5 minutes, refresh it
        if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
          console.log('Session expiring soon, refreshing...')
          await refreshSession()
        }
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => {
      mounted = false
      subscription.unsubscribe()
      clearInterval(refreshInterval)
      clearInterval(validityCheckInterval)
    }
  }, [])

  const value = {
    user,
    profile, 
    session,
    loading,
    signOut,
    refreshSession
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
