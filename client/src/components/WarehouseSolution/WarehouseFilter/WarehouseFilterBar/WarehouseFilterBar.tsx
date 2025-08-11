import React, { useState, useEffect } from 'react';
import RangeSlider from '../RangeSlider/RangeSlider';
import SearchBar from '../../../SearchBar/SearchBar';

interface Filters {
  location?: string;
  sizeRange?: [number, number];
  budgetRange?: [number, number];
  storageType?: string;
}

interface WarehouseFilterBarProps {
  onFiltersApply: (filters: Filters) => void;
  searchQuery?: string;
}

const WarehouseFilterBar: React.FC<WarehouseFilterBarProps> = ({ 
  onFiltersApply, 
  searchQuery 
}) => {
  const [sizeRange, setSizeRange] = useState<[number, number]>([500, 20000]);
  const [budgetRange, setBudgetRange] = useState<[number, number]>([10, 100]);
  const [storageType, setStorageType] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>(searchQuery || '');

  // Sync searchValue when searchQuery prop changes
  useEffect(() => {
    if (searchQuery !== undefined) {
      setSearchValue(searchQuery);
    }
  }, [searchQuery]);

  const handleApplyFilters = () => {
    try {
      const filters: Filters = {};
      if (searchValue) filters.location = searchValue;
      if (sizeRange) filters.sizeRange = sizeRange;
      if (budgetRange) filters.budgetRange = budgetRange;
      if (storageType) filters.storageType = storageType;
      onFiltersApply(filters);
    } catch (error) {
    }
  };

  const handleResetFilters = () => {
    try {
      setSizeRange([500, 20000]);
      setBudgetRange([10, 100]);
      setStorageType('');
      setSearchValue('');
      onFiltersApply({});
    } catch (error) {
    }
  };

  return (
    <div className="bg-gray-50 py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 text-center">
              Location
              <span className="ml-1 text-xs text-gray-500">(City)</span>
            </label>
            {/* Updated search input with icon like HeroSection */}
            <div className="relative">
              <input
                type="text"
                placeholder="Enter city"
                value={searchValue || searchQuery || ""}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleApplyFilters();
                  }
                }}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00599c] text-gray-900 bg-white placeholder-gray-500"
              />
              <button
                type="button"
                onClick={handleApplyFilters}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#00599c] hover:text-[#004080] focus:outline-none transition-colors duration-200 cursor-pointer p-1"
                aria-label="Search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 text-center">
              Size in sq. ft.
            </label>
            <RangeSlider
              min={500}
              max={20000}
              step={100}
              value={sizeRange}
              title="Size Range"
              onChange={(min: number, max: number) => setSizeRange([min, max])}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 text-center">
              Price in ₹/sq. ft.
            </label>
            <RangeSlider
              min={10}
              max={100}
              step={1}
              value={budgetRange}
              title="Price Range"
              onChange={(min: number, max: number) => setBudgetRange([min, max])}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 text-center">
              Type of Storage
            </label>
            {/* Updated select with black border and consistent styling */}
            <select
              value={storageType}
              onChange={(e) => setStorageType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00599c] text-gray-900 bg-white placeholder-gray-500 appearance-none text-center"
              style={{
                colorScheme: 'light',
                backgroundColor: '#ffffff',
                color: '#111827',
                WebkitAppearance: 'none',
                MozAppearance: 'none'
              }}
            >
              <option value="">Select Type</option>
              <option value="Standard or General Storage">Standard or General Storage</option>
              <option value="Climate Controlled Storage">Temperature-Controlled Storage</option>
              <option value="Hazardous Chemicals Storage">Hazardous Chemicals Storage</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={handleApplyFilters}
            className="px-6 py-3 bg-[#00599c] text-white font-semibold rounded-lg shadow-md hover:bg-[#dbb269] hover:text-black transition-colors duration-300"
          >
            Apply Filter
          </button>
          <button
            onClick={handleResetFilters}
            className="px-6 py-3 bg-[#dbb269] text-black font-semibold rounded-lg shadow-md hover:bg-[#00599c] hover:text-white transition-colors duration-300"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarehouseFilterBar;