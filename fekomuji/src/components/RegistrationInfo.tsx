import { motion, Variants } from 'framer-motion';
import { RegistrationStep } from '../types';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const registrationSteps: RegistrationStep[] = [
  {
    id: 1,
    title: 'Create an Account',
    description: 'Sign up for free and create your personal event profile',
    icon: '👤',
  },
  {
    id: 2,
    title: 'Browse Events',
    description: 'Explore our wide range of events and find your perfect match',
    icon: '🔍',
  },
  {
    id: 3,
    title: 'Book Your Ticket',
    description: 'Secure your spot with our easy booking process',
    icon: '🎟️',
  },
  {
    id: 4,
    title: 'Enjoy the Experience',
    description: 'Attend the event and create unforgettable memories',
    icon: '✨',
  },
];

const RegistrationInfo = () => {
  const { elementRef, isVisible } = useScrollAnimation({
    threshold: 0.2,
    once: true
  });

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  } as const;

  const item: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: (i: number = 0) => ({
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
        delay: i * 0.1
      }
    })
  };

  return (
    <section id="register" className="py-20 bg-white">
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
            How to <span className="font-bold">Register</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto my-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of attendees in just a few simple steps
          </p>
        </motion.div>

        <motion.div 
          ref={elementRef}
          className="relative max-w-5xl mx-auto"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={container}
        >
          {/* Timeline line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-blue-500 -translate-x-1/2"></div>
          
          {registrationSteps.map((step, index) => (
            <motion.div
              key={step.id}
              className={`relative mb-12 md:mb-20 flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              custom={index}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              variants={item}
            >
              {/* Content */}
              <div className={`md:w-5/12 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'}`}>
                <motion.div 
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl mb-4 ${
                    index % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'
                  } bg-gradient-to-br from-purple-100 to-blue-100 text-purple-600`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {step.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
              
              {/* Circle */}
              <div className="hidden md:flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mx-6 flex-shrink-0 z-10"></div>
              
              {/* Spacer for even items */}
              <div className="hidden md:block md:w-5/12"></div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: isVisible ? 1 : 0, 
            y: isVisible ? 0 : 20,
            transition: { delay: 1 }
          }}
        >
          <a
            href="#"
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium rounded-full hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl"
          >
            Get Started Now
          </a>
          <p className="text-gray-500 mt-4 text-sm">No credit card required • Cancel anytime</p>
        </motion.div>
      </div>
    </section>
  );
};

export default RegistrationInfo;
