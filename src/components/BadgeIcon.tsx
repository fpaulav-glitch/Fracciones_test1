import React from 'react';
import {
  Award,
  Castle,
  Compass,
  Crown,
  Mountain,
  Pizza,
  Sun,
  Trees,
} from 'lucide-react';
import { BadgeDefinition } from '../types/game';

interface BadgeIconProps {
  iconType: BadgeDefinition['iconType'];
  accentColor: string;
  unlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({
  iconType,
  accentColor,
  unlocked,
  size = 'md',
}) => {
  const boxClass =
    size === 'sm' ? 'w-10 h-10 rounded-xl' : size === 'md' ? 'w-12 h-12 rounded-2xl' : 'w-16 h-16 rounded-2xl';
  const iconClass = size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8';

  const renderIcon = () => {
    switch (iconType) {
      case 'forest':
        return <Trees className={iconClass} />;
      case 'pizza':
        return <Pizza className={iconClass} />;
      case 'temple':
        return <Sun className={iconClass} />;
      case 'mountain':
        return <Mountain className={iconClass} />;
      case 'castle':
        return <Castle className={iconClass} />;
      case 'streak':
        return <Compass className={iconClass} />;
      case 'master':
        return <Crown className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  return (
    <div
      className={`${boxClass} flex items-center justify-center shrink-0 transition-transform ${
        unlocked ? 'text-white shadow-sm' : 'bg-slate-200 text-slate-400'
      }`}
      style={unlocked ? { backgroundColor: accentColor } : undefined}
    >
      {renderIcon()}
    </div>
  );
};
