import React, { useState } from 'react';
import Discovery from '../../assets/Discovery.jpeg';
import Customization from '../../assets/Customization.jpg';
import Integration from '../../assets/Integration.jpg';
import Support from '../../assets/Support.jpg';

interface Step {
  title: string;
  description: string;
  detailed: string;
  image: string;
}

const FourthSection: React.FC = () => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const handleMouseEnter = (step: number) => {
    setHoveredStep(step);
  };

  const handleMouseLeave = () => {
    setHoveredStep(null);
  };

  const steps: Step[] = [
    {
      title: 'Discover',
      description: 'We assess your needs for the perfect fit.',
      detailed:
        'Our team conducts a thorough assessment to ensure we understand your unique business requirements and goals.',
      image: Discovery,
    },
    {
      title: 'Customize',
      description: 'Solutions tailored to your goals.',
      detailed:
        'Every aspect of our solution is customized to align perfectly with your specific industry requirements and business objectives.',
      image: Customization,
    },
    {
      title: 'Integrate',
      description: 'Quick setup with your systems.',
      detailed:
        'We handle the entire integration process, ensuring seamless compatibility with your existing systems and minimal disruption to your operations.',
      image: Integration,
    },
    {
      title: 'Support',
      description: '24/7 assistance for smooth operations.',
      detailed:
        'Our dedicated support team is available around the clock to help with any questions and provide continuous updates as your business evolves.',
      image: Support,
    },
  ];

  return (
    <div className="bg-gray-50 py-16 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-[#00599c] mb-2">
          Get Started in 4 Simple Steps
        </h2>
        <div className="w-24 h-1 bg-[#dbb269] mx-auto mb-12"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden ${
                hoveredStep === index ? 'ring-2 ring-[#00599c]' : ''
              }`}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={step.image}
                  alt={`${step.title} illustration`}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#00599c] mb-2">{step.title}</h3>
                <p className="text-gray-700 mb-3">{step.description}</p>
                {hoveredStep === index && (
                  <p className="text-gray-600 mt-4 pt-3 border-t border-gray-200">
                    {step.detailed}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FourthSection;