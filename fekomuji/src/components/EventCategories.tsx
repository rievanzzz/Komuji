import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EventCategory } from '../types';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const eventCategories: EventCategory[] = [
  {
    id: 1,
    name: 'Concert & Entertainment',
    description: 'Experience unforgettable live performances from top artists and entertainers around the globe.',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    color: 'from-purple-500 to-pink-500',
    icon: '🎵',
  },
  {
    id: 2,
    name: 'Conference & Workshops',
    description: 'Expand your knowledge and network with industry leaders at our professional conferences and workshops.',
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    color: 'from-blue-500 to-cyan-500',
    icon: '🎤',
  },
];

const EventCategories = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const { elementRef, isVisible } = useScrollAnimation({
    threshold: 0.1,
    once: true,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-rotate categories when not hovered
  useEffect(() => {
    if (!isHovered) {
      const timer = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % eventCategories.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isHovered]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % eventCategories.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + eventCategories.length) % eventCategories.length);
  };

  const handleIndicatorClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  } as const;

  const currentCategory = eventCategories[currentIndex];

  return (
    <section id="events" ref={elementRef} className="relative py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{
            opacity: isVisible ? 1 : 0,
            y: isVisible ? 0 : 50,
          }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-4">
            Discover <span className="font-bold">Upcoming Events</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto my-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our curated selection of events across various categories
          </p>
        </motion.div>

        <div
          ref={containerRef}
          className="relative h-[600px] md:h-[700px] rounded-2xl overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <AnimatePresence custom={direction} initial={false}>
            <motion.div
              key={currentCategory.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${currentCategory.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
              </div>

              <div className="relative h-full flex flex-col justify-end p-8 md:p-16 text-white">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: 0.3 },
                  }}
                  className="max-w-2xl"
                >
                  <div className="text-5xl mb-4">{currentCategory.icon}</div>
                  <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                    {currentCategory.name}
                  </h3>
                  <p className="text-lg md:text-xl text-gray-200 mb-8">
                    {currentCategory.description}
                  </p>
                  <button
                    className={`px-8 py-3 bg-gradient-to-r ${currentCategory.color} text-white font-medium rounded-full hover:opacity-90 transition-opacity`}
                  >
                    View Events
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full z-10 transition-all"
            aria-label="Previous category"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full z-10 transition-all"
            aria-label="Next category"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {eventCategories.map((_, index) => (
              <button
                key={index}
                onClick={() => handleIndicatorClick(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75 w-3'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventCategories;
