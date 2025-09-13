'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { 
  Mountain, 
  Eye, 
  EyeOff, 
  Loader2, 
  Mail, 
  Lock,
  ArrowLeft
} from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Test Supabase connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        console.log('🔗 Supabase connection test:', { 
          connected: !error, 
          hasSession: !!data.session,
          error: error?.message 
        })
        
        if (data.session) {
          console.log('👤 User already logged in, redirecting...')
          router.push('/dashboard')
        }
      } catch (err) {
        console.error('💥 Supabase connection failed:', err)
      }
    }
    testConnection()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Basic validation
    if (!email || !password) {
      setError('Email dan password harus diisi')
      setLoading(false)
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Format email tidak valid')
      setLoading(false)
      return
    }

    try {
      console.log('🔐 Attempting login for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), // Normalize email
        password: password,
      })

      console.log('📧 Login response:', { 
        hasUser: !!data.user, 
        hasSession: !!data.session, 
        error: error?.message 
      })

      if (error) {
        console.error('❌ Login error:', error)
        
        // Handle specific error types
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed') ||
            error.message.includes('invalid_grant')) {
          setError('Email atau password salah. Silakan periksa kembali kredensial Anda.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Email Anda belum diverifikasi. Silakan cek email untuk link verifikasi.')
        } else if (error.message.includes('Too many requests')) {
          setError('Terlalu banyak percobaan login. Silakan tunggu beberapa menit.')
        } else if (error.message.includes('User not found')) {
          setError('Akun dengan email ini tidak ditemukan. Silakan daftar terlebih dahulu.')
        } else {
          setError(`Login gagal: ${error.message}`)
        }
        return
      }

      if (data.user && data.session) {
        console.log('✅ Login successful for:', data.user.email)
        
        // Get user profile to check role
        console.log('👤 Fetching user profile for:', data.user.id)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, email, full_name')
          .eq('id', data.user.id)
          .single()

        console.log('📋 Profile fetch result:', { profile, error: profileError })

        if (profileError) {
          console.warn('⚠️ Could not fetch profile:', {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details
          })
          
          // Check if it's a missing profile (common for new users)
          if (profileError.code === 'PGRST116' || profileError.message.includes('No rows found')) {
            console.log('📝 Profile not found - attempting to create profile for user')
            
            // Try to create profile for the user
            try {
              const newProfile = {
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
                role: 'pelanggan',
                avatar_url: null
              }
              
              const { data: createdProfile, error: createError } = await supabase
                .from('profiles')
                .insert([newProfile])
                .select()
                .single()
              
              if (!createError && createdProfile) {
                console.log('✅ Profile created successfully:', createdProfile)
                toast.success('Login berhasil! Profil Anda telah dibuat.', {
                  duration: 3000,
                })
                // Use the created profile for role-based redirect
                const userRole = createdProfile.role || 'pelanggan'
                if (userRole === 'admin') {
                  router.push('/admin')
                } else {
                  router.push('/dashboard')
                }
                router.refresh()
                return
              } else {
                console.error('❌ Failed to create profile:', createError)
              }
            } catch (createErr) {
              console.error('💥 Exception creating profile:', createErr)
            }
            
            // If profile creation failed, continue with default redirect
            console.log('📝 Using default redirect due to profile creation failure')
            toast.success('Login berhasil! Selamat datang.', {
              duration: 3000,
            })
            router.push('/dashboard')
            router.refresh()
            return
          }
          
          // For permission errors, try to handle gracefully
          if (profileError.code === '42501' || profileError.message.includes('permission denied')) {
            console.error('🚫 Permission denied fetching profile - check RLS policies')
            toast.success('Login berhasil! Selamat datang kembali.', {
              duration: 3000,
            })
            router.push('/dashboard')
            router.refresh()
            return
          }
          
          // For other errors, still redirect to dashboard but log the issue
          console.error('🚫 Profile fetch error, defaulting to dashboard:', {
            error: profileError,
            message: profileError.message,
            code: profileError.code
          })
          toast.success('Login berhasil! Selamat datang kembali.', {
            duration: 3000,
          })
          router.push('/dashboard')
          router.refresh()
          return
        }

        // Role-based redirect
        const userRole = profile?.role || 'pelanggan'
        console.log('👤 User role:', userRole)
        
        if (userRole === 'admin') {
          console.log('🔑 Admin login detected, redirecting to admin dashboard')
          toast.success('Login berhasil! Selamat datang Admin.', {
            duration: 3000,
          })
          router.push('/admin')
        } else if (userRole === 'tour_leader') {
          console.log('🗺️ Tour leader login detected, redirecting to guide dashboard')
          toast.success('Login berhasil! Selamat datang Tour Leader.', {
            duration: 3000,
          })
          router.push('/guide')
        } else {
          console.log('👤 Customer login detected, redirecting to customer dashboard')
          toast.success('Login berhasil! Selamat datang kembali.', {
            duration: 3000,
          })
          router.push('/dashboard')
        }
        
        router.refresh()
      } else {
        console.error('❌ No user or session returned')
        setError('Login gagal. Tidak ada sesi yang dibuat.')
      }
    } catch (err) {
      console.error('💥 Unexpected login error:', err)
      setError('Terjadi kesalahan tidak terduga. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to Home */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="text-gray-600 hover:text-gray-900">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Home
            </Link>
          </Button>
        </div>

        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Mountain className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold">
                <span className="text-green-600">HiLink</span> Adventure
              </span>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Selamat Datang Kembali
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Masuk untuk melanjutkan petualangan Anda
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription>
                  {error}
                  {error.includes('Email atau password salah') && (
                    <div className="mt-2 text-sm">
                      <Link 
                        href="/forgot-password" 
                        className="text-red-700 underline hover:text-red-800"
                      >
                        Lupa password?
                      </Link>
                      {' atau '}
                      <Link 
                        href="/register" 
                        className="text-red-700 underline hover:text-red-800"
                      >
                        Daftar akun baru
                      </Link>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 border-gray-200 focus:border-green-400 focus:ring-green-400"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-green-400 focus:ring-green-400"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-green-600 hover:text-green-700 hover:underline"
                >
                  Lupa password?
                </Link>
              </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium text-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Masuk...
                  </>
                ) : (
                  'Masuk'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">atau</span>
              </div>
            </div>

            {/* Social Login (Optional - untuk implementasi masa depan) */}
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full h-12 border-gray-200 hover:bg-gray-50"
                disabled
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Masuk dengan Google
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            <div className="text-center text-gray-600">
              Belum punya akun?{' '}
              <Link 
                href="/register" 
                className="text-green-600 hover:text-green-700 font-medium hover:underline"
              >
                Daftar sekarang
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <div className="mb-4">
            Dengan masuk, Anda menyetujui{' '}
            <Link href="/terms" className="text-green-600 hover:underline">
              Syarat & Ketentuan
            </Link>{' '}
            dan{' '}
            <Link href="/privacy" className="text-green-600 hover:underline">
              Kebijakan Privasi
            </Link>{' '}
            kami.
          </div>
          
          {/* Troubleshooting Tips */}
          <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-2">💡 Tips jika gagal login:</p>
            <ul className="text-left space-y-1">
              <li>• Pastikan email dan password benar</li>
              <li>• Cek email verifikasi jika akun baru</li>
              <li>• Gunakan "Lupa password?" jika lupa</li>
              <li>• Coba refresh halaman jika masih error</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

