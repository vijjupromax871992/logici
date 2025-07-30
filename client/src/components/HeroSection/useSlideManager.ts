import { useState, useEffect, useCallback } from 'react';

const useSlideManager = (totalSlides: number) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    if (!isHovered) {
      const timer = setInterval(nextSlide, 3000);
      return () => clearInterval(timer);
    }
  }, [nextSlide, isHovered]);

  useEffect(() => {
    setShowSearchBar(currentSlide === 0 || currentSlide === 2);
  }, [currentSlide]);

  return {
    currentSlide,
    setCurrentSlide,
    prevSlide,
    nextSlide,
    isHovered,
    setIsHovered,
    showSearchBar,
  };
};

export default useSlideManager;
