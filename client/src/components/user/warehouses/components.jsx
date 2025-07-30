import { useState } from 'react';
import PropTypes from 'prop-types';
import { Search, Filter } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

// SearchBar Component
const SearchBar = ({ onSearch }) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="relative flex-1">
      <Search 
        className="absolute left-3 top-1/2 transform -translate-y-1/2" 
        size={20}
        style={{ color: theme.textMuted }}
      />
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search warehouses..."
        className="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
        style={{
          background: theme.inputBg,
          color: theme.textPrimary,
          border: `1px solid ${theme.inputBorder}`,
          '::placeholder': { color: theme.textMuted }
        }}
      />
    </div>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired
};

// StatusFilter Component
const StatusFilter = ({ onFilterChange }) => {
  const { theme } = useTheme();
  const [status, setStatus] = useState('all');

  const handleChange = (e) => {
    const value = e.target.value;
    setStatus(value);
    onFilterChange(value);
  };

  return (
    <div 
      className="relative inline-flex items-center rounded-lg"
      style={{
        background: theme.inputBg,
        border: `1px solid ${theme.inputBorder}`
      }}
    >
      <Filter 
        size={20} 
        className="absolute left-3 pointer-events-none"
        style={{ color: theme.textMuted }}
      />
      <select
        value={status}
        onChange={handleChange}
        className="appearance-none bg-transparent pl-10 pr-4 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:border-transparent"
        style={{
          color: theme.textPrimary,
          focusRingColor: theme.primary
        }}
      >
        <option value="all" style={{ background: theme.surface }}>All Status</option>
        <option value="approved" style={{ background: theme.surface }}>Approved</option>
        <option value="pending" style={{ background: theme.surface }}>Pending</option>
        <option value="rejected" style={{ background: theme.surface }}>Rejected</option>
      </select>
    </div>
  );
};

StatusFilter.propTypes = {
  onFilterChange: PropTypes.func.isRequired
};

export { SearchBar, StatusFilter };