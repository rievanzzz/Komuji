import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

const Contact: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Send email via API
      const response = await fetch('http://localhost:8000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        // Try to parse error message
        const data = await response.json().catch(() => null);
        console.error('Contact submit failed', data || response.statusText);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      question: "Apa saja jenis event yang bisa didaftarkan di platform ini?",
      answer: "Platform kami mendukung berbagai jenis event seperti seminar, workshop, pelatihan, konferensi, webinar, dan acara networking. Baik event gratis maupun berbayar dapat didaftarkan dengan mudah."
    },
    {
      question: "Bagaimana cara mendaftar sebagai penyelenggara event?",
      answer: "Anda dapat mendaftar sebagai organizer melalui halaman 'Login Organizer' di header website. Setelah registrasi, Anda dapat langsung mulai membuat dan mengelola event Anda sendiri."
    },
    {
      question: "Apakah ada biaya untuk menggunakan platform ini?",
      answer: "Untuk peserta, pendaftaran ke event gratis tidak dikenakan biaya. Untuk event berbayar, sistem pembayaran akan segera tersedia. Organizer dapat menggunakan platform ini secara gratis untuk mengelola event mereka."
    },
    {
      question: "Bagaimana sistem sertifikat bekerja?",
      answer: "Setelah menghadiri event, peserta yang memenuhi syarat akan mendapatkan sertifikat digital yang dapat diunduh melalui halaman profil mereka. Sertifikat akan otomatis tersedia setelah event selesai."
    },
    {
      question: "Bisakah saya membatalkan pendaftaran event?",
      answer: "Ya, Anda dapat membatalkan pendaftaran melalui halaman riwayat event. Untuk event berbayar, kebijakan refund akan mengikuti ketentuan yang ditetapkan oleh penyelenggara event."
    },
    {
      question: "Bagaimana cara menghubungi penyelenggara event?",
      answer: "Informasi kontak penyelenggara tersedia di halaman detail event. Anda juga dapat mengirim pesan melalui sistem internal platform atau menghubungi admin jika ada kendala."
    },
    {
      question: "Apakah event tersedia di seluruh Indonesia?",
      answer: "Saat ini platform kami fokus pada event-event di wilayah Jawa Barat, namun kami terus berkembang untuk menjangkau wilayah lain di Indonesia. Pantau terus update terbaru dari kami!"
    },
    {
      question: "Bagaimana cara mendapatkan notifikasi event terbaru?",
      answer: "Anda dapat mengikuti media sosial kami atau berlangganan newsletter untuk mendapatkan informasi event terbaru. Pastikan juga untuk mengaktifkan notifikasi di profil akun Anda."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
<section className="pt-32 pb-16 px-4 bg-gray-50 min-h-screen flex items-center">
        <div className="container mx-auto max-w-7xl">

          {/* Simple Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-20 text-center"
          >
            Contact us.
          </motion.h1>

          {/* Social Media Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-6xl mx-auto"
          >

            {/* WhatsApp */}
            <div className="text-center group">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-gray-900 group-hover:text-green-500 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">WhatsApp</h3>
              <p className="text-sm text-gray-600 mb-4">Chat with us directly</p>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
              >
                Start a chat
              </a>
            </div>

            {/* Instagram */}
            <div className="text-center group">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-gray-900 group-hover:text-pink-500 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instagram</h3>
              <p className="text-sm text-gray-600 mb-4">Follow our updates</p>
              <a
                href="https://instagram.com/miluan.events"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
              >
                @miluan.events
              </a>
            </div>

            {/* TikTok */}
            <div className="text-center group">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-gray-900 group-hover:text-black transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">TikTok</h3>
              <p className="text-sm text-gray-600 mb-4">Watch our content</p>
              <a
                href="https://tiktok.com/@miluan.events"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
              >
                @miluan.events
              </a>
            </div>

            {/* YouTube */}
            <div className="text-center group">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-gray-900 group-hover:text-red-500 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">YouTube</h3>
              <p className="text-sm text-gray-600 mb-4">Watch our videos</p>
              <a
                href="https://youtube.com/@miluanevents"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
              >
                @miluanevents
              </a>
            </div>

          </motion.div>

          {/* Contact Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16"
          >
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 w-full mx-auto relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full -translate-y-10 translate-x-10 opacity-40"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-gray-50 to-gray-100 rounded-full translate-y-8 -translate-x-8 opacity-40"></div>

              <div className="relative z-10">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Kirim Pesan</h3>
                  <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">Kami senang mendengar dari Anda. Kirim pesan dan kami akan merespons secepat mungkin.</p>
                </div>

                {/* Success/Error Messages */}
                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-green-800 font-medium">Pesan berhasil dikirim! Kami akan merespons segera.</p>
                    </div>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <p className="text-red-800 font-medium">Gagal mengirim pesan. Silakan coba lagi atau hubungi kami langsung.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-300 outline-none text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white text-sm"
                        placeholder="Masukkan nama lengkap Anda"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-300 outline-none text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white text-sm"
                        placeholder="email@contoh.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subjek
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-300 outline-none text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white text-sm"
                      placeholder="Tentang apa pesan ini?"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Pesan
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-300 outline-none resize-none text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white text-sm"
                      placeholder="Ceritakan lebih detail tentang pertanyaan atau saran Anda..."
                    ></textarea>
                  </div>

                  <div className="text-center pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-medium text-sm shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Kirim Pesan
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-24"
          >
            <div className="text-center mb-12">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">FAQ</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Pertanyaan</h2>
              <h2 className="text-4xl font-bold text-gray-900">Yang Sering Diajukan</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                  >
                    <span className="text-lg font-medium text-gray-900 pr-4">{faq.question}</span>
                    <div className="flex-shrink-0">
                      {openFAQ === index ? (
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </div>
                  </button>

                  <motion.div
                    initial={false}
                    animate={{
                      height: openFAQ === index ? "auto" : 0,
                      opacity: openFAQ === index ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-0">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </section>


      <PublicFooter />
    </div>
  );
};

export default Contact;
