import React from 'react';

export default function CarouselInput({ values, onInputChange, onTemplateSelect, onModeToggle, onFontChange, onGenerate }) {
  return (
    <div className="flex flex-col gap-6 p-8 bg-dark-900 rounded-l-2xl min-h-[500px] w-full max-w-md">
      <h2 className="text-2xl font-bold text-white mb-2">Create LinkedIn carousels from your text content</h2>
      <label className="text-white font-medium">Paste your content here</label>
      <textarea
        className="w-full h-32 rounded-lg p-3 bg-dark-800 text-white border border-dark-700 focus:ring-2 focus:ring-primary-500 outline-none resize-none mb-2"
        placeholder="Write or paste your content here"
        value={values.text}
        onChange={onInputChange}
      />
      <div className="flex gap-2 mb-2">
        <button type="button" className="px-4 py-2 rounded-lg bg-dark-700 text-white hover:bg-primary-600 transition" onClick={() => onTemplateSelect(1)}>Template 1</button>
        <button type="button" className="px-4 py-2 rounded-lg bg-dark-700 text-white hover:bg-primary-600 transition" onClick={() => onTemplateSelect(2)}>Template 2</button>
        <button type="button" className="px-4 py-2 rounded-lg bg-dark-700 text-white hover:bg-primary-600 transition" onClick={() => onTemplateSelect(3)}>Template 3</button>
      </div>
      <div className="flex gap-2 mb-2">
        <button type="button" className="px-4 py-2 rounded-lg bg-dark-700 text-white hover:bg-primary-600 transition" onClick={() => onModeToggle('dark')}>Dark mode</button>
        <button type="button" className="px-4 py-2 rounded-lg bg-dark-700 text-white hover:bg-primary-600 transition" onClick={() => onModeToggle('light')}>Light mode</button>
      </div>
      <label className="text-white font-medium">Choose a font</label>
      <select
        className="w-full rounded-lg p-2 bg-dark-800 text-white border border-dark-700 mb-4"
        value={values.font}
        onChange={onFontChange}
      >
        <option value="">Select a font</option>
        <option value="Inter">Inter</option>
        <option value="Roboto">Roboto</option>
        <option value="Montserrat">Montserrat</option>
        <option value="Lato">Lato</option>
      </select>
      <div className="flex gap-4 mb-4">
        <div className="flex flex-col">
          <label className="text-white font-medium mb-1">Background color</label>
          <input
            type="color"
            value={values.backgroundColor}
            onChange={e => onInputChange({ target: { name: 'backgroundColor', value: e.target.value } })}
            name="backgroundColor"
            className="w-10 h-10 p-0 border-none bg-transparent"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-white font-medium mb-1">Text color</label>
          <input
            type="color"
            value={values.textColor}
            onChange={e => onInputChange({ target: { name: 'textColor', value: e.target.value } })}
            name="textColor"
            className="w-10 h-10 p-0 border-none bg-transparent"
          />
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <label htmlFor="enhanceAI" className="text-white font-medium select-none">Enhance content with AI</label>
        <button
          type="button"
          aria-pressed={!!values.enhanceAI}
          onClick={() => onInputChange({ target: { name: 'enhanceAI', value: !values.enhanceAI } })}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 ${values.enhanceAI ? 'bg-primary-600' : 'bg-dark-700'}`}
        >
          <span
            className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${values.enhanceAI ? 'translate-x-6' : ''}`}
          />
        </button>
      </div>
      <button type="button" className="w-full py-3 rounded-lg bg-primary-600 text-white font-semibold text-lg hover:bg-primary-700 transition" onClick={onGenerate}>Generate slides</button>
    </div>
  );
}
