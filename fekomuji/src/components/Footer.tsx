import { motion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const footerLinks = [
  {
    title: 'Events',
    links: [
      { name: 'Concerts', href: '#' },
      { name: 'Sports', href: '#' },
      { name: 'Conferences', href: '#' },
      { name: 'Workshops', href: '#' },
      { name: 'Exhibitions', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Press', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Support',
    links: [
      { name: 'Help Center', href: '#' },
      { name: 'Safety Center', href: '#' },
      { name: 'Community Guidelines', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Privacy Policy', href: '#' },
    ],
  },
];

const socialLinks = [
  { name: 'Facebook', icon: 'facebook', href: '#' },
  { name: 'Twitter', icon: 'twitter', href: '#' },
  { name: 'Instagram', icon: 'instagram', href: '#' },
  { name: 'LinkedIn', icon: 'linkedin', href: '#' },
  { name: 'YouTube', icon: 'youtube', href: '#' },
];

const Footer = () => {
  const { elementRef, isVisible } = useScrollAnimation({
    threshold: 0.1,
    once: true
  });

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          ref={elementRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={container}
        >
          {/* Logo and description */}
          <motion.div variants={item} className="lg:col-span-1">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Miluan
            </div>
            <p className="text-gray-400 mb-6">
              Creating unforgettable event experiences that bring people together and create lasting memories.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <span className="sr-only">{social.name}</span>
                  <i className={`fab fa-${social.icon} text-xl`}></i>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Footer links */}
          {footerLinks.map((column) => (
            <motion.div key={column.title} variants={item}>
              <h3 className="text-white font-medium text-lg mb-4">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div 
          className="h-px bg-gray-800 mb-8"
          initial={{ scaleX: 0 }}
          animate={{ 
            scaleX: isVisible ? 1 : 0,
            transformOrigin: 'left',
            transition: { delay: 0.4, duration: 0.8 }
          }}
        />

        {/* Bottom bar */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isVisible ? 1 : 0, 
            y: isVisible ? 0 : 20,
            transition: { delay: 0.6 }
          }}
        >
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Miluan. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">
              Cookie Policy
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
