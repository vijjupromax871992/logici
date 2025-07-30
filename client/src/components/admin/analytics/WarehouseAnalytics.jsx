import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BACKEND_URL} from '../../../config/api';

const WarehouseAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [warehouseTypes, setWarehouseTypes] = useState([]);
  const [topCities, setTopCities] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884D8',
    '#82CA9D',
    '#A4DE6C',
  ];

  // Update getImageUrl function
  const getImageUrl = (warehouse) => {
    if (!warehouse || !warehouse.images) return '/placeholder-warehouse.jpg';

    // Get the main image (first one from the array)
    const mainImage = Array.isArray(warehouse.images)
      ? warehouse.images[0]
      : warehouse.images?.split(',')[0];

    if (!mainImage) return '/placeholder-warehouse.jpg';

    return mainImage.startsWith('http')
      ? mainImage
      : `${BACKEND_URL}/${mainImage}`;
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${BACKEND_URL}/admin/analytics/warehouses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch analytics');
        }

        const data = result.data;
        setAnalytics(data);
        setTotalPages(Math.ceil(data.length / itemsPerPage));

        // Process warehouse types for pie chart
        const typeMap = {};
        data.forEach((item) => {
          const type = item.warehouse?.warehouse_type || 'Unknown';
          typeMap[type] = (typeMap[type] || 0) + 1;
        });

        const typeData = Object.entries(typeMap).map(([name, value]) => ({
          name,
          value,
        }));
        setWarehouseTypes(typeData);

        // Process top cities
        const cityMap = {};
        data.forEach((item) => {
          const city = item.warehouse?.city || 'Unknown';
          cityMap[city] = (cityMap[city] || 0) + (item.views || 0);
        });

        const cityData = Object.entries(cityMap)
          .map(([city, views]) => ({
            city,
            views,
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 5);

        setTopCities(cityData);
      } catch (err) {
        setError(err.message || 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return analytics.slice(startIndex, endIndex);
  };

  // Pagination controls
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      <h1 className="text-2xl font-semibold mb-6 text-white">
        Warehouse Analytics
      </h1>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Warehouse Types */}
        <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-white">
            Warehouses by Type
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={warehouseTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {warehouseTypes.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} warehouses`, 'Count']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-white">
            Top Cities by Views
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topCities}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="city" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="#8884d8" name="Total Views" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Table */}
      <div className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">
            Detailed Warehouse Analytics
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Warehouse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Inquiries
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Conversion Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {getPaginatedData().map((item, index) => {
                const conversionRate =
                  item.views > 0
                    ? (((item.inquiries || 0) / item.views) * 100).toFixed(1)
                    : '0.0';

                return (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={getImageUrl(item.warehouse)}
                            alt={item.warehouse?.name}
                            onError={(e) => {
                              e.target.onerror = null;
                                'Failed to load image:',
                                item.warehouse?.images
                              );
                              e.target.src = '/placeholder-warehouse.jpg';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-200">
                            {item.warehouse?.name || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-200">
                        {item.warehouse?.city || 'Unknown'},{' '}
                        {item.warehouse?.state || ''}
                      </div>
                      <div className="text-sm text-gray-400">
                        {item.warehouse?.country || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-900 text-blue-200">
                        {item.warehouse?.warehouse_type || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-200">
                      {item.views || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-200">
                      {item.inquiries || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div
                        className={`font-medium ${
                          parseFloat(conversionRate) > 3
                            ? 'text-green-400'
                            : parseFloat(conversionRate) > 1
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        }`}
                      >
                        {conversionRate}%
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, analytics.length)} of{' '}
            {analytics.length} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 py-1 bg-gray-700 text-gray-200 rounded">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseAnalytics;
