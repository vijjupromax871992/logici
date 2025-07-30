import Slide1 from '../../assets/Slider1-3.jpg';
import Slide2 from '../../assets/Software-Solutions3.jpg';
import Slide3 from '../../assets/BMS-2.jpg';

interface Slide {
  image: string;
  headline: string;
  subHeadline: string;
  redirectPath: string;
}

const SLIDES: Slide[] = [
  {
    image: Slide1,
    headline: 'Flexible Warehouse Solutions in India',
    subHeadline:
      'Book scalable warehouse space anywhere in India—perfect for startups to enterprises. Choose short-term or long-term rentals and streamline your operations with Logic-I.',
    redirectPath: '/WarehouseSolution',
  },
  {
    image: Slide2,
    headline: 'Boost Efficiency with Advanced WMS',
    subHeadline:
      'Our Warehouse Management System (WMS) offers real-time inventory tracking, automated workflows, and space optimization - helping all businesses save up to 30% on costs',
    redirectPath: '/WarehouseSolution',
  },
  {
    image: Slide3,
    headline: 'Future-Proof with AI-Driven Warehousing',
    subHeadline:
      "Leverage AI to predict demand, automate tasks, and gain actionable insights. Stay competitive in India’s market with our smart warehouse solutions.",
    redirectPath: '/WarehouseSolution',
  },
];

export default SLIDES;