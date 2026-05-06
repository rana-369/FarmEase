import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiUser, FiMapPin, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getActiveTestimonials } from '../services/testimonialService';
import { useTheme } from '../context/ThemeContext';

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const data = await getActiveTestimonials();
      setTestimonials(data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (loading || testimonials.length === 0) {
    return null;
  }

  const testimonial = testimonials[currentIndex];

  return (
    <section 
      id="testimonials"
      className="py-16 sm:py-20 px-4 sm:px-6 transition-colors duration-500"
      style={{ backgroundColor: isDark ? '#0f0f0f' : '#f9fafb' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-5 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
            What Our Users Say
          </h2>
          <p className={`text-base sm:text-lg transition-colors ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Trusted by farmers and equipment owners across India
          </p>
        </motion.div>

        {/* Testimonial Card */}
        <motion.div
          key={testimonial.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative px-0 sm:px-8"
        >
          <div 
            className="p-8 sm:p-10 rounded-xl sm:rounded-2xl text-center border transition-colors duration-300"
            style={{
              backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb',
              boxShadow: isDark ? 'none' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Rating Stars */}
            <div className="flex justify-center gap-1.5 mb-6 sm:mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${star <= testimonial.rating ? 'fill-current' : ''}`}
                  style={{ color: star <= testimonial.rating ? '#f59e0b' : (isDark ? '#6b7280' : '#9ca3af') }}
                />
              ))}
            </div>

            {/* Quote */}
            <blockquote 
              className="text-base sm:text-lg md:text-xl leading-relaxed px-2 transition-colors mb-6 sm:mb-8"
              style={{ color: isDark ? '#ffffff' : '#111827' }}
            >
              "{testimonial.content}"
            </blockquote>

            {/* Author */}
            <div className="flex flex-col items-center gap-3">
              <div 
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
              >
                <FiUser className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#10b981' }} />
              </div>
              <div>
                <p className={`font-semibold text-sm sm:text-base mb-1 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {testimonial.authorName}
                </p>
                <p className={`text-xs sm:text-sm transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {testimonial.authorRole}
                  {testimonial.authorLocation && (
                    <span className="flex items-center justify-center gap-1 mt-1">
                      <FiMapPin className="w-3 h-3" />
                      {testimonial.authorLocation}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors min-h-[44px] min-w-[44px] border"
                style={{
                  backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb',
                  boxShadow: isDark ? 'none' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              >
                <FiChevronLeft className="text-lg sm:text-xl" style={{ color: isDark ? '#ffffff' : '#111827' }} />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors min-h-[44px] min-w-[44px] border"
                style={{
                  backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb',
                  boxShadow: isDark ? 'none' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              >
                <FiChevronRight className="text-lg sm:text-xl" style={{ color: isDark ? '#ffffff' : '#111827' }} />
              </button>
            </>
          )}
        </motion.div>

        {/* Dots Indicator */}
        {testimonials.length > 1 && (
          <div className="flex justify-center gap-3 mt-6 sm:mt-8">
            {testimonials.map((t, index) => (
              <button
                key={t.id || `dot-${index}`}
                onClick={() => setCurrentIndex(index)}
                className="rounded-full transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                style={{
                  background: index === currentIndex ? '#10b981' : (isDark ? '#374151' : '#d1d5db'),
                  width: index === currentIndex ? '24px' : '10px',
                  height: index === currentIndex ? '10px' : '10px'
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
