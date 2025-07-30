import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import WsSection1 from '../components/WarehouseSolution/ws-section-1/ws-section-1';
import WsContactForm from '../components/WarehouseSolution/ws-contact-form/ws-contact-form';
import WsSection2 from '../components/WarehouseSolution/Ws-section-2/Ws-section-2';
import WsSection3 from '../components/WarehouseSolution/Ws-section-3/Ws-section-3';
import WarehouseFilterBar from '../components/WarehouseSolution/WarehouseFilter/WarehouseFilterBar/WarehouseFilterBar';
import FilterResults from '../components/WarehouseSolution/WarehouseFilter/FilterResults/FilterResults';
import { Filters } from '../types/Filters';
import Wsbackground from '../assets/ws-background.jpg';

const WarehouseSolution: React.FC = () => {
  const [selectedSolution, setSelectedSolution] = useState<string>('WMS');
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [appliedFilters, setAppliedFilters] = useState<Filters>({ fetchAll: true });

  const contactFormRef = useRef<HTMLDivElement>(null);
  const backupSection2Ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const handleFiltersApply = (filters: Filters) => {
    setAppliedFilters(filters);
    if (!filters.location) {
      setSearchQuery('');
    }
  };

  const handleContactClick = () => {
    setIsFormVisible(true);
    setTimeout(() => {
      if (contactFormRef.current) {
        contactFormRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 100);
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    const query = params.get('query');

    if (section) {
      setSelectedSolution(section);
      if (backupSection2Ref.current) {
        backupSection2Ref.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
    if (query) {
      setSearchQuery(query);
      setAppliedFilters({ location: query });
    }

    const showContactForm = params.get('showContactForm');
    if (showContactForm === 'true') {
      handleContactClick();
    }
  }, [location]);

  return (
    <div className="warehouse-solution-container">
      <Navbar />
      <WsSection1 onContactClick={handleContactClick} />
      {isFormVisible && (
        <WsContactForm ref={contactFormRef} onClose={handleCloseForm} />
      )}
      <WarehouseFilterBar
        onFiltersApply={handleFiltersApply}
        searchQuery={searchQuery}
      />
      <FilterResults filters={appliedFilters} />
      <WsSection2
        onSolutionSelect={setSelectedSolution}
        selectedSolution={selectedSolution}
        ref={backupSection2Ref}
      />
      <WsSection3
        onContactClick={handleContactClick}
        selectedSolution={selectedSolution}
      />
    </div>
  );
};

export default WarehouseSolution;