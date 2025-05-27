import React, { useState, useEffect } from "react"
import { Search, Filter, Loader2 } from "lucide-react"
import "./styles.css"

export function Categories({ categories, onSelect, selectedCategory }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCategories, setFilteredCategories] = useState(categories || [])
  const [filterOption, setFilterOption] = useState("all")

  useEffect(() => {
    if (!categories) return
    
    let result = [...categories]
    
    // Aplicar filtro por quantidade de cálculos
    if (filterOption === "most") {
      result = result.sort((a, b) => (b.calculos?.length || 0) - (a.calculos?.length || 0))
    } else if (filterOption === "least") {
      result = result.sort((a, b) => (a.calculos?.length || 0) - (b.calculos?.length || 0))
    } else if (filterOption === "alphabetical") {
      result = result.sort((a, b) => a.name.localeCompare(b.name))
    }
    
    // Aplicar busca por texto
    if (searchTerm.trim() !== "") {
      result = result.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredCategories(result)
  }, [categories, searchTerm, filterOption])

  if (!categories || categories.length === 0) {
    return (
      <div className="categories-empty">
        <p>Nenhuma categoria disponível.</p>
      </div>
    )
  }

  return (
    <div className="categories-wrapper">
      <div className="categories-search">
        <div className="search-input-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label="Buscar categorias"
          />
          {searchTerm && (
            <button 
              className="search-clear-button"
              onClick={() => setSearchTerm("")}
              aria-label="Limpar busca"
            >
              &times;
            </button>
          )}
        </div>
        
        <div className="filter-container">
          <div className="filter-label">
            <Filter size={14} />
            <span>Filtrar por:</span>
          </div>
          <select 
            className="filter-select"
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="alphabetical">Ordem alfabética</option>
            <option value="most">Mais cálculos</option>
            <option value="least">Menos cálculos</option>
          </select>
        </div>
      </div>
      
      <div className="categories-scroll-container">
        <div className="categories-container">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category, index) => (
              <button
                key={index}
                onClick={() => onSelect(category.name)}
                className={`category-item ${selectedCategory === category.name ? "selected" : ""}`}
              >
                <div className="category-info-wrapper">
                  <span className="category-name">{category.name}</span>
                  <span className="category-count-badge">{category.calculos?.length || 0}</span>
                </div>
                {selectedCategory === category.name && (
                  <span className="selected-indicator"></span>
                )}
              </button>
            ))
          ) : (
            <div className="categories-empty">
              <p>Nenhuma categoria encontrada.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
