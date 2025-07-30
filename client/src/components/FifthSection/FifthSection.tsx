import React from 'react';

interface Industry {
  title: string;
  description: string;
  icon: string;
}

const industries: Industry[] = [
  {
    title: 'Retail & E-commerce',
    description: 'Fast deliveries with dark stores.',
    icon: '🛒',
  },
  {
    title: 'FMCG',
    description: 'Automated workflows for high volumes.',
    icon: '🛍️',
  },
  {
    title: 'Healthcare',
    description: 'Compliant cold storage for pharmaceuticals.',
    icon: '💊',
  },
  {
    title: 'Automotive',
    description: 'Efficient supply chain management.',
    icon: '🚙',
  },
  {
    title: 'Manufacturing',
    description: 'Just-in-time inventory solutions.',
    icon: '🏭',
  },
  {
    title: 'Finance',
    description: 'Secure data tools for insights.',
    icon: '💳',
  },
  {
    title: 'Logistics',
    description: 'End-to-end warehouse management.',
    icon: '🚢',
  },
  {
    title: 'Real Estate',
    description: 'Optimize facilities with analytics.',
    icon: '🏢',
  },
];

const FifthSection: React.FC = () => {
  return (
    <div className="bg-gray-50 py-12 px-4 md:px-8 text-center relative overflow-hidden w-full">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#00599c] text-center mb-6 md:mb-8">
          Solutions for Every Industry
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {industries.map((industry, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 h-48 sm:h-56 md:h-64 relative cursor-pointer group"
            >
              <div className="flex flex-col items-center justify-center h-full p-4 md:p-6 bg-white group-hover:bg-[#00599c] transition-colors duration-300">
                <div className="text-3xl sm:text-4xl md:text-5xl mb-2 md:mb-4 group-hover:text-[#dbb269] transition-colors duration-300">
                  {industry.icon}
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 group-hover:text-[#dbb269] transition-colors duration-300 mb-2 text-center">
                  {industry.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600 text-center group-hover:text-white transition-colors duration-300 opacity-0 group-hover:opacity-100 absolute bottom-4 md:bottom-6 left-0 right-0 px-3 md:px-4">
                  {industry.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FifthSection;