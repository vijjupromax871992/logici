import React, { forwardRef } from 'react';
import wmsImage from '../../../assets/ws-section-2-1.jpg';
import aiImage from '../../../assets/ws-section-2-2.jpg';
import darkStoreImage from '../../../assets/ws-section-2-3.jpg';
import inventoryImage from '../../../assets/ws-section-2-4.jpg';
import analyticsImage from '../../../assets/ws-section-2-5.jpg';
import industriesImage from '../../../assets/ws-section-2-6.jpg';

const solutions = [
  { id: 'WMS', heading: 'Warehouse Management System (WMS)', title: 'Revolutionizing Indian Warehousing with Precision and Flexibility', image: wmsImage },
  { id: 'AI', heading: 'AI-Powered Solutions', title: 'Driving Efficiency and Innovation through AI-Powered Technology', image: aiImage },
  { id: 'DarkStore', heading: 'Dark Store Solutions', title: 'Enhancing Customer Satisfaction with Dark Store Fulfillment Centers', image: darkStoreImage },
  { id: 'Inventory', heading: 'Inventory & Order Management', title: 'From Stock to Delivery: A Complete, Data-Driven Approach to Inventory and Order Management Excellence', image: inventoryImage },
  { id: 'Analytics', heading: 'Analytics & Insights', title: 'Uncover Opportunities, Drive Efficiency: Advanced Analytics & Insights for Next-Level Warehouse Performance', image: analyticsImage },
  { id: 'Industries', heading: 'Industries', title: 'Empowering Industries with Custom Warehousing Strategies for Scalable, Future-Ready Growth', image: industriesImage },
];

const solutionContent: Record<string, JSX.Element> = {
  WMS: (
    <div className="space-y-4 text-[#374151]">
      <p className="leading-relaxed">
        In an era where agility and precision define success, Logic-I's
        Warehouse Management System (WMS) stands as a transformative solution in
        the Indian warehousing landscape. Designed with cutting-edge AI and
        automation, Logic-I's WMS redefines efficiency by streamlining inventory
        management, optimizing space utilization, and enabling real-time
        visibility into warehouse operations.
      </p>
      <p className="leading-relaxed">
        Logic-I's forward-thinking approach not only enhances operational
        efficiency but also supports businesses in achieving their
        sustainability and regulatory goals. With its commitment to renewable
        energy and waste reduction, Logic-I is poised to become a leader in
        eco-friendly warehousing in India.
      </p>
    </div>
  ),
  AI: (
    <div className="space-y-4 text-[#374151]">
      <p className="leading-relaxed">
        Logic-i stands at the forefront of logistics innovation, combining the
        power of artificial intelligence with a flexible, on-demand warehousing
        model. In an industry defined by shifting demand and high customer
        expectations, our solutions enable businesses to lead with agility and
        intelligence, setting a new standard for data-driven, real-time
        decision-making.
      </p>
      <p className="leading-relaxed">
        Our dynamic warehousing platform optimizes storage, streamlines
        operations, and delivers strategic advantages across the supply chain.
        AI-driven insights empower clients to transform complex data into
        actionable decisions that increase productivity and reduce costs,
        positioning Logic-i as a key partner for organizations aiming to enhance
        their logistics capabilities.
      </p>
    </div>
  ),
  DarkStore: (
    <div className="space-y-4 text-[#374151]">
      <p className="leading-relaxed">
        As online retail rapidly expands, dark store solutions are transforming
        into a critical asset for businesses striving for agile, high-speed
        order fulfillment.
      </p>
      <p className="leading-relaxed">
        Logic-i's AI-driven dark store solutions go beyond traditional
        warehousing by providing strategically located, tech-enhanced facilities
        designed for ultra-fast processing, optimized for e-commerce, and
        customized to adapt to the exact needs of our clients.
      </p>
      <p className="leading-relaxed">
        Logic-i leverages state-of-the-art technology and a deep understanding
        of client needs to establish itself as a leader in dark store operations
        in India.
      </p>
    </div>
  ),
  Inventory: (
    <div className="space-y-4 text-[#374151]">
      <p className="leading-relaxed">
        As digital transformation reshapes supply chains globally, Logic-i's
        AI-driven inventory and order management solutions stand at the
        forefront of innovation, offering advanced features that help businesses
        achieve precision, efficiency, and agility.
      </p>
      <p className="leading-relaxed">
        Designed for modern e-commerce and high-growth sectors, Logic-i's
        platform ensures real-time control, predictive insights, and seamless
        end-to-end management across the entire inventory lifecycle. By
        integrating automation, data analytics, and AI, Logic-i's inventory and
        order management solutions offer clients unparalleled control and
        accuracy—outsmarting legacy systems and setting a new industry standard.
      </p>
    </div>
  ),
  Analytics: (
    <div className="space-y-4 text-[#374151]">
      <p className="leading-relaxed">
        Logic-i's Analytics & Insights section represents a cornerstone in
        intelligent warehousing, offering clients actionable data, predictive
        capabilities, and detailed operational insights.
      </p>
      <p className="leading-relaxed">
        By leveraging cutting-edge AI, machine learning, and data visualization
        tools, Logic-i transforms raw data into valuable insights, empowering
        clients to make proactive, data-driven decisions. Our Analytics &
        Insights platform integrates seamlessly with warehouse operations to
        deliver comprehensive visibility across inventory, order processing,
        demand forecasting, and more—providing clients with a competitive edge
        that standard systems lack.
      </p>
    </div>
  ),
  Industries: (
    <div className="space-y-4 text-[#374151]">
      <p className="leading-relaxed">
        Logic-i's Warehouse Solutions are tailored to meet the unique demands of
        diverse industries, leveraging AI-driven insights and adaptive
        warehousing to support companies in high-growth and dynamic sectors.
      </p>
      <p className="leading-relaxed">
        Whether for fast-moving consumer goods (FMCG), e-commerce,
        pharmaceuticals, or manufacturing, Logic-i provides industry-specific
        solutions that prioritize efficiency, scalability, and sustainability.
        By addressing the unique challenges and optimizing warehousing
        strategies for each industry, Logic-i redefines warehousing standards
        across sectors, delivering unmatched flexibility and precision in supply
        chain management.
      </p>
    </div>
  ),
};

