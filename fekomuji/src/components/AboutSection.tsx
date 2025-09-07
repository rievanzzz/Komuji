import { motion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const stats = [
  { value: '100+', label: 'Events Hosted' },
  { value: '50K+', label: 'Happy Attendees' },
  { value: '20+', label: 'Countries' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const AboutSection = () => {
  const { elementRef, isVisible } = useScrollAnimation({
    threshold: 0.2
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
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            ref={elementRef}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={container}
            className="relative"
          >
            <motion.div 
              variants={item}
              className="relative overflow-hidden rounded-2xl shadow-xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                alt="Event attendees enjoying a concert"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Floating elements */}
              <motion.div 
                className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg w-32"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: isVisible ? 1 : 0, 
                  y: isVisible ? 0 : 20,
                  transition: { delay: 0.6 }
                }}
              >
                <div className="text-3xl font-bold text-purple-600">5+</div>
                <div className="text-sm text-gray-600">Years Experience</div>
              </motion.div>
              
              <motion.div 
                className="absolute -top-6 -right-6 bg-gradient-to-r from-purple-600 to-blue-500 text-white p-4 rounded-xl shadow-lg w-36"
                initial={{ opacity: 0, y: -20 }}
                animate={{ 
                  opacity: isVisible ? 1 : 0, 
                  y: isVisible ? 0 : -20,
                  transition: { delay: 0.8 }
                }}
              >
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm">Customer Support</div>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="hidden lg:block absolute -z-10 w-64 h-64 bg-purple-100 rounded-full -bottom-16 -right-16"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ 
                scale: isVisible ? 1 : 0.5, 
                opacity: isVisible ? 1 : 0,
                transition: { delay: 0.4 }
              }}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ 
              opacity: isVisible ? 1 : 0, 
              x: isVisible ? 0 : 50,
              transition: { duration: 0.6 }
            }}
          >
            <span className="inline-block text-sm font-semibold text-purple-600 mb-4">ABOUT MILUAN</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-6">
              Creating <span className="font-bold">Unforgettable</span> Experiences
            </h2>
            
            <div className="space-y-6 text-gray-600 mb-10">
              <p>
                Miluan is a premier event management company dedicated to crafting extraordinary experiences that leave lasting impressions. 
                With a passion for excellence and an eye for detail, we bring your vision to life.
              </p>
              <p>
                Our team of experienced professionals works tirelessly to ensure every event is executed flawlessly, from intimate gatherings 
                to large-scale conferences and concerts.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: isVisible ? 1 : 0, 
                    y: isVisible ? 0 : 20,
                    transition: { 
                      delay: 0.4 + (index * 0.1),
                      type: 'spring',
                      stiffness: 100
                    }
                  }}
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
