'use client'

import { useState, useEffect } from 'react'
import { 
  ShieldCheck, Mail, CheckCircle2, XCircle, User,
  MapPin, Phone, Building2, Clock, Edit2, Upload, PenTool,
  Bell, MessageSquare, Siren, Save, X
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import AdminGuard from '@/components/AdminGuard'

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [userRole, setUserRole] = useState('resident')
  const [lastLogin, setLastLogin] = useState('')
  
  const [profile, setProfile] = useState({
    fullname: '',
    position: '',
    barangay: '',
    contact: '',
    signature_url: '',
    auto_sign_enabled: false,
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState(profile)
  const [saving, setSaving] = useState(false)

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    system: true,
    chat: true,
  })

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserEmail(user.email || '')
      setLastLogin(new Date(user.last_sign_in_at || user.created_at).toLocaleString('en-US', {
        dateStyle: 'medium', timeStyle: 'short'
      }))

      // Determine Role
      const storedRole = localStorage.getItem('userRole')
      let role = 'resident'
      if (user.email === 'mchaeldeleon@gmail.com') role = 'super_admin'
      else if (storedRole) role = storedRole
      setUserRole(role)

      // Fetch profile data
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        const loadedProfile = {
          fullname: data.fullname || '',
          position: data.position || (role === 'super_admin' ? 'Barangay Captain' : role === 'secretary' ? 'Barangay Secretary' : 'Barangay Staff'),
          barangay: data.barangay || 'Lamion',
          contact: data.contact || '',
          signature_url: data.signature_url || '',
          auto_sign_enabled: data.auto_sign_enabled || false,
        }
        setProfile(loadedProfile)
        setEditForm(loadedProfile)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({
          fullname: editForm.fullname,
          position: editForm.position,
          barangay: editForm.barangay,
          contact: editForm.contact,
          auto_sign_enabled: editForm.auto_sign_enabled,
        })
        .eq('id', user.id)

      if (error) {
        alert("Error saving profile: " + error.message)
      } else {
        setProfile(editForm)
        setIsEditing(false)
      }
    }
    setSaving(false)
  }

  const simulateSignatureUpload = async () => {
    alert("Signature uploaded successfully! (Simulation)")
    const fakeUrl = 'https://via.placeholder.com/200x80.png?text=Signature'
    setProfile({ ...profile, signature_url: fakeUrl })
    setEditForm({ ...editForm, signature_url: fakeUrl })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ signature_url: fakeUrl }).eq('id', user.id)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>

  const formatRole = (r: string) => {
    if (r === 'super_admin' || r === 'captain') return 'Barangay Captain'
    if (r === 'secretary') return 'Barangay Secretary'
    if (r === 'staff') return 'Barangay Staff'
    return r
  }

  const roleColor = userRole === 'super_admin' || userRole === 'captain' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                    userRole === 'secretary' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    'bg-green-100 text-green-800 border-green-200'

  return (
    <AdminGuard>
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
            <p className="text-gray-500 mt-1">Manage your identity, security, and system preferences.</p>
          </div>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-[#0A3A2A] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#155A43] transition-colors">
              <Edit2 className="w-4 h-4" /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => { setIsEditing(false); setEditForm(profile) }} className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 bg-[#0A3A2A] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#155A43] transition-colors disabled:opacity-50">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-32 bg-[#0A3A2A]"></div>
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="h-24 w-24 rounded-full bg-white p-1">
                <div className="h-full w-full rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-3xl font-bold text-[#0A3A2A]">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${roleColor}`}>
                {formatRole(userRole)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><User className="w-3 h-3" /> Full Name</label>
                {isEditing ? (
                  <input type="text" value={editForm.fullname} onChange={e => setEditForm({...editForm, fullname: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                ) : (
                  <p className="text-lg font-semibold text-gray-900 mt-1">{profile.fullname || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><Mail className="w-3 h-3" /> Email Address</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">{userEmail}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><Building2 className="w-3 h-3" /> Position</label>
                {isEditing ? (
                  <input type="text" value={editForm.position} onChange={e => setEditForm({...editForm, position: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                ) : (
                  <p className="text-lg font-semibold text-gray-900 mt-1">{profile.position || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><MapPin className="w-3 h-3" /> Barangay</label>
                {isEditing ? (
                  <input type="text" value={editForm.barangay} onChange={e => setEditForm({...editForm, barangay: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                ) : (
                  <p className="text-lg font-semibold text-gray-900 mt-1">{profile.barangay || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><Phone className="w-3 h-3" /> Contact Number</label>
                {isEditing ? (
                  <input type="text" value={editForm.contact} onChange={e => setEditForm({...editForm, contact: e.target.value})} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                ) : (
                  <p className="text-lg font-semibold text-gray-900 mt-1">{profile.contact || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> Last Login</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">{lastLogin}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Role Hierarchy */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#0A3A2A]" /> Role Hierarchy</h2>
            <div className="space-y-3 text-sm">
              <InfoRow label="Role Level" value={userRole === 'super_admin' || userRole === 'captain' ? 'Super Administrator' : userRole === 'secretary' ? 'Administrator' : 'Standard User'} />
              <InfoRow label="Department" value={userRole === 'super_admin' || userRole === 'captain' ? 'Executive Office' : userRole === 'secretary' ? 'Records & Administration' : 'Operations'} />
              <InfoRow label="Authority Level" value={userRole === 'super_admin' || userRole === 'captain' ? 'Full Access' : userRole === 'secretary' ? 'Elevated Access' : 'Restricted Access'} />
              <InfoRow label="Account Status" value="Active" valueClass="text-green-600 font-bold" />
            </div>
          </div>

          {/* Digital Signature */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><PenTool className="w-5 h-5 text-[#0A3A2A]" /> Digital Signature</h2>
            {profile.signature_url ? (
              <div className="space-y-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center h-24">
                  <img src={profile.signature_url} alt="Signature" className="max-h-full max-w-full" />
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">Auto-sign Documents</span>
                  <button 
                    onClick={() => setProfile({...profile, auto_sign_enabled: !profile.auto_sign_enabled})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.auto_sign_enabled ? 'bg-[#0A3A2A]' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile.auto_sign_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <button onClick={simulateSignatureUpload} className="w-full text-sm text-[#0A3A2A] font-semibold hover:underline">Replace Signature</button>
              </div>
            ) : (
              <div onClick={simulateSignatureUpload} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">Upload Signature</p>
                <p className="text-xs text-gray-500 mt-1">PNG with transparent background recommended</p>
              </div>
            )}
          </div>

          {/* Permission Matrix */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#0A3A2A]" /> Permission Matrix</h2>
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Feature</th>
                    <th className="px-4 py-3 font-semibold text-center">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <PermissionRow label="Resident Management" allowed={userRole !== 'staff'} />
                  <PermissionRow label="Document Processing" allowed={true} />
                  <PermissionRow label="Document Approval (Sign)" allowed={userRole === 'super_admin' || userRole === 'captain'} />
                  <PermissionRow label="Verification Approval" allowed={userRole === 'super_admin' || userRole === 'captain'} />
                  <PermissionRow label="Reports & Analytics" allowed={userRole !== 'staff'} />
                  <PermissionRow label="User Management" allowed={userRole === 'super_admin' || userRole === 'captain'} />
                  <PermissionRow label="System Settings" allowed={userRole === 'super_admin' || userRole === 'captain'} />
                </tbody>
              </table>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-[#0A3A2A]" /> Notification Preferences</h2>
            <div className="space-y-3">
              <ToggleRow label="Email Notifications" enabled={notifications.email} toggle={() => setNotifications({...notifications, email: !notifications.email})} />
              <ToggleRow label="SMS Notifications" enabled={notifications.sms} toggle={() => setNotifications({...notifications, sms: !notifications.sms})} />
              <ToggleRow label="System Notifications" enabled={notifications.system} toggle={() => setNotifications({...notifications, system: !notifications.system})} />
              <ToggleRow label="Chat Notifications" enabled={notifications.chat} toggle={() => setNotifications({...notifications, chat: !notifications.chat})} />
            </div>
          </div>

          {/* Emergency & Messaging */}
          <div className="space-y-6">
            <div className="bg-red-50 p-6 rounded-xl border border-red-200">
              <h2 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2"><Siren className="w-5 h-5" /> Emergency Access</h2>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-white border border-red-200 text-red-700 font-semibold py-2 rounded-lg hover:bg-red-100 transition-colors text-sm">Incident Reports</button>
                <button className="bg-white border border-red-200 text-red-700 font-semibold py-2 rounded-lg hover:bg-red-100 transition-colors text-sm">Disaster Reports</button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[#0A3A2A]" /> Staff Messaging</h2>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Resident Chats</span>
                <span className="font-bold text-gray-900">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Unread</span>
                <span className="font-bold text-red-600">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}

// --- Small Helper Components ---
function InfoRow({ label, value, valueClass = 'text-gray-900 font-medium' }: { label: string, value: string, valueClass?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  )
}

function PermissionRow({ label, allowed }: { label: string, allowed: boolean }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-gray-700">{label}</td>
      <td className="px-4 py-3 text-center">
        {allowed ? <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" /> : <XCircle className="w-5 h-5 text-gray-300 mx-auto" />}
      </td>
    </tr>
  )
}

function ToggleRow({ label, enabled, toggle }: { label: string, enabled: boolean, toggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700">{label}</span>
      <button onClick={toggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-[#0A3A2A]' : 'bg-gray-300'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}