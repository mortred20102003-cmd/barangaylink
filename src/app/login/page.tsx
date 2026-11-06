'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#F3F4F6] overflow-hidden font-sans">
      
      {/* Background Floating Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-[#0A3A2A] opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[25rem] h-[25rem] bg-[#155A43] opacity-10 rounded-full blur-2xl"></div>
      <div className="absolute top-[20%] right-[10%] w-32 h-32 bg-white shadow-xl rounded-full opacity-60"></div>
      <div className="absolute bottom-[20%] left-[15%] w-20 h-20 bg-white shadow-lg rounded-full opacity-60"></div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-md px-8 py-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white">
        
        {/* Floating Lock Icon */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white p-4 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.08)]">
          <div className="bg-[#0A3A2A] p-3 rounded-full">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="text-center mb-8 mt-4">
          <h2 className="text-3xl font-extrabold text-[#0A3A2A]">Welcome</h2>
          <p className="text-sm text-gray-500 mt-2">Login to continue your journey</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-6 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none text-gray-900 rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0A3A2A] transition-all placeholder-gray-400"
              placeholder="Email Address"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-none text-gray-900 rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0A3A2A] transition-all placeholder-gray-400"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-gray-400 hover:text-[#0A3A2A]"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Remember & Forgot Password */}
          <div className="flex items-center justify-between text-sm pt-1">
            <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
              <input type="checkbox" className="rounded text-[#0A3A2A] focus:ring-[#0A3A2A]" />
              Remember me
            </label>
            <Link href="#" className="text-[#0A3A2A] font-semibold hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A3A2A] text-white py-3.5 rounded-2xl font-bold text-lg shadow-lg hover:bg-[#155A43] hover:shadow-xl transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Register Link & Staff Login */}
        <div className="mt-8 text-center text-sm text-gray-500 space-y-4">
          <p>
            New to LamionLink?{' '}
            <Link href="/register" className="text-[#0A3A2A] font-bold hover:underline">
              Register Account
            </Link>
          </p>
          
          <div className="pt-4 border-t border-gray-200">
            <Link href="/staff-login" className="text-[#0A3A2A] font-bold hover:underline flex items-center justify-center gap-1">
              Barangay staff? Sign in here &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}