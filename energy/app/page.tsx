'use client';

import React, { useRef, useState } from 'react';
import { Link } from 'next-view-transitions';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { Counter, Cursor, Typewriter } from '@/components';
import { HowItWorks, Testimonials, DemoVideo, Footer } from '@/components/landing';
import { 
  Zap, 
  Shield, 
  Activity, 
  BarChart3, 
  ArrowRight, 
  Cpu, 
  Wifi, 
  Smartphone, 
  Home, 
  Battery, 
  CheckCircle2,
  Menu,
  X,
  Lightbulb,
  Refrigerator,
  Plug
} from 'lucide-react';

// ========================================
// COMPONENTES DE UI & ANIMACIONES
// ========================================

// 1. Noise Overlay
function NoiseOverlay() {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] mix-blend-overlay">
      <svg className="w-full h-full">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
}

// 2. Marquee Infinito
function Marquee({ text, direction = 1, speed = 20 }: { text: string, direction?: number, speed?: number }) {
  return (
    <div className="relative flex overflow-hidden py-4 bg-gray-900 text-white select-none border-y border-gray-800">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="mx-8 text-sm font-bold tracking-[0.2em] uppercase flex items-center gap-4 text-gray-400">
            {text} <span className="text-blue-500">•</span>
          </span>
        ))}
      </div>
      <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-gray-900 to-transparent z-10" />
      <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-gray-900 to-transparent z-10" />
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee ${speed}s linear infinite;
          ${direction === -1 ? 'animation-direction: reverse;' : ''}
        }
      `}</style>
    </div>
  );
}

// 3. Botón Magnético
function MagneticButton({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current!.getBoundingClientRect();
    const center = { x: left + width / 2, y: top + height / 2 };
    x.set((clientX - center.x) * 0.1);
    y.set((clientY - center.y) * 0.1);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`relative overflow-hidden group ${className}`}
      onClick={onClick}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
    </motion.button>
  );
}

// 4. Hero Animation (Isometric House + Phone Composition)
function HeroAnimation() {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden">
      {/* Fondo Ambiental */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[400px] h-[400px] bg-gradient-to-tr from-blue-100/50 to-cyan-100/50 rounded-full blur-[80px] -z-10"
      />

      <svg className="w-full h-full max-w-[650px]" viewBox="0 0 600 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <linearGradient id="screenGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#EFF6FF" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="6" floodOpacity="0.12"/>
          </filter>
        </defs>

        {/* --- ISOMETRIC HOUSE (CENTER-LEFT) --- */}
        <g transform="translate(200, 230)">
          {/* Base Platform Shadow */}
          <ellipse cx="0" cy="75" rx="120" ry="25" fill="#000" opacity="0.04" />

          {/* Base Platform */}
          <motion.g
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <path d="M0 50 L-110 0 L0 -50 L110 0 Z" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
            <path d="M-110 0 L0 50 V62 L-110 12 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
            <path d="M0 50 L110 0 V12 L0 62 Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1" />
          </motion.g>

          {/* House Body */}
          <motion.g
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
          >
            {/* Left Wall */}
            <path d="M-55 -25 L0 0 V50 L-55 25 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
            {/* Right Wall */}
            <path d="M0 0 L55 -25 V25 L0 50 Z" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
            
            {/* Roof Left - Clean triangle */}
            <path d="M-55 -25 L0 -50 L0 0 Z" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
            {/* Roof Right - Slightly darker */}
            <path d="M0 -50 L55 -25 L0 0 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
            
            {/* Chimney - smaller and better positioned */}
            <path d="M28 -32 V-42 L36 -38 V-28 Z" fill="#94A3B8" />
            <path d="M28 -42 L36 -38 L44 -42 L36 -46 Z" fill="#CBD5E1" />
            <path d="M36 -38 V-28 L44 -32 V-42 Z" fill="#B0B8C4" />
            
            {/* Window on left wall */}
            <path d="M-38 -4 L-18 6 V20 L-38 10 Z" fill="#BFDBFE" stroke="#60A5FA" strokeWidth="0.8" />
            <path d="M-28 1 V15" stroke="#60A5FA" strokeWidth="0.5" />
            
            {/* Door on right wall */}
            <path d="M8 8 L28 -2 V28 L8 38 Z" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="0.8" />
            <circle cx="24" cy="12" r="1.5" fill="#3B82F6" />

            {/* Small Solar Panel on Roof - much smaller */}
            <path d="M-38 -32 L-18 -42 L-12 -26 L-32 -16 Z" fill="#1E293B" opacity="0.85" />
            <path d="M-38 -32 L-18 -42 L-12 -26 L-32 -16 Z" fill="url(#blueGradient)" opacity="0.3" />
          </motion.g>
        </g>

        {/* --- FLOATING DEVICE ICONS --- */}
        {/* Lamp (Left) */}
        <g transform="translate(55, 290)">
          <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }}>
            <circle r="20" fill="white" stroke="#E2E8F0" strokeWidth="1.5" filter="url(#shadow)" />
            <foreignObject x="-10" y="-10" width="20" height="20">
              <div className="flex items-center justify-center w-full h-full text-yellow-500"><Lightbulb size={13} /></div>
            </foreignObject>
          </motion.g>
          <motion.path d="M20 -10 L125 -60" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" 
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.7, duration: 0.8 }} />
        </g>

        {/* Fridge (Top Right of house) */}
        <g transform="translate(340, 165)">
          <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: "spring" }}>
            <circle r="20" fill="white" stroke="#E2E8F0" strokeWidth="1.5" filter="url(#shadow)" />
            <foreignObject x="-10" y="-10" width="20" height="20">
              <div className="flex items-center justify-center w-full h-full text-cyan-500"><Refrigerator size={13} /></div>
            </foreignObject>
          </motion.g>
          <motion.path d="M-20 8 L-90 45" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 0.8 }} />
        </g>

        {/* Plug (Bottom Center) */}
        <g transform="translate(250, 400)">
          <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7, type: "spring" }}>
            <circle r="20" fill="white" stroke="#E2E8F0" strokeWidth="1.5" filter="url(#shadow)" />
            <foreignObject x="-10" y="-10" width="20" height="20">
              <div className="flex items-center justify-center w-full h-full text-green-500"><Plug size={13} /></div>
            </foreignObject>
          </motion.g>
          <motion.path d="M-25 -20 L-45 -95" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.9, duration: 0.8 }} />
        </g>

        {/* --- PHONE (RIGHT SIDE) --- */}
        <g transform="translate(410, 120)">
          <motion.g
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
          >
            {/* Phone Shadow */}
            <rect x="6" y="6" width="140" height="245" rx="20" fill="#000" opacity="0.08" />
            
            {/* Phone Body */}
            <rect x="0" y="0" width="140" height="245" rx="20" fill="#1E293B" stroke="#334155" strokeWidth="3" />
            
            {/* Screen */}
            <rect x="6" y="6" width="128" height="233" rx="16" fill="url(#screenGradient)" />
            
            {/* Notch */}
            <rect x="48" y="6" width="44" height="14" rx="7" fill="#1E293B" />

            {/* Dashboard UI */}
            <g transform="translate(14, 28)">
              {/* Header */}
              <circle cx="10" cy="10" r="10" fill="#DBEAFE" />
              <text x="26" y="14" fontSize="10" fontWeight="bold" fill="#1E293B" fontFamily="system-ui">Mi Hogar</text>
              <circle cx="102" cy="10" r="3" fill="#22C55E" />
              
              {/* Chart Card */}
              <rect x="0" y="30" width="112" height="65" rx="10" fill="url(#blueGradient)" />
              <text x="8" y="46" fontSize="7" fill="white" opacity="0.8">Consumo Total</text>
              <foreignObject x="8" y="48" width="90" height="18">
                <div className="flex items-center gap-1 h-full">
                  <Counter 
                    value={245} 
                    fontSize={12} 
                    padding={0} 
                    places={[100, 10, 1]} 
                    gap={1} 
                    textColor="white" 
                    fontWeight="bold"
                    gradientHeight={2}
                  />
                  <span className="text-white font-bold text-xs leading-none">kWh</span>
                </div>
              </foreignObject>
              <path d="M8 80 L22 73 L36 78 L50 67 L64 71 L78 63 L92 69 L104 64" 
                fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
              
              {/* Stats */}
              <g transform="translate(0, 105)">
                <rect x="0" y="0" width="52" height="50" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="1" />
                <text x="6" y="15" fontSize="7" fill="#64748B">Voltaje</text>
                <text x="6" y="32" fontSize="12" fontWeight="bold" fill="#1E293B">120V</text>
                <rect x="6" y="40" width="40" height="3" rx="1.5" fill="#E2E8F0" />
                <rect x="6" y="40" width="26" height="3" rx="1.5" fill="#3B82F6" />

                <rect x="60" y="0" width="52" height="50" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="1" />
                <text x="66" y="15" fontSize="7" fill="#64748B">Potencia</text>
                <text x="66" y="32" fontSize="12" fontWeight="bold" fill="#1E293B">2.4kW</text>
                <rect x="66" y="40" width="40" height="3" rx="1.5" fill="#E2E8F0" />
                <rect x="66" y="40" width="28" height="3" rx="1.5" fill="#06B6D4" />
              </g>
            </g>
          </motion.g>
        </g>

        {/* --- CONNECTION LINE (House to Phone) --- */}
        <motion.path
          d="M310 230 C360 220, 390 180, 410 150"
          stroke="url(#blueGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          filter="url(#glow)"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        />

        {/* Energy Particles */}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            r="2.5"
            fill="#3B82F6"
            filter="url(#glow)"
            initial={{ cx: 310, cy: 230, opacity: 0 }}
            animate={{ 
              cx: [310, 360, 410],
              cy: [230, 195, 150],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              delay: 1.2 + (i * 0.5),
              ease: "easeInOut",
            }}
          />
        ))}



      </svg>
    </div>
  );
}

// 5. Feature Card (Bento Grid Style)
function FeatureCard({ icon, title, desc, delay, className = "" }: { icon: React.ReactNode, title: string, desc: string, delay: number, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className={`group p-8 rounded-[2rem] bg-white border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(59,130,246,0.1)] transition-all duration-500 hover:-translate-y-2 ${className}`}
    >
      <div className="w-16 h-16 bg-blue-50/50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-lg">{desc}</p>
    </motion.div>
  );
}

// ========================================
// PÁGINA PRINCIPAL
// ========================================

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [heroTextIndex, setHeroTextIndex] = useState(0);
  const heroWords = ["Conectado.", "Inteligente.", "Eficiente.", "Seguro."];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setHeroTextIndex((prev) => (prev + 1) % heroWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      <Cursor />
      <NoiseOverlay />
      
      {/* Navbar Flotante Premium */}
      <nav className="fixed top-0 w-full z-50 px-4 py-6 flex justify-center">
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="w-full max-w-5xl bg-white/70 backdrop-blur-2xl border border-white/40 rounded-full px-6 py-3 flex justify-between items-center shadow-[0_8px_40px_rgba(0,0,0,0.08)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full flex items-center justify-center text-white shadow-lg">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">
              Energy Home
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Cómo funciona', href: '#como-funciona' },
              { label: 'Características', href: '#features' },
              { label: 'Demo', href: '#demo' },
              { label: 'Testimonios', href: '#testimonios' },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors relative group">
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="px-4 py-2 rounded-full text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all border border-gray-200">
              Iniciar Sesión
            </Link>
            <Link href="/register">
              <MagneticButton className="bg-gray-900 text-white px-4 sm:px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 flex items-center gap-2">
                <span className="hidden sm:inline">Registrarse</span>
                <span className="sm:hidden">Registro</span>
                <ArrowRight size={14} />
              </MagneticButton>
            </Link>
            <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </motion.div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={isMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          className="md:hidden overflow-hidden bg-white/90 backdrop-blur-xl rounded-3xl mt-2 border border-white/20 shadow-xl"
        >
          <div className="flex flex-col p-6 gap-4">
            <Link href="#como-funciona" className="text-gray-600 font-medium hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Cómo funciona</Link>
            <Link href="#features" className="text-gray-600 font-medium hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Características</Link>
            <Link href="#demo" className="text-gray-600 font-medium hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Demo</Link>
            <Link href="#testimonios" className="text-gray-600 font-medium hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Testimonios</Link>
            <hr className="border-gray-100" />
            <Link href="/login" className="text-gray-900 font-bold hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>
              Iniciar Sesión
            </Link>
            <Link href="/register" onClick={() => setIsMenuOpen(false)} className="bg-gray-900 text-white px-6 py-3 rounded-xl text-center font-bold shadow-lg shadow-gray-900/20 block">
              Comenzar Gratis
            </Link>
          </div>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            style={{ opacity, scale }}
            className="text-center lg:text-left z-10"
          >
            <div className="mb-8 min-h-[160px]">
              <Typewriter 
                text="Tu Hogar," 
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] block"
                delay={0.1}
              />
              <Typewriter 
                key={heroWords[heroTextIndex]}
                text={heroWords[heroTextIndex]} 
                className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 tracking-tight leading-[1.1] block"
                delay={0.1}
              />
            </div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-500 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              Control total de tu consumo energético. Visualiza datos en tiempo real y optimiza tu hogar con nuestra plataforma inteligente.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/register">
                <MagneticButton className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 group">
                  Empezar Ahora
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </MagneticButton>
              </Link>
              <Link href="#demo">
                <MagneticButton className="w-full sm:w-auto px-10 py-5 bg-white text-gray-900 border border-gray-200 rounded-full font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center">
                  Ver Demo
                </MagneticButton>
              </Link>
            </motion.div>
          </motion.div>

          {/* Animación Central (Isometric House) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="relative w-full flex justify-center lg:block"
          >
            <HeroAnimation />
          </motion.div>
        </div>
      </section>

      {/* Marquee Section */}
      <Marquee text="AHORRO • EFICIENCIA • CONTROL • TECNOLOGÍA • IOT • SUSTENTABILIDAD •" speed={40} />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight"
            >
              Tecnología que se <br />
              <span className="text-blue-600">siente mágica.</span>
            </motion.h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Hemos simplificado lo complejo. Conecta tus dispositivos y deja que nuestros algoritmos hagan el resto.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Activity size={32} />}
              title="Tiempo Real"
              desc="Visualiza el voltaje, amperaje y potencia al instante. Sin retrasos, sin complicaciones."
              delay={0.1}
              className="md:col-span-2 bg-gradient-to-br from-white to-blue-50/30"
            />
            <FeatureCard 
              icon={<BarChart3 size={32} />}
              title="Analíticas"
              desc="Gráficos históricos detallados."
              delay={0.2}
            />
            <FeatureCard 
              icon={<Shield size={32} />}
              title="Seguridad Total"
              desc="Tus datos están encriptados de extremo a extremo. Privacidad garantizada."
              delay={0.3}
            />
            <FeatureCard 
              icon={<Cpu size={32} />}
              title="IA Integrada"
              desc="Algoritmos que aprenden de tus hábitos para optimizar el consumo automáticamente."
              delay={0.4}
              className="md:col-span-2 bg-gradient-to-br from-white to-cyan-50/30"
            />
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <DemoVideo />

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Final */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gray-900 rounded-[3rem] p-12 md:p-24 text-center overflow-hidden shadow-2xl shadow-gray-900/30">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
                ¿Listo para el futuro?
              </h2>
              <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                Únete a la revolución energética. Empieza a ahorrar hoy mismo con EnergyFlow.
              </p>
              <Link href="/register">
                <MagneticButton className="px-12 py-6 bg-white text-gray-900 rounded-full font-bold text-xl hover:bg-blue-50 transition-all hover:scale-105 shadow-xl shadow-white/10">
                  Crear Cuenta Gratis
                </MagneticButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
