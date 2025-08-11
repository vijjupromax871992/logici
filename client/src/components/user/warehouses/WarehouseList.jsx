import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusFilter } from './components';
import WarehouseCard from './WarehouseCard';
import { BACKEND_URL } from '../../../config/api';
import { useTheme } from '../../../contexts/ThemeContext';


const WarehouseList = () => {
  const { theme } = useTheme();
  const [warehouses, setWarehouses] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchWarehouses = useCallback(async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/warehouses?limit=1000`, 
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
  
      if (!response.ok) throw new Error('Failed to fetch warehouses');
      
      const data = await response.json();
      setWarehouses(data.data);
      setFilteredWarehouses(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  useEffect(() => {
    let result = warehouses;

    // Apply status filter
    if (filter !== 'all') {
      result = result.filter(warehouse => 
        warehouse.approval_status.toLowerCase() === filter.toLowerCase()
      );
    }

    setFilteredWarehouses(result);
  }, [warehouses, filter]);

  const handleFilterChange = (status) => {
    setFilter(status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 
          className="text-2xl font-semibold"
          style={{ color: theme.textPrimary }}
        >
          Your Warehouses
        </h1>
        <Link
          to="/user/warehouses/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
          style={{
            background: theme.buttonPrimary,
            color: theme.textInverted
          }}
        >
          <Plus size={20} />
          Add New Warehouse
        </Link>
      </div>

      {/* Filters */}
      <div 
        className="flex gap-4 p-4 rounded-lg"
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          boxShadow: theme.cardShadow
        }}
      >
        <StatusFilter onFilterChange={handleFilterChange} />
      </div>

      {/* Warehouse Grid */}
      {loading ? (
        <div 
          className="text-center py-12"
          style={{ color: theme.textMuted }}
        >
          Loading warehouses...
        </div>
      ) : error ? (
        <div 
          className="text-center py-12"
          style={{ color: theme.error }}
        >
          Error: {error}
        </div>
      ) : filteredWarehouses.length === 0 ? (
        <div 
          className="text-center py-12"
          style={{ color: theme.textMuted }}
        >
          No warehouses found. Create your first warehouse listing!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWarehouses.map((warehouse) => (
            <WarehouseCard 
              key={warehouse.id} 
              warehouse={warehouse}
              onRefresh={fetchWarehouses}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WarehouseList;