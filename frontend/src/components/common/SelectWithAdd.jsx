import React from 'react';

const SelectWithAdd = ({
  label,
  stateKey,
  value,
  onChange,
  options,
  showAddForm,
  onToggleAddForm,
  newValue,
  onNewValueChange,
  onAddNew,
  placeholder,
  loading,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        name={stateKey}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
        required
      >
        <option value="">Selecione...</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.nome}
          </option>
        ))}
      </select>

      {!showAddForm ? (
        <button
          type="button"
          onClick={() => onToggleAddForm(true)}
          className="mt-2 flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Adicionar Novo
        </button>
      ) : (
        <div className="mt-2 bg-gray-50 p-2 rounded border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-800">Novo {placeholder}</h4>
            <button
              type="button"
              onClick={() => onToggleAddForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newValue}
              onChange={onNewValueChange}
              placeholder="Digite o nome"
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAddNew();
                }
              }}
            />
            <button
              type="button"
              onClick={onAddNew}
              disabled={!newValue.trim() || loading}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 text-xs font-medium"
            >
              {loading ? '...' : 'Salvar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectWithAdd;