interface WsSection2Props {
  onSolutionSelect: (solutionId: string) => void;
  selectedSolution: string;
}

const WsSection2 = forwardRef<HTMLElement, WsSection2Props>(
  ({ onSolutionSelect, selectedSolution }, ref) => {
    const currentSolution = solutions.find((sol) => sol.id === selectedSolution);

    return (
      <section ref={ref} className="py-12 px-4 md:px-8 bg-[#f9fafb]">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#00599c] mb-4">
              Our Solutions
            </h2>
          </div>

          {/* Solution Navigation Buttons */}
          <div className="flex justify-center mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 max-w-7xl w-full">
              {solutions.map((solution) => (
                <button
                  key={solution.id}
                  className={`px-3 py-4 sm:text-sm font-semibold rounded-lg transition-all duration-300 shadow-md text-center text-2xl h-24 flex items-center justify-center leading-tight ${
                    selectedSolution === solution.id
                      ? 'bg-[#dbb269] text-black hover:bg-[#dbb269]'
                      : 'bg-[#00599c] text-white hover:bg-[#004080]'
                  }`}
                  onClick={() => onSolutionSelect(solution.id)}
                >
                  <span className="break-words text-xl">{solution.heading}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Card */}
          <div className="bg-white bg-opacity-80 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row items-center gap-8 p-6 md:p-8">
              {/* Text Content */}
              <div className="lg:w-1/2 text-left">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#00599c] mb-6">
                  {currentSolution?.title}
                </h3>
                <div className="text-base md:text-lg">
                  {solutionContent[selectedSolution]}
                </div>
              </div>

              {/* Image Section */}
              <div className="lg:w-1/2 flex justify-center">
                <div className="w-full max-w-md lg:max-w-full">
                  <img
                    src={currentSolution?.image}
                    alt={currentSolution?.title}
                    className="w-full h-auto rounded-lg shadow-lg object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    );
  }
);

WsSection2.displayName = 'WsSection2';

export default WsSection2;