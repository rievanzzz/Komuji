import { motion } from 'framer-motion';
import { 
  FiMail, 
  FiMapPin, 
  FiInstagram, 
  FiTwitter, 
  FiFacebook, 
  FiLinkedin,
  FiYoutube
} from 'react-icons/fi';

const PublicFooter = () => {
  const footerLinks = {
    company: [
      { name: 'About', href: '#about' },
      { name: 'Blog', href: '#blog' },
      { name: 'Careers', href: '#careers' },
      { name: 'Contact', href: '#contact' }
    ],
    product: [
      { name: 'Browse Events', href: '#events' },
      { name: 'Create Event', href: '#create' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Help Center', href: '#help' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' }
    ]
  };

  const socialLinks = [
    { icon: FiInstagram, href: '#', color: '#E4405F' },
    { icon: FiTwitter, href: '#', color: '#1DA1F2' },
    { icon: FiFacebook, href: '#', color: '#1877F2' },
    { icon: FiLinkedin, href: '#', color: '#0A66C2' },
    { icon: FiYoutube, href: '#', color: '#FF0000' }
  ];

  // Footer Image Component
  const FooterImage = () => (
    <div className="w-32 h-56 overflow-hidden">
      <img 
        src="/src/assets/img/18dff6c1-4bc6-44df-bea0-3ed242f9f6de.jpg" 
        alt="Footer illustration" 
        className="w-full h-full object-contain"
      />
    </div>
  );

  const DecorativeElements = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle background waves */}
      <svg className="absolute -top-10 -right-20 w-96 h-64 opacity-5" viewBox="0 0 400 300">
        <path d="M0 150 Q100 50 200 150 T400 150 L400 300 L0 300 Z" fill="#59789F"/>
      </svg>
      
      <svg className="absolute -bottom-10 -left-20 w-80 h-48 opacity-5" viewBox="0 0 320 200">
        <path d="M0 100 Q80 40 160 100 T320 100 L320 200 L0 200 Z" fill="#7A9445"/>
      </svg>
      
      {/* Floating dots */}
      <div className="absolute top-8 right-16 w-2 h-2 bg-[#ECE69D] rounded-full opacity-20"></div>
      <div className="absolute bottom-12 left-12 w-3 h-3 bg-[#A9B6C4] rounded-full opacity-15"></div>
      <div className="absolute top-20 left-1/3 w-1.5 h-1.5 bg-[#59789F] rounded-full opacity-25"></div>
    </div>
  );

  return (
    <footer className="relative bg-white py-16 overflow-hidden">
      <DecorativeElements />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          
          {/* Brand Section with Wave Illustration */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <motion.div 
                  className="w-10 h-10 bg-[#243C2C] rounded-xl flex items-center justify-center"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-white font-bold text-lg">M</span>
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">MILUAN</h2>
                  <p className="text-[#59789F] text-sm font-medium">Event Platform</p>
                </div>
              </div>
              
              <div className="mb-8">
                <FooterImage />
              </div>
              
              <div className="space-y-3">
                <motion.div 
                  className="flex items-center space-x-3 text-gray-600 text-sm group cursor-pointer"
                  whileHover={{ x: 4, color: '#59789F' }}
                  transition={{ duration: 0.2 }}
                >
                  <FiMapPin className="text-[#7A9445] group-hover:text-[#59789F] transition-colors" size={16} />
                  <span className="group-hover:text-[#59789F] transition-colors">Jakarta, Indonesia</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-3 text-gray-600 text-sm group cursor-pointer"
                  whileHover={{ x: 4, color: '#59789F' }}
                  transition={{ duration: 0.2 }}
                >
                  <FiMail className="text-[#7A9445] group-hover:text-[#59789F] transition-colors" size={16} />
                  <span className="group-hover:text-[#59789F] transition-colors">hello@miluan.com</span>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Company Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold text-gray-900 mb-6 text-lg">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link, index) => (
                  <motion.li 
                    key={index}
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href={link.href}
                      className="text-gray-600 hover:text-[#59789F] transition-colors text-sm relative group"
                    >
                      <span className="relative">
                        {link.name}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ECE69D] group-hover:w-full transition-all duration-300"></span>
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Product Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold text-gray-900 mb-6 text-lg">Product</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link, index) => (
                  <motion.li 
                    key={index}
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href={link.href}
                      className="text-gray-600 hover:text-[#59789F] transition-colors text-sm relative group"
                    >
                      <span className="relative">
                        {link.name}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ECE69D] group-hover:w-full transition-all duration-300"></span>
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Legal Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold text-gray-900 mb-6 text-lg">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link, index) => (
                  <motion.li 
                    key={index}
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href={link.href}
                      className="text-gray-600 hover:text-[#59789F] transition-colors text-sm relative group"
                    >
                      <span className="relative">
                        {link.name}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#ECE69D] group-hover:w-full transition-all duration-300"></span>
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#A9B6C4]/30 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            
            {/* Copyright */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <p className="text-gray-500 text-sm">
                © 2024 MILUAN. All rights reserved.
              </p>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex items-center space-x-4"
            >
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 border-transparent"
                  style={{ backgroundColor: `${social.color}10` }}
                  whileHover={{ 
                    scale: 1.1, 
                    y: -3,
                    backgroundColor: social.color,
                    borderColor: social.color
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    whileHover={{ color: 'white' }}
                    style={{ color: social.color }}
                    transition={{ duration: 0.2 }}
                  >
                    <social.icon size={18} />
                  </motion.div>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Large Wave SVG at Bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg className="relative block w-full h-48" viewBox="0 0 1200 200" preserveAspectRatio="none">
          {/* Main wave - Glaucous */}
          <path 
            d="M0 100 Q300 30 600 100 T1200 100 L1200 200 L0 200 Z" 
            fill="#59789F" 
            opacity="0.8"
          />
          
          {/* Secondary wave - Powder Blue */}
          <path 
            d="M0 130 Q400 60 800 130 T1600 130 L1600 200 L0 200 Z" 
            fill="#A9B6C4" 
            opacity="0.6"
          />
          
          {/* Accent wave - Moss Green */}
          <path 
            d="M0 160 Q200 90 600 160 T1200 160 L1200 200 L0 200 Z" 
            fill="#7A9445" 
            opacity="0.4"
          />
          
          {/* Floating elements - Vanilla accents */}
          <circle cx="200" cy="50" r="6" fill="#ECE69D" opacity="0.7"/>
          <circle cx="600" cy="40" r="8" fill="#ECE69D" opacity="0.5"/>
          <circle cx="1000" cy="70" r="5" fill="#ECE69D" opacity="0.8"/>
          
          {/* Organic shapes - Dark Green */}
          <path 
            d="M150 30 Q180 15 210 30 Q180 45 150 30" 
            fill="#243C2C" 
            opacity="0.3"
          />
          <path 
            d="M800 25 Q850 10 900 25 Q850 40 800 25" 
            fill="#243C2C" 
            opacity="0.4"
          />
        </svg>
      </div>
    </footer>
  );
};

export default PublicFooter;
