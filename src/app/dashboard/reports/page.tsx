'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { BarChart3, TrendingUp, Users } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [requestData, setRequestData] = useState<any[]>([])
  const [residentCount, setResidentCount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Requests
      const { data: requests, error } = await supabase.from('document_requests').select('document_type, status')
      
      // 2. Fetch Residents count
      const { count } = await supabase.from('residents').select('*', { count: 'exact', head: true })

      if (!error && requests) {
        // Aggregate data for the chart
        const counts = requests.reduce((acc: any, req: any) => {
          acc[req.document_type] = (acc[req.document_type] || 0) + 1
          return acc
        }, {})

        const chartData = Object.keys(counts).map(key => ({
          name: key,
          total: counts[key]
        }))

        setRequestData(chartData)
      }
      
      if (count !== null) setResidentCount(count)
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) return <div className="p-8 text-center">Loading analytics...</div>

  // Colors for the pie chart
  const COLORS = ['#0A3A2A', '#155A43', '#2B8A66', '#4CAF50'];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">Overview of barangay document requests and demographics.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-teal-100 p-3 rounded-lg"><Users className="w-6 h-6 text-[#0A3A2A]" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Residents</p>
            <p className="text-2xl font-bold text-gray-900">{residentCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg"><TrendingUp className="w-6 h-6 text-blue-600" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900">
              {requestData.reduce((acc, curr) => acc + curr.total, 0)}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-lg"><BarChart3 className="w-6 h-6 text-purple-600" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Most Requested</p>
            <p className="text-lg font-bold text-gray-900">
              {requestData.length > 0 ? requestData.sort((a,b) => b.total - a.total)[0].name : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Requests by Document Type</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="total" fill="#0A3A2A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Document Distribution</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={requestData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="total"
                >
                  {requestData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}