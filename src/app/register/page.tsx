'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { authConfig } from '@/lib/auth-config'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Mountain, 
  Eye, 
  EyeOff, 
  Loader2, 
  Mail, 
  Lock,
  ArrowLeft,
  User,
  Phone,
  CheckCircle,
  Info,
  AlertCircle,
  Check,
  X
} from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailChecking, setEmailChecking] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Email availability check using RPC function
  const checkEmailAvailability = async (email: string) => {
    if (!email || email.length < 3) {
      setEmailAvailable(null)
      return
    }

    setEmailChecking(true)
    try {
      console.log('🔍 Checking email availability for:', email)
      
      // Primary method: Use RPC function
      const { data: emailExists, error: rpcError } = await supabase
        .rpc('check_email_exists', { email_to_check: email })

      if (!rpcError && emailExists !== null) {
        console.log(`${emailExists ? '❌' : '✅'} Email check result: ${emailExists ? 'exists' : 'available'}`)
        setEmailAvailable(!emailExists)
        return
      }
      
      // Fallback method: Direct query to profiles table
      if (rpcError) {
        console.log('⚠️ RPC function error:', rpcError.message, '- Trying direct query')
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', email)
          .maybeSingle()

        if (!profileError) {
          const emailExists = !!profileData
          console.log(`${emailExists ? '❌' : '✅'} Fallback check result: ${emailExists ? 'exists' : 'available'}`)
          setEmailAvailable(!emailExists)
        } else {
          console.log('⚠️ Both RPC and direct query failed:', profileError.message)
          setEmailAvailable(null)
        }
      }

    } catch (err) {
      console.error('❌ Email validation error:', err)
      setEmailAvailable(null)
    } finally {
      setEmailChecking(false)
    }
  }

  // Check password match in real-time
  useEffect(() => {
    if (!formData.password || !formData.confirmPassword) {
      setPasswordMatch(null)
    } else {
      setPasswordMatch(formData.password === formData.confirmPassword)
    }
  }, [formData.password, formData.confirmPassword])

  // Debounced email checking
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email) {
        checkEmailAvailability(formData.email)
      } else {
        setEmailAvailable(null)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [formData.email])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (error) setError('')
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Nama lengkap harus diisi.')
      return false
    }

    if (!formData.email) {
      setError('Email harus diisi.')
      return false
    }

    if (!formData.password) {
      setError('Password harus diisi.')
      return false
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter.')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak sama.')
      return false
    }

    if (!formData.phone.trim()) {
      setError('Nomor telepon harus diisi.')
      return false
    }

    // Check email availability status
    if (emailAvailable === false) {
      setError('Email sudah terdaftar. Silakan gunakan email lain.')
      return false
    }

    if (emailAvailable === null && formData.email) {
      setError('Mohon tunggu validasi email selesai.')
      return false
    }

    return true
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      console.log('📝 Attempting registration for:', formData.email)
      
      // Check if we recently attempted registration with this email
      const lastAttempt = localStorage.getItem(`reg_attempt_${formData.email}`)
      const now = Date.now()
      
      if (lastAttempt) {
        const timeDiff = now - parseInt(lastAttempt)
        const waitTime = 60000 // 1 minute in milliseconds
        
        if (timeDiff < waitTime) {
          const remainingSeconds = Math.ceil((waitTime - timeDiff) / 1000)
          setError(`Harap tunggu ${remainingSeconds} detik sebelum mencoba mendaftar lagi dengan email yang sama.`)
          setLoading(false)
          return
        }
      }
      
      // Record this attempt
      localStorage.setItem(`reg_attempt_${formData.email}`, now.toString())
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Final registration attempt
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: authConfig.getSignUpOptions({
          full_name: formData.fullName,
          phone: formData.phone
        })
      })

      if (error) {
        console.error('❌ Registration error:', error)
        
        // Handle rate limiting error with better messaging
        if (error.message.includes('For security purposes') || 
            error.message.includes('seconds') ||
            error.message.includes('rate limit') ||
            error.code === 'over_email_send_rate_limit') {
          
          // Extract wait time from error message if possible
          const match = error.message.match(/(\d+)\s*seconds/)
          const waitSeconds = match ? parseInt(match[1]) : 60
          
          setError(`Terlalu banyak percobaan registrasi. Silakan tunggu ${waitSeconds} detik sebelum mencoba lagi. Atau coba gunakan email yang berbeda.`)
          
          // Clear the attempt record so user can try with different email
          localStorage.removeItem(`reg_attempt_${formData.email}`)
          return
        }
        
        // Handle specific error cases
        if (error.message.includes('User already registered') || 
            error.message.includes('already registered') ||
            error.message.includes('already exists') ||
            error.code === 'email_address_already_in_use') {
          setError('Email sudah terdaftar. Silakan gunakan email lain atau coba masuk dengan akun yang ada.')
        } else if (error.message.includes('Invalid email')) {
          setError('Format email tidak valid. Silakan periksa kembali email Anda.')
        } else if (error.message.includes('Password should be at least')) {
          setError('Password minimal 6 karakter.')
        } else if (error.message.includes('Signup is disabled')) {
          setError('Pendaftaran sedang dinonaktifkan. Silakan hubungi administrator.')
        } else {
          setError(error.message || 'Gagal mendaftar. Silakan coba lagi.')
        }
      } else if (data.user) {
        console.log('✅ Registration successful for:', data.user.email)
        
        // Clear the attempt record on success
        localStorage.removeItem(`reg_attempt_${formData.email}`)
        
        // Check registration result and handle accordingly
        if (data.user && !data.session) {
          // User created but needs email confirmation
          console.log('✅ User created, email confirmation required')
          setSuccess('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi akun sebelum dapat masuk.')
        } else if (data.user && data.session) {
          // User created and automatically signed in
          console.log('✅ User created and signed in automatically')
          setSuccess('Pendaftaran berhasil! Anda telah masuk secara otomatis.')
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          // Unexpected case
          console.log('⚠️ Unexpected registration result:', data)
          setSuccess('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi akun.')
        }
        
        // Reset form on success
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          phone: ''
        })
        
        // Also reset email validation state
        setEmailAvailable(null)
      } else {
        setError('Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError('Terjadi kesalahan. Silakan coba lagi atau gunakan email yang berbeda.')
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
              Bergabung Bersama Kami
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Daftar untuk memulai petualangan outdoor yang tak terlupakan
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Nama Lengkap
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    placeholder="nama@example.com"
                  />
                  
                  {/* Email Status Indicator */}
                  <div className="absolute right-3 top-3">
                    {emailChecking && (
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    )}
                    {!emailChecking && emailAvailable === true && (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                    {!emailChecking && emailAvailable === false && (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
                
                {/* Email Status Message */}
                {emailAvailable === false && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Email sudah terdaftar
                  </p>
                )}
                {emailAvailable === true && (
                  <p className="text-sm text-green-600 mt-1 flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    Email tersedia
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Nomor Telepon
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    placeholder="08123456789"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    placeholder="Minimal 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Konfirmasi Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                    placeholder="Ketik ulang password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>

                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <div className="absolute right-10 top-3">
                      {passwordMatch === true && (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                      {passwordMatch === false && (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                
                {/* Password Match Message */}
                {passwordMatch === false && (
                  <p className="text-sm text-red-600 mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Password tidak sama
                  </p>
                )}
                {passwordMatch === true && (
                  <p className="text-sm text-green-600 mt-1 flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    Password cocok
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || emailChecking || emailAvailable === false || passwordMatch === false}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Mendaftar...
                  </>
                ) : (
                  'Daftar Sekarang'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-6 pb-8">
            <div className="w-full text-center space-y-4">
              <p className="text-gray-600">
                Sudah punya akun?{' '}
                <Link 
                  href="/login" 
                  className="font-medium text-green-600 hover:text-green-500 hover:underline transition-colors"
                >
                  Masuk di sini
                </Link>
              </p>
              
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Info className="h-4 w-4" />
                <span>Dengan mendaftar, Anda menyetujui Syarat & Ketentuan kami</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
