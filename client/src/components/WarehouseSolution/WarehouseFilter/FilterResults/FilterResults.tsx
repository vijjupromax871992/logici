import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Filters } from '../../../../types/Filters';
import {BACKEND_URL} from '../../../../config/api';

interface Warehouse {
  id: string;
  name: string;
  city: string;
  build_up_area: number;
  rent: number;
  warehouse_type: string;
  state: string;
  images?: string | string[];
}

interface FilterResultsProps {
  filters: Filters;
  isPublic?: boolean; 
}

const FilterResults: React.FC<FilterResultsProps> = ({
  filters,
  isPublic = true,
}) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const rowsPerPage = 8; 

  const navigate = useNavigate();
  const baseUrl = `${BACKEND_URL}`;

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: rowsPerPage,
      };

      // Add location filter
      if (filters.location) {
        params.location = filters.location;
      }

      // Add size range filter
      if (filters.sizeRange && Array.isArray(filters.sizeRange) && filters.sizeRange.length === 2) {
        params.min_size = filters.sizeRange[0];
        params.max_size = filters.sizeRange[1];
      }

      // Add budget range filter
      if (filters.budgetRange && Array.isArray(filters.budgetRange) && filters.budgetRange.length === 2) {
        params.min_rent = filters.budgetRange[0];
        params.max_rent = filters.budgetRange[1];
      }

      // Add storage type filter
      if (filters.storageType) {
        params.warehouse_type = filters.storageType;
      }

      // Use public endpoint for client-side viewing, regular endpoint for user panel
      const endpoint = isPublic
        ? `${baseUrl}/api/public/warehouses`
        : `${baseUrl}/api/warehouses`;

      const config = {
        params,
        // Include auth token only for non-public endpoint
        headers: isPublic ? {} : {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };

      const response = await axios.get<{
        data: Warehouse[];
        total: number;
        success: boolean;
      }>(endpoint, config);

      if (response.data.success) {
        setWarehouses(response.data.data || []);
        setTotal(response.data.total || 0);
      } else {
        setWarehouses([]);
        setTotal(0);
      }
    } catch (error) {
      setWarehouses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
    // Reset to first page when filters change
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [filters]);

  useEffect(() => {
    fetchWarehouses();
  }, [currentPage, isPublic]);

  const totalPages = Math.ceil(total / rowsPerPage);

  const handleViewDetails = async (warehouseId: string) => {
    if (isTracking) return; // Prevent multiple clicks
    
    setIsTracking(true);
    try {
      const endpoint = isPublic
        ? `${baseUrl}/api/public/warehouses/${warehouseId}/view`
        : `${baseUrl}/api/warehouses/${warehouseId}/view`;

      const config = isPublic ? {} : {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };

      await axios.post(endpoint, {}, config);

      // Navigate after tracking attempt (whether successful or not)
      if (isPublic) {
        navigate(`/warehouse-details/${warehouseId}`);
      } else {
        navigate(`/user-panel/warehouse-details/${warehouseId}`);
      }
    } catch (error) {
      // Still navigate even if tracking fails
      if (isPublic) {
        navigate(`/warehouse-details/${warehouseId}`);
      } else {
        navigate(`/user-panel/warehouse-details/${warehouseId}`);
      }
    } finally {
      setIsTracking(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00599c]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Results Summary */}
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-[#00599c]">
          <h2 className="text-base sm:text-lg font-medium text-[#00599c]">
            {total > 0
              ? `${total} warehouses found ${filters.location ? `in ${filters.location}` : ''}`
              : 'No warehouses found matching your criteria. Please try different filters.'}
          </h2>
        </div>

        {/* Warehouse List */}
        <div className="space-y-6">
          {warehouses.length > 0 ? (
            warehouses.map((warehouse) => (
              <div
                key={warehouse.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  {/* Warehouse Title */}
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 truncate">
                    {`${warehouse.build_up_area.toLocaleString()} Sq. Ft. warehouse available in ${
                      warehouse.city
                    }`}
                  </h3>

                  {/* Warehouse Content */}
                  <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                    {/* Image Section - Fixed dimensions */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                      <div className="aspect-[4/3] relative rounded-lg overflow-hidden bg-gray-100">
                        {warehouse.images ? (
                          <img
                            src={
                              typeof warehouse.images === 'string' 
                                ? `${baseUrl}/${warehouse.images.split(',')[0].trim()}`
                                : Array.isArray(warehouse.images) && warehouse.images.length > 0
                                  ? `${baseUrl}/${warehouse.images[0]}`
                                  : `${baseUrl}/uploads/default.jpg`
                            }
                            alt={`${warehouse.name || 'Warehouse'}`}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).onerror = null;
                              (e.target as HTMLImageElement).src = `${baseUrl}/uploads/default.jpg`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-16 h-16 text-gray-400"
                            >
                              <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"></path>
                              <path d="M6 18h12"></path>
                              <path d="M6 14h12"></path>
                              <rect x="6" y="10" width="12" height="12"></rect>
                              <path d="M12 22v-9"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">Warehouse Name</p>
                            <p className="font-medium text-gray-900 truncate">
                              {warehouse.name}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">Warehouse Size</p>
                            <p className="font-medium text-gray-900">
                              {warehouse.build_up_area.toLocaleString()} Sq.Ft.
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">Rent</p>
                            <p className="font-medium text-gray-900">
                              {warehouse.rent} Rs/Sq.Ft
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">Type</p>
                            <p className="font-medium text-gray-900 truncate">
                              {warehouse.warehouse_type}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">City</p>
                            <p className="font-medium text-gray-900 truncate">
                              {warehouse.city}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-600">State</p>
                            <p className="font-medium text-gray-900 truncate">
                              {warehouse.state}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <div className="mt-4 sm:mt-6 flex justify-end">
                        <button
                          onClick={() => handleViewDetails(warehouse.id)}
                          disabled={isTracking}
                          className="px-6 py-3 bg-[#00599c] text-white font-semibold rounded-lg shadow-md hover:bg-[#dbb269] hover:text-black transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#00599c] focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                          {isTracking ? 'Loading...' : 'View Details'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="flex flex-col items-center justify-center py-12">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No warehouses found</h3>
                <p className="text-gray-500 max-w-md">
                  Try adjusting your search criteria or filters to find more warehouses.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 bg-white p-4 rounded-lg shadow-md">
            {/* Page Information */}
            <div className="text-sm text-gray-600">
              Showing page {currentPage} of {totalPages}
            </div>

            {/* Page Numbers on Medium+ Screens */}
            <div className="hidden md:flex flex-wrap justify-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-md transition-colors text-sm duration-200 ${
                    currentPage === i + 1
                      ? 'bg-[#00599c] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Previous/Next Buttons - Always Visible */}
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterResults;