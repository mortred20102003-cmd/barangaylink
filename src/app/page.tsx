import Link from 'next/link'
import { Anchor, FileText, Home, Shield, AlertCircle, User, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* Navigation */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#0A3A2A] rounded-full p-2">
              <Anchor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0A3A2A] leading-tight">Barangay Lamion</h1>
              <p className="text-xs text-gray-500">LamionLink · Bongao, Tawi-Tawi</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-[#0A3A2A]">Home</Link>
            <Link href="#about" className="hover:text-[#0A3A2A]">About</Link>
            <Link href="#services" className="hover:text-[#0A3A2A]">Services</Link>
            <Link href="/login" className="hover:text-[#0A3A2A]">Login</Link>
            <Link href="/register" className="bg-[#0A3A2A] text-white px-5 py-2.5 rounded-lg hover:bg-[#155A43] transition-colors">
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#0A3A2A] text-white pt-20 pb-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Text */}
            <div className="space-y-6">
              <span className="inline-block bg-[#155A43] text-teal-100 text-xs font-bold px-3 py-1 rounded-full tracking-wider uppercase">
                Barangay E-Services
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Modernizing Barangay Services Through Digital Innovation
              </h1>
              <p className="text-lg text-teal-50/80 max-w-lg">
                Request certificates, track your applications and keep your household records up to date, all without waiting in line at the barangay hall.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/login" className="bg-yellow-400 text-[#0A3A2A] px-6 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors shadow-lg">
                  Request Document
                </Link>
                <Link href="/register" className="border border-white/30 text-white px-6 py-3 rounded-lg font-bold hover:bg-white/10 transition-colors">
                  Register Now
                </Link>
              </div>
            </div>

            {/* Right Floating Card */}
            <div className="lg:ml-auto w-full max-w-md">
              <div className="bg-white text-gray-900 rounded-2xl p-6 shadow-2xl relative">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold">My request</h3>
                    <p className="text-sm text-gray-500 mt-1">Certificate of Indigency</p>
                    <p className="text-xs text-gray-400">Request ID 003</p>
                  </div>
                  <span className="bg-[#E8F5F1] text-[#0A3A2A] text-xs font-bold px-3 py-1 rounded-full">
                    Ready for Pickup
                  </span>
                </div>
                
                {/* Mock Progress Bar */}
                <div className="relative pt-2">
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-100">
                    <div className="w-3/4 bg-[#0A3A2A] rounded-full"></div>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-gray-400">
                    <span className="text-[#0A3A2A]">Submitted</span>
                    <span className="text-[#0A3A2A]">Review</span>
                    <span className="text-[#0A3A2A]">Approved</span>
                    <span>Released</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Quick Services Section */}
      <section id="services" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Quick Services</h2>
          <p className="text-gray-500">Choose a service to start. You will be asked to sign in first.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 text-[#0A3A2A]" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Barangay Clearance</h3>
            <p className="text-xs text-gray-500 leading-relaxed">For employment, travel, business and other official purposes.</p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center mb-4">
              <Home className="w-5 h-5 text-[#0A3A2A]" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Certificate of Residency</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Proof that you live in Barangay Lamion.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-[#0A3A2A]" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Certificate of Indigency</h3>
            <p className="text-xs text-gray-500 leading-relaxed">For assistance programs and fee waivers.</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center mb-4">
              <AlertCircle className="w-5 h-5 text-[#0A3A2A]" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Blotter Assistance</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Get guidance on filing a report with the barangay.</p>
          </div>

          {/* Card 5 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center mb-4">
              <User className="w-5 h-5 text-[#0A3A2A]" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Resident Verification</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Confirm your account so you can request documents online.</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-[#E8F5F1] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">About LamionLink</h2>
              <p className="text-gray-600 leading-relaxed">
                LamionLink is the Barangay Lamion portal for resident records and document services. Residents apply online, and barangay staff review, approve and release documents from one system.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-[#0A3A2A] font-bold text-xl mb-2">1 · Register</div>
                <p className="text-xs text-gray-500">Create an account and verify your identity.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-[#0A3A2A] font-bold text-xl mb-2">2 · Request</div>
                <p className="text-xs text-gray-500">Choose a document and upload a valid ID.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-[#0A3A2A] font-bold text-xl mb-2">3 · Pick up</div>
                <p className="text-xs text-gray-500">Track progress, then collect it at the hall.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}