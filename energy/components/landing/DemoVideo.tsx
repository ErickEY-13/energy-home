'use client';

import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { useState, useRef } from 'react';

export function DemoVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section id="demo" className="py-32 px-6 bg-gray-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
      
      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold mb-6 border border-blue-500/20"
          >
            Demo en vivo
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight"
          >
            Mira cómo funciona
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Un recorrido rápido por todas las funcionalidades de Energy Home
          </motion.p>
        </div>

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-gray-800"
        >
          {/* Video Placeholder - Puedes reemplazar con tu video real */}
          <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative">
            {/* Placeholder Image/Video */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              poster="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=675&fit=crop"
              onEnded={() => setIsPlaying(false)}
            >
              {/* Aquí puedes poner tu video real */}
              <source src="/demo-video.mp4" type="video/mp4" />
            </video>

            {/* Overlay cuando no está reproduciendo */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
                {/* Play Button */}
                <button
                  onClick={togglePlay}
                  className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-white/20 hover:scale-110 transition-transform group"
                >
                  <Play size={40} className="text-gray-900 ml-2 group-hover:scale-110 transition-transform" fill="currentColor" />
                </button>
              </div>
            )}

            {/* Controls Overlay */}
            {isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute bottom-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Pause size={24} className="text-white" />
              </button>
            )}

            {/* Decorative Elements */}
            <div className="absolute top-6 left-6 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white/80 text-sm font-medium">Demo en vivo</span>
            </div>
          </div>
        </motion.div>

        {/* Features bajo el video */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
        >
          {[
            { label: 'Duración', value: '2:30 min' },
            { label: 'Idioma', value: 'Español' },
            { label: 'Calidad', value: '4K HDR' },
            { label: 'Subtítulos', value: 'Disponibles' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-2xl font-bold text-white">{item.value}</p>
              <p className="text-gray-500 text-sm">{item.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
