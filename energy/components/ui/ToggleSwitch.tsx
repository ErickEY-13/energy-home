'use client';

import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function ToggleSwitch({
  isOn,
  onToggle,
  disabled = false,
  size = 'md',
  label,
}: ToggleSwitchProps) {
  const sizes = {
    sm: { track: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' },
    md: { track: 'w-14 h-7', thumb: 'w-5 h-5', translate: 'translate-x-7' },
    lg: { track: 'w-18 h-9', thumb: 'w-7 h-7', translate: 'translate-x-9' },
  };

  const sizeConfig = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`
          relative ${sizeConfig.track} rounded-full transition-colors duration-300
          ${isOn ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
        `}
        aria-pressed={isOn}
      >
        <motion.span
          className={`
            absolute top-1 left-1 ${sizeConfig.thumb} rounded-full bg-white shadow-md
          `}
          initial={false}
          animate={{
            x: isOn ? (size === 'sm' ? 20 : size === 'md' ? 28 : 36) : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      </button>
      {label && (
        <span className={`text-sm font-medium ${isOn ? 'text-blue-600' : 'text-gray-500'}`}>
          {label}
        </span>
      )}
    </div>
  );
}

export default ToggleSwitch;
