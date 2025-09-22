import React from 'react';
import { motion } from 'framer-motion';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="relative bg-white pt-32 pb-20 px-4 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-3">
            <div className="grid grid-cols-20 gap-4 h-full">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="border-r border-gray-200"></div>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Main Heading */}
              <div>
                <h1 className="text-5xl lg:text-6xl font-semibold text-gray-900 leading-tight mb-6">
                  Put people first
                </h1>
                
                <div className="space-y-6 max-w-xl">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Fast, user-friendly and engaging - turn HR into people and culture and streamline your daily operations with your own branded app.
                  </p>
                  
                  {/* Email Input and Button */}
                  <div className="flex gap-3">
                    <input
                      type="email"
                      placeholder="Enter work email"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Book a demo
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-4xl font-semibold text-gray-900 mb-1">75.2%</div>
                  <div className="text-sm text-gray-600">Average daily activity</div>
                </div>
                <div>
                  <div className="text-4xl font-semibold text-gray-900 mb-1">~20k</div>
                  <div className="text-sm text-gray-600">Average daily users</div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {[...Array(4)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <svg className="w-5 h-5 text-gray-300 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" fill="url(#half)" />
                    <defs>
                      <linearGradient id="half">
                        <stop offset="50%" stopColor="#fbbf24" />
                        <stop offset="50%" stopColor="#d1d5db" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <span className="text-lg font-semibold text-gray-900">4.5</span>
                <span className="text-sm text-gray-500">Average user rating</span>
              </div>
            </motion.div>

            {/* Right Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* 3D Isometric Illustration */}
              <div className="relative w-full h-96 flex items-center justify-center">
                <svg viewBox="0 0 400 300" className="w-full h-full max-w-lg">
                  <defs>
                    {/* Gradients for 3D effect */}
                    <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#f1f5f9" />
                    </linearGradient>
                    <linearGradient id="deviceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f8fafc" />
                      <stop offset="100%" stopColor="#e2e8f0" />
                    </linearGradient>
                    <linearGradient id="shadowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#64748b" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#64748b" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>

                  {/* Main Device (Tablet/Laptop) */}
                  <g transform="translate(50, 50)">
                    {/* Device shadow */}
                    <path d="M10 180 L280 180 L300 200 L30 200 Z" fill="url(#shadowGradient)" />
                    
                    {/* Device base */}
                    <rect x="0" y="20" width="280" height="160" rx="12" fill="url(#deviceGradient)" stroke="#cbd5e1" strokeWidth="2"/>
                    
                    {/* Screen */}
                    <rect x="15" y="35" width="250" height="130" rx="8" fill="url(#screenGradient)" stroke="#e2e8f0" strokeWidth="1"/>
                    
                    {/* Screen content - Dashboard */}
                    <g opacity="0.8">
                      {/* Header bar */}
                      <rect x="25" y="45" width="230" height="20" rx="4" fill="#3b82f6" opacity="0.1"/>
                      <circle cx="35" cy="55" r="3" fill="#ef4444"/>
                      <circle cx="45" cy="55" r="3" fill="#f59e0b"/>
                      <circle cx="55" cy="55" r="3" fill="#10b981"/>
                      
                      {/* Content cards */}
                      <rect x="25" y="75" width="100" height="60" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
                      <rect x="135" y="75" width="100" height="60" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
                      
                      {/* Chart elements */}
                      <path d="M35 120 L45 110 L55 115 L65 105 L75 100" stroke="#3b82f6" strokeWidth="2" fill="none"/>
                      <circle cx="35" cy="120" r="2" fill="#3b82f6"/>
                      <circle cx="65" cy="105" r="2" fill="#10b981"/>
                      
                      {/* Text lines */}
                      <rect x="145" y="85" width="60" height="3" rx="1" fill="#cbd5e1"/>
                      <rect x="145" y="95" width="40" height="3" rx="1" fill="#e2e8f0"/>
                      <rect x="145" y="105" width="70" height="3" rx="1" fill="#cbd5e1"/>
                    </g>
                  </g>

                  {/* Mobile Device */}
                  <g transform="translate(320, 80)">
                    {/* Phone shadow */}
                    <path d="M5 140 L65 140 L70 150 L10 150 Z" fill="url(#shadowGradient)" />
                    
                    {/* Phone body */}
                    <rect x="0" y="0" width="60" height="120" rx="12" fill="url(#deviceGradient)" stroke="#cbd5e1" strokeWidth="2"/>
                    
                    {/* Screen */}
                    <rect x="5" y="10" width="50" height="90" rx="8" fill="url(#screenGradient)" stroke="#e2e8f0" strokeWidth="1"/>
                    
                    {/* Screen content */}
                    <g opacity="0.8">
                      {/* Status bar */}
                      <rect x="8" y="15" width="44" height="8" rx="2" fill="#f1f5f9"/>
                      
                      {/* App icons */}
                      <circle cx="15" cy="35" r="4" fill="#3b82f6" opacity="0.7"/>
                      <circle cx="30" cy="35" r="4" fill="#10b981" opacity="0.7"/>
                      <circle cx="45" cy="35" r="4" fill="#f59e0b" opacity="0.7"/>
                      
                      {/* Content area */}
                      <rect x="10" y="50" width="40" height="40" rx="4" fill="#f8fafc" stroke="#e2e8f0"/>
                      
                      {/* Mini chart */}
                      <path d="M15 75 L20 70 L25 72 L30 68 L35 65" stroke="#3b82f6" strokeWidth="1.5" fill="none"/>
                    </g>
                  </g>

                  {/* Floating Elements */}
                  <circle cx="100" cy="40" r="3" fill="#3b82f6" opacity="0.6"/>
                  <circle cx="320" cy="60" r="2" fill="#10b981" opacity="0.5"/>
                  <circle cx="80" cy="250" r="2.5" fill="#f59e0b" opacity="0.4"/>
                  <circle cx="350" cy="220" r="2" fill="#ef4444" opacity="0.5"/>
                  
                  {/* Connection lines */}
                  <path d="M150 100 Q200 80 250 100" stroke="#cbd5e1" strokeWidth="1" fill="none" opacity="0.5" strokeDasharray="3,3"/>
                  <path d="M280 120 Q300 110 320 120" stroke="#cbd5e1" strokeWidth="1" fill="none" opacity="0.5" strokeDasharray="3,3"/>
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Content Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Tentang MILUAN
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                MILUAN adalah platform event management terdepan yang memungkinkan Anda untuk mengorganisir, 
                mempromosikan, dan mengelola acara dengan mudah dan efisien.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Dengan teknologi terdepan dan antarmuka yang intuitif, kami membantu ribuan organizer 
                event di seluruh Indonesia untuk menciptakan pengalaman yang tak terlupakan bagi peserta mereka.
              </p>
            </motion.div>

            {/* Right Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Visi Kami</h3>
                <p className="text-gray-600 text-sm">
                  Menjadi platform event terpercaya yang menghubungkan komunitas dan menciptakan pengalaman berkesan.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Misi Kami</h3>
                <p className="text-gray-600 text-sm">
                  Menyediakan solusi teknologi yang memudahkan pengelolaan event dari perencanaan hingga eksekusi.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default About;
