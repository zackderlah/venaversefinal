'use client';

import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder || 'Search by title...'}
    className="w-full mb-6 px-4 py-2 border-2 border-black focus:outline-none focus:border-blue-500 bg-white shadow dark:bg-[#0A0A0A] dark:border-gray-100 dark:text-gray-100 dark:placeholder-gray-400"
  />
);

export default SearchBar; 