import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, eventTitle }) => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    onClose();
    navigate('/signin');
  };

  const handleSignUp = () => {
    onClose();
    navigate('/signup');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-gradient-to-b from-blue-50 via-blue-50 via-cyan-50 via-white to-white rounded-3xl p-6 shadow-xl border border-gray-200 relative overflow-hidden"
              >
                {/* Smooth gradient overlay for seamless transition */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-100/25 via-cyan-50/15 via-blue-50/8 to-transparent rounded-t-3xl"></div>
                
                {/* Additional smooth blend layer */}
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-sky-50/20 via-blue-50/10 to-transparent rounded-t-3xl"></div>
                
                {/* Content wrapper */}
                <div className="relative z-10">
                  <button
                    onClick={onClose}
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200/40 shadow-sm"
                  >
                    <FiX className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  {/* Logo and Header */}
                  <div className="text-center mb-6">
                    <motion.div
                      className="mx-auto w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-md border border-gray-200/40"
                      whileHover={{ scale: 1.05 }}
                    >
                      <FiUser className="w-7 h-7 text-gray-700" />
                    </motion.div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Login Required</h1>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {eventTitle 
                        ? `To register for "${eventTitle}", please sign in or create an account. For free.`
                        : 'To register for events, please sign in or create an account. For free.'
                      }
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Sign In Button */}
                    <motion.button
                      type="button"
                      onClick={handleSignIn}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 shadow-lg"
                    >
                      Get Started
                    </motion.button>

                    {/* Divider */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="relative mb-5"
                    >
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-white text-gray-500">Or sign up with</span>
                      </div>
                    </motion.div>

                    {/* Sign Up Button */}
                    <motion.button
                      type="button"
                      onClick={handleSignUp}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
                    >
                      Sign up for free
                    </motion.button>
                  </div>

                  {/* CTA for new users */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    className="mt-6 text-center"
                  >
                    <p className="text-sm text-gray-600">
                      Join thousands of event enthusiasts and discover amazing experiences near you.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
