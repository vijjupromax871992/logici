import React from 'react';

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface WsSection3Props {
  selectedSolution: string;
  onContactClick: () => void;
}

const solutionFeatures: Record<string, Feature[]> = {
  WMS: [
    {
      title: 'AI-Powered Demand Forecasting',
      description: 'Logic-i\'s WMS leverages AI-driven analytics for accurate demand forecasting, helping businesses reduce waste and prevent stockouts.',
      icon: '🤖'
    },
    {
      title: 'Real-Time Inventory Tracking',
      description: 'IoT-enabled tracking offers visibility into stock levels and storage conditions, crucial for temperature-sensitive goods like pharmaceuticals.',
      icon: '📊'
    },
    {
      title: 'Flexible, Modular Storage Solutions',
      description: 'Scale storage with modular options that allow businesses to adjust space based on seasonal or temporary needs.',
      icon: '🔧'
    },
    {
      title: 'User-Centric App for Transparency',
      description: 'Logic-i\'s app provides real-time tracking and management of warehousing needs, reducing dependency on intermediaries.',
      icon: '📱'
    },
    {
      title: 'Sustainable Warehousing',
      description: 'Our commitment to eco-friendly practices sets us apart with renewable energy and recycling initiatives.',
      icon: '🌱'
    },
  ],
  AI: [
    {
      title: 'Precision Demand Forecasting with AI',
      description: 'Advanced forecasting for sectors like e-commerce, predicting demand cycles accurately.',
      icon: '🎯'
    },
    {
      title: 'Adaptive Modular Storage',
      description: 'Customizable storage that scales up or down, ideal for businesses with fluctuating demand.',
      icon: '📦'
    },
    {
      title: 'Green Logistics Commitment',
      description: 'Renewable energy, recycling, and waste reduction are integrated into Logic-i\'s AI-powered warehousing solutions.',
      icon: '♻️'
    },
    {
      title: 'Resource Optimization',
      description: 'AI optimizes labor, storage, and energy usage for cost-effective, sustainable warehousing.',
      icon: '⚡'
    },
    {
      title: 'Dynamic Space Allocation',
      description: 'AI analyzes space usage patterns, enabling flexible allocation and optimized storage layout.',
      icon: '🏗️'
    },
  ],
  DarkStore: [
    {
      title: 'AI-Optimized Inventory Placement',
      description: 'Using AI for optimal inventory positioning, ensuring stock levels meet demand in high-turnover environments.',
      icon: '🎯'
    },
    {
      title: 'Fully Automated Operations',
      description: 'Automated picking, sorting, and AGVs ensure faster, accurate order processing.',
      icon: '🔄'
    },
    {
      title: 'Real-Time Order Tracking',
      description: 'Customers enjoy real-time tracking and transparency, increasing satisfaction and repeat business.',
      icon: '📍'
    },
    {
      title: 'Scalable Storage Capacity',
      description: 'Easily adjustable storage capacity for fast, high-turnover items in line with demand surges.',
      icon: '📈'
    },
    {
      title: 'Seamless Last-Mile Integration',
      description: 'Partners with leading logistics providers for efficient last-mile delivery solutions.',
      icon: '🚚'
    },
  ],
  Inventory: [
    {
      title: 'Real-Time Tracking and Management',
      description: 'Instant visibility across inventory levels to prevent discrepancies and ensure stock accuracy.',
      icon: '👁️'
    },
    {
      title: 'AI-Enhanced Demand Forecasting',
      description: 'Optimizes stock levels with seasonal and trend-based forecasting, minimizing waste.',
      icon: '📊'
    },
    {
      title: 'Multi-Channel Inventory Sync',
      description: 'Seamless integration across online marketplaces and retail, avoiding duplicate stock issues.',
      icon: '🔗'
    },
    {
      title: 'Automated Replenishment Alerts',
      description: 'Notifies clients when stock levels are low, supporting proactive inventory management.',
      icon: '🔔'
    },
    {
      title: 'Batch Order Processing',
      description: 'Improves efficiency with batch order processing, ideal for high-demand periods.',
      icon: '📋'
    },
  ],
  Analytics: [
    {
      title: 'Operational Visibility',
      description: 'Real-time dashboards give a full view of warehousing KPIs, enabling proactive management.',
      icon: '📈'
    },
    {
      title: 'Predictive Analytics',
      description: 'Predict future demand patterns and manage warehouse space efficiently with AI insights.',
      icon: '🔮'
    },
    {
      title: 'Detailed Performance Reporting',
      description: 'Customized KPIs and benchmarks allow clients to gauge efficiency and optimize productivity.',
      icon: '📊'
    },
    {
      title: 'Inventory Turnover Insights',
      description: 'Tracks turnover rates, helping to identify high-demand items and optimize stock levels.',
      icon: '🔄'
    },
    {
      title: 'Customer Behavior Analysis',
      description: 'Analyzes buying trends to support stock decisions and improve customer satisfaction.',
      icon: '👥'
    },
  ],
  Industries: [
    {
      title: 'E-commerce & Retail',
      description: 'Flexible storage and rapid fulfillment meet the high-demand cycles of retail industries.',
      icon: '🛒'
    },
    {
      title: 'Pharmaceuticals Compliance',
      description: 'Temperature-controlled, compliant storage for sensitive pharmaceutical goods.',
      icon: '💊'
    },
    {
      title: 'Scalable Storage for Manufacturing',
      description: 'Solutions tailored to raw materials and finished goods in production-driven industries.',
      icon: '🏭'
    },
    {
      title: 'Cold Storage for Perishables',
      description: 'Specialized cold storage options for food, beverages, and other perishable goods.',
      icon: '❄️'
    },
    {
      title: 'Automotive Supply Chain Support',
      description: 'Inventory control and order precision for complex automotive supply chains.',
      icon: '🚗'
    },
  ],
};

