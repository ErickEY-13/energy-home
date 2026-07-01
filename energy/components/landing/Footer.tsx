'use client';

import { Link } from 'next-view-transitions';
import { Zap, Twitter, Github, Linkedin, Instagram, Mail, MapPin, Phone } from 'lucide-react';

const footerLinks = {
  producto: [
    { label: 'Características', href: '#features' },
    { label: 'Cómo funciona', href: '#como-funciona' },
    { label: 'Demo', href: '#demo' },
    { label: 'Testimonios', href: '#testimonios' },
  ],
  empresa: [
    { label: 'Sobre nosotros', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Carreras', href: '#' },
    { label: 'Prensa', href: '#' },
  ],
  soporte: [
    { label: 'Centro de ayuda', href: '#' },
    { label: 'Documentación', href: '#' },
    { label: 'Guías', href: '#' },
    { label: 'Contacto', href: '#' },
  ],
  legal: [
    { label: 'Privacidad', href: '#' },
    { label: 'Términos', href: '#' },
    { label: 'Cookies', href: '#' },
    { label: 'Licencias', href: '#' },
  ],
};

const socialLinks = [
  { icon: <Twitter size={20} />, href: 'https://twitter.com', label: 'Twitter' },
  { icon: <Github size={20} />, href: 'https://github.com', label: 'GitHub' },
  { icon: <Linkedin size={20} />, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: <Instagram size={20} />, href: 'https://instagram.com', label: 'Instagram' },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top Section */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-12 border-b border-gray-800">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center">
                <Zap size={22} className="text-gray-900" fill="currentColor" />
              </div>
              <span className="font-bold text-xl">Energy Home</span>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-xs">
              Transforma tu hogar en un espacio inteligente y eficiente. Monitorea, controla y ahorra energía.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 text-gray-400 text-sm">
              <a href="mailto:hola@energyhome.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail size={16} />
                hola@energyhome.com
              </a>
              <a href="tel:+528001234567" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone size={16} />
                +52 800 123 4567
              </a>
              <p className="flex items-center gap-2">
                <MapPin size={16} />
                Ciudad de México, México
              </p>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Producto</h4>
            <ul className="space-y-3">
              {footerLinks.producto.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Soporte</h4>
            <ul className="space-y-3">
              {footerLinks.soporte.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="py-12 border-b border-gray-800">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Suscríbete a nuestro newsletter</h3>
            <p className="text-gray-400 mb-6">Recibe tips de ahorro energético y novedades directamente en tu correo.</p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-5 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2025 Energy Home Inc. Todos los derechos reservados.
          </p>
          
          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
