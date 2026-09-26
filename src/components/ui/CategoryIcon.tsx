import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Home,
  Car,
  Zap,
  Film,
  HeartPulse,
  ShoppingBag,
  Cpu,
  Sparkles,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  PlusCircle,
  HelpCircle,
  CreditCard,
  Building2,
  Vault,
  Banknote
} from 'lucide-react';

interface CategoryIconProps {
  iconName?: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, className = '', size = 18 }) => {
  switch (iconName) {
    case 'Utensils': return <Utensils size={size} className={className} />;
    case 'ShoppingCart': return <ShoppingCart size={size} className={className} />;
    case 'Home': return <Home size={size} className={className} />;
    case 'Car': return <Car size={size} className={className} />;
    case 'Zap': return <Zap size={size} className={className} />;
    case 'Film': return <Film size={size} className={className} />;
    case 'HeartPulse': return <HeartPulse size={size} className={className} />;
    case 'ShoppingBag': return <ShoppingBag size={size} className={className} />;
    case 'Cpu': return <Cpu size={size} className={className} />;
    case 'Sparkles': return <Sparkles size={size} className={className} />;
    case 'Briefcase': return <Briefcase size={size} className={className} />;
    case 'Laptop': return <Laptop size={size} className={className} />;
    case 'TrendingUp': return <TrendingUp size={size} className={className} />;
    case 'Gift': return <Gift size={size} className={className} />;
    case 'CreditCard': return <CreditCard size={size} className={className} />;
    case 'Building2': return <Building2 size={size} className={className} />;
    case 'Vault': return <Vault size={size} className={className} />;
    case 'Banknote': return <Banknote size={size} className={className} />;
    case 'PlusCircle': return <PlusCircle size={size} className={className} />;
    default: return <HelpCircle size={size} className={className} />;
  }
};
