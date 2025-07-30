import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { BACKEND_URL } from '../../config/api';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const suggestionsRef = useRef<HTMLUListElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.length >= 2) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get<string[]>(
        `${BACKEND_URL}/api/cities?query=${value}`
      );
      setSuggestions(response.data);
    } catch (error) {
    }
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (value.trim()) {
      navigate(`/WarehouseSolution?query=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setSuggestions([]);
    if (suggestionsRef.current) {
      suggestionsRef.current.style.display = 'none';
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (suggestions.length > 0 && suggestionsRef.current) {
        suggestionsRef.current.style.display = 'none';
      }
    }, 200);
  };

  const handleFocus = () => {
    if (suggestions.length > 0 && suggestionsRef.current) {
      suggestionsRef.current.style.display = 'block';
    }
  };

  return (
    <div className="SearchBar-search-bar-container">
      <form onSubmit={handleSearchSubmit} className="SearchBar-search-bar-form">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className="SearchBar-search-input"
          placeholder="Enter city"
        />
        <button type="submit" className="SearchBar-search-icon">
          <SearchIcon fontSize="large" />
        </button>

        {suggestions.length > 0 && (
          <ul className="SearchBar-suggestions-list" ref={suggestionsRef}>
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="SearchBar-suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
