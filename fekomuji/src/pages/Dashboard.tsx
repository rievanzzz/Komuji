import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image: string;
  status: 'registered' | 'completed' | 'upcoming';
  certificate?: boolean;
}

interface UserStats {
  totalEvents: number;
  completedEvents: number;
  certificates: number;
  upcomingEvents: number;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock user data - replace with actual API calls
  const userStats: UserStats = {
    totalEvents: 12,
    completedEvents: 8,
    certificates: 6,
    upcomingEvents: 4
  };

  const myEvents: Event[] = [
    {
      id: 1,
      title: "Festival Seni Budaya",
      date: "15 Des 2024",
      time: "09:30 WIB",
      location: "Aula Sekolah",
      category: "Akademik",
      image: "/api/placeholder/300/200",
      status: "registered"
    },
    {
      id: 2,
      title: "Kompetisi Robotika",
      date: "10 Nov 2024",
      time: "13:00 WIB",
      location: "Lab Komputer",
      category: "Seni",
      image: "/api/placeholder/300/200",
      status: "completed",
      certificate: true
    },
    {
      id: 3,
      title: "Workshop Programming",
      date: "5 Nov 2024",
      time: "15:30 WIB",
      location: "Lab IT",
      category: "Akademik",
      image: "/api/placeholder/300/200",
      status: "completed",
      certificate: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-['Helvetica_Neue',_Helvetica,_Arial,_sans-serif]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Miluan</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => setActiveTab("overview")}
                className={`font-medium transition-colors ${activeTab === "overview" ? "text-green-600" : "text-gray-600 hover:text-gray-900"}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab("events")}
                className={`font-medium transition-colors ${activeTab === "events" ? "text-green-600" : "text-gray-600 hover:text-gray-900"}`}
              >
                Event Saya
              </button>
              <button 
                onClick={() => setActiveTab("certificates")}
                className={`font-medium transition-colors ${activeTab === "certificates" ? "text-green-600" : "text-gray-600 hover:text-gray-900"}`}
              >
                Sertifikat
              </button>
              <button 
                onClick={() => setActiveTab("history")}
                className={`font-medium transition-colors ${activeTab === "history" ? "text-green-600" : "text-gray-600 hover:text-gray-900"}`}
              >
                Riwayat
              </button>
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden sm:block">
                <input
                  type="text"
                  placeholder="Cari event saya..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
                <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                </svg>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">JD</span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-700">John Doe</div>
                    <div className="text-xs text-gray-500">john@example.com</div>
                  </div>
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">Selamat datang kembali, John! 👋</h1>
                <p className="text-green-100">Anda memiliki {userStats.upcomingEvents} event yang akan datang</p>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Total Event", value: userStats.totalEvents, icon: "📅", color: "bg-blue-500" },
            { title: "Event Selesai", value: userStats.completedEvents, icon: "✅", color: "bg-green-500" },
            { title: "Sertifikat", value: userStats.certificates, icon: "🏆", color: "bg-yellow-500" },
            { title: "Event Mendatang", value: userStats.upcomingEvents, icon: "⏰", color: "bg-purple-500" }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* My Events Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Event Saya</h2>
            <Link to="/events" className="text-green-600 hover:text-green-700 font-medium text-sm">
              Lihat Semua
            </Link>
          </div>

          <div className="space-y-4">
            {myEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600">{event.date} • {event.time}</p>
                    <p className="text-xs text-gray-500">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {event.certificate && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      🏆 Sertifikat
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    event.status === 'completed' ? 'bg-green-100 text-green-800' :
                    event.status === 'registered' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.status === 'completed' ? '✅ Selesai' :
                     event.status === 'registered' ? '📝 Terdaftar' :
                     '⏰ Mendatang'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[
            {
              title: "Cari Event Baru",
              description: "Temukan event menarik untuk diikuti",
              icon: "🔍",
              color: "from-blue-500 to-blue-600",
              action: "/events"
            },
            {
              title: "Download Sertifikat",
              description: "Unduh sertifikat event yang telah selesai",
              icon: "📜",
              color: "from-yellow-500 to-yellow-600",
              action: "/certificates"
            },
            {
              title: "Kelola Profil",
              description: "Update informasi profil Anda",
              icon: "👤",
              color: "from-purple-500 to-purple-600",
              action: "/profile"
            }
          ].map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`bg-gradient-to-br ${action.color} rounded-2xl p-6 text-white cursor-pointer hover:scale-105 transition-transform`}
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <h3 className="font-bold text-lg mb-2">{action.title}</h3>
              <p className="text-white/80 text-sm">{action.description}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
