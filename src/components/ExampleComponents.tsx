import React from 'react';
import { Calendar, User, Settings } from 'lucide-react';
import { cn } from '../utils/cn';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        'card p-6 hover:shadow-md transition-shadow duration-200 animate-slide-up',
        className
      )}
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const ExampleComponents: React.FC = () => {
  const features = [
    {
      title: 'TypeScript Ready',
      description:
        'Full TypeScript support with strict type checking for better development experience.',
      icon: <Settings className="w-5 h-5" />,
    },
    {
      title: 'Modern UI',
      description:
        'Beautiful components built with Tailwind CSS and smooth animations.',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      title: 'Developer Friendly',
      description:
        'Hot reload, ESLint, Prettier, and all the tools you need for productive development.',
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <FeatureCard
          key={feature.title}
          {...feature}
          className={index > 0 ? `delay-${index * 100}` : ''}
        />
      ))}
    </div>
  );
};

export default ExampleComponents;
