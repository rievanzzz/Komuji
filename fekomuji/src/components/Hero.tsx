import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  
  const { isVisible } = useScrollAnimation({
    threshold: 0.1
  });

  // Parallax effects
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  // Dynamic title based on scroll
  const [titleVariant, setTitleVariant] = useState<'center' | 'left'>('center');
  
  useEffect(() => {
    // Update title variant based on scroll
    const updateTitleVariant = () => {
      if (window.scrollY > 100) {
        setTitleVariant('left');
      } else {
        setTitleVariant('center');
      }
    };
    
    window.addEventListener('scroll', updateTitleVariant);
    
    return () => {
      window.removeEventListener('scroll', updateTitleVariant);
    };
  }, []);

  const titleWords = ["Experience", "the", "Extraordinary"].map((word, i) => (
    <motion.span
      key={i}
      className="inline-block overflow-hidden"
      initial={{ y: 100, opacity: 0 }}
      animate={{ 
        y: isVisible ? 0 : 100, 
        opacity: isVisible ? 1 : 0,
        transition: { 
          delay: i * 0.1,
          type: 'spring',
          stiffness: 100,
          damping: 20
        }
      }}
    >
      {word}{' '}
    </motion.span>
  ));

  return (
    <section 
      id="home"
      ref={heroRef}
      className="relative h-screen flex items-center justify-center overflow-hidden pt-16"
    >
      {/* Background Image */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{
          y: yBg,
          backgroundImage: 'url(https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className={`max-w-4xl mx-auto text-${titleVariant === 'center' ? 'center' : 'left'} transition-all duration-500`}
          style={{
            y: titleVariant === 'center' ? yText : 0,
            opacity: titleVariant === 'center' ? 1 : opacity
          }}
        >
          <motion.h1 
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-tight ${
              titleVariant === 'left' ? 'text-left' : 'text-center'
            }`}
            initial="hidden"
            animate={isVisible ? 'visible' : 'hidden'}
          >
            {titleWords}
          </motion.h1>
          
          <motion.p 
            className={`text-lg md:text-xl text-gray-200 mb-8 max-w-2xl ${
              titleVariant === 'left' ? 'mx-0' : 'mx-auto'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: isVisible ? 1 : 0, 
              y: isVisible ? 0 : 20,
              transition: { delay: 0.6 }
            }}
          >
            Discover unforgettable events that inspire and connect people from around the world.
          </motion.p>
          
          <motion.div
            className={`flex ${titleVariant === 'center' ? 'justify-center' : 'justify-start'}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: isVisible ? 1 : 0, 
              y: isVisible ? 0 : 30,
              transition: { delay: 0.8 }
            }}
          >
            <a
              href="#events"
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-full hover:opacity-90 transition-opacity"
            >
              Explore Events
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-sm flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: isVisible ? 1 : 0, 
          y: isVisible ? 0 : 20,
          transition: { delay: 1 }
        }}
      >
        <span className="mb-2">Scroll to explore</span>
        <motion.div
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'loop',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
