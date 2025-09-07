import { motion } from 'framer-motion';
import type { Partner } from '../types';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const partners: Partner[] = [
  { id: 1, name: 'Spotify', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2048px-Spotify_logo_without_text.svg.png' },
  { id: 2, name: 'Ticketmaster', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Ticketmaster_2016.svg/2560px-Ticketmaster_2016.svg.png' },
  { id: 3, name: 'Live Nation', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Live_Nation_Entertainment_Logo.svg/2560px-Live_Nation_Entertainment_Logo.svg.png' },
  { id: 4, name: 'Eventbrite', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Eventbrite_Logo.svg/2560px-Eventbrite_Logo.svg.png' },
  { id: 5, name: 'AXS', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/AXS_logo_%282015%29.svg/2560px-AXS_logo_%282015%29.svg.png' },
  { id: 6, name: 'StubHub', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/StubHub_logo.svg/2560px-StubHub_logo.svg.png' },
];

const Partners = () => {
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
  } as const;

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 10
      }
    }
  } as const;

  return (
    <section id="partners" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ 
            opacity: isVisible ? 1 : 0, 
            y: isVisible ? 0 : 30,
            transition: { duration: 0.6 }
          }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-4">
            Our <span className="font-bold">Partners</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto my-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Trusted by leading companies in the event industry
          </p>
        </motion.div>

        <motion.div 
          ref={elementRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={container}
        >
          {partners.map((partner) => (
            <motion.div
              key={partner.id}
              className="flex items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              variants={item}
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="h-12 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isVisible ? 1 : 0, 
            y: isVisible ? 0 : 20,
            transition: { delay: 0.6 }
          }}
        >
          <h3 className="text-xl font-medium text-gray-800 mb-4">
            Want to become a partner?
          </h3>
          <a
            href="#"
            className="inline-block px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-100 transition-colors"
          >
            Contact Us
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Partners;