const WsSection3: React.FC<WsSection3Props> = ({ selectedSolution, onContactClick }) => {
  const features = solutionFeatures[selectedSolution] || [];

  return (
    <section className="py-12 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#00599c] mb-4">
            Key Features & Benefits
          </h2>
          <p className="text-lg text-[#6b7280] max-w-3xl mx-auto">
            Discover how our solutions transform your warehouse operations with cutting-edge technology and intelligent automation.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative group bg-[#f9fafb] rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border border-transparent hover:border-[#dbb269]"
            >
              {/* Front Content */}
              <div className="group-hover:opacity-0 transition-opacity duration-300">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-4">{feature.icon}</div>
                  <h3 className="text-lg md:text-xl font-bold text-[#00599c] leading-tight">
                    {feature.title}
                  </h3>
                </div>
                <div className="w-12 h-1 bg-[#dbb269] rounded-full"></div>
              </div>

              {/* Back Content */}
              <div className="absolute inset-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                <p className="text-[#374151] text-sm md:text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#00599c] to-[#004080] rounded-xl p-8 md:p-12 text-center text-white">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
            Ready to Transform Your Warehouse Operations?
          </h3>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join hundreds of businesses already benefiting from Logic-i's intelligent warehousing solutions. 
            Start your digital transformation today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onContactClick}
              className="px-8 py-4 bg-[#dbb269] text-black font-semibold rounded-lg shadow-lg hover:bg-white hover:text-[#00599c] transition-colors duration-300 text-lg"
            >
              Book Now!
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <h4 className="text-lg font-semibold text-[#374151] mb-8">
            Trusted by Leading Businesses Across Industries
          </h4>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {[
              '🏢 Enterprise Solutions',
              '🛒 E-commerce Leaders', 
              '💊 Pharmaceutical Giants',
              '🏭 Manufacturing Leaders',
              '🚚 Logistics Partners'
            ].map((trust, index) => (
              <div key={index} className="text-[#6b7280] font-medium">
                {trust}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WsSection3;