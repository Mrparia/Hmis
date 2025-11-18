
import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'primary' | 'accent' | 'secondary' | 'green' | 'yellow' | 'purple' | 'teal' | 'pink';
  onClick?: () => void;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, value, icon, color = 'primary', onClick, className }) => {
  const colorClasses = {
    primary: 'bg-primary-dark text-white',
    accent: 'bg-accent text-white',
    secondary: 'bg-secondary text-white',
    green: 'bg-green-600 text-white',
    yellow: 'bg-yellow-500 text-white',
    purple: 'bg-purple-600 text-white',
    teal: 'bg-teal-600 text-white',
    pink: 'bg-pink-600 text-white',
  }[color] || 'bg-primary-dark text-white';

  const hoverClass = onClick ? 'hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 cursor-pointer' : '';

  return (
    <div 
      className={`bg-surface rounded-xl shadow-lg flex items-center p-5 ${hoverClass} ${className}`}
      onClick={onClick}
    >
      <div className={`rounded-full p-4 mr-5 ${colorClasses}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-on-surface">{value}</p>
      </div>
    </div>
  );
};

export default Card;