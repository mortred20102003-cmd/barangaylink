import Sidebar from '../../components/Sidebar'
import ChatWidget from '../../components/ChatWidget' // Add this import

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
      
      {/* Floating Chat Widget */}
      <ChatWidget /> 
    </div>
  )
}