import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ToS from '../components/ToS/ToS';

const TermsOfService: React.FC = () => {
  return (
    <div>
      <Navbar />
      <main>
        <ToS />
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;