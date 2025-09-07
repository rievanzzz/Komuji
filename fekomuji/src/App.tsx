import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Header from './components/Header';
import Hero from './components/Hero';
import EventCategories from './components/EventCategories';
import AboutSection from './components/AboutSection';
import RegistrationInfo from './components/RegistrationInfo';
import Partners from './components/Partners';
import Footer from './components/Footer';

function App() {
  const appRef = useRef<HTMLDivElement>(null);

  // Smooth scroll behavior for anchor links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement;
      
      if (anchor) {
        e.preventDefault();
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const element = targetElement as HTMLElement;
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // Update URL without adding to history
          try {
            if (typeof window.history.pushState === 'function') {
              window.history.pushState(null, '', targetId);
            } else {
              window.location.hash = targetId.startsWith('#') ? targetId : `#${targetId}`;
            }
          } catch (error) {
            console.error('Failed to update URL:', error);
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return (
    <div ref={appRef} className="min-h-screen bg-black text-white font-sans">
      {/* Global loading indicator */}
      <AnimatePresence>
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-500 z-50"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
      </AnimatePresence>

      {/* Main content */}
      <Header />
      <main>
        <Hero />
        <EventCategories />
        <AboutSection />
        <RegistrationInfo />
        <Partners />
      </main>
      <Footer />

      {/* Back to top button */}
      <motion.button
        className="fixed bottom-8 right-8 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-lg z-40"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: { delay: 1 }
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Back to top"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </motion.button>
    </div>
  );
}

export default App;
