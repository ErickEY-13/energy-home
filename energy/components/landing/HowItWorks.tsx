'use client';

import { motion } from 'framer-motion';
import { Wifi, BarChart3, PiggyBank } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: <Wifi size={28} />,
    title: 'Conecta tu dispositivo',
    description: 'Instala nuestro sensor en tu panel eléctrico. Solo toma 5 minutos y no necesitas herramientas especiales.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    number: '02',
    icon: <BarChart3 size={28} />,
    title: 'Monitorea en tiempo real',
    description: 'Visualiza el consumo de cada electrodoméstico desde tu celular. Datos precisos al instante.',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    number: '03',
    icon: <PiggyBank size={28} />,
    title: 'Ahorra automáticamente',
    description: 'Recibe alertas inteligentes y recomendaciones para reducir tu factura hasta un 30%.',
    color: 'from-green-500 to-green-600',
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-32 px-6 bg-[#FAFAFA] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-100/30 rounded-full blur-[100px] -z-10" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6"
          >
            Fácil de usar
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight"
          >
            ¿Cómo funciona?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto"
          >
            En solo 3 simples pasos estarás monitoreando y ahorrando energía
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative group"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-gray-200 to-transparent" />
              )}
              
              <div className="bg-white rounded-3xl p-8 shadow-[0_4px_40px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2">
                {/* Number Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-6xl font-black text-gray-100 group-hover:text-blue-100 transition-colors">
                    {step.number}
                  </span>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg`}>
                    {step.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
