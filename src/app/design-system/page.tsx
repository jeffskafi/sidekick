'use client';

import React, { useState } from 'react';

// Multi-option Toggle component
const MultiToggle = ({ options, value, onChange }) => {
  return (
    <div className="flex rounded-lg border border-gray-300 overflow-hidden">
      {options.map((option) => (
        <button
          key={option.value}
          className={`px-4 py-2 text-sm font-medium ${
            value === option.value
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

// Slider Toggle component
const SliderToggle = ({ min, max, value, onChange }) => {
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
    />
  );
};

// Segmented Control component
const SegmentedControl = ({ options, value, onChange }) => {
  return (
    <div className="flex rounded-lg bg-gray-200 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md ${
            value === option.value
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

// Dropdown Select component
const DropdownSelect = ({ options, value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default function DesignSystem() {
  const [theme, setTheme] = useState('system');
  const [fontSize, setFontSize] = useState(16);
  const [layout, setLayout] = useState('list');
  const [language, setLanguage] = useState('en');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Sidekick Multi-State Toggles</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Theme Selector</h2>
        <MultiToggle
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' },
          ]}
          value={theme}
          onChange={setTheme}
        />
        <p className="mt-2 text-sm text-gray-600">Selected theme: {theme}</p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Font Size Adjuster</h2>
        <SliderToggle min={12} max={24} value={fontSize} onChange={setFontSize} />
        <p className="mt-2 text-sm text-gray-600">Font size: {fontSize}px</p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Layout Switcher</h2>
        <SegmentedControl
          options={[
            { value: 'list', label: 'List' },
            { value: 'grid', label: 'Grid' },
            { value: 'board', label: 'Board' },
          ]}
          value={layout}
          onChange={setLayout}
        />
        <p className="mt-2 text-sm text-gray-600">Selected layout: {layout}</p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Language Selector</h2>
        <DropdownSelect
          options={[
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' },
            { value: 'fr', label: 'Français' },
            { value: 'de', label: 'Deutsch' },
          ]}
          value={language}
          onChange={setLanguage}
        />
        <p className="mt-2 text-sm text-gray-600">Selected language: {language}</p>
      </section>
    </div>
  );
}