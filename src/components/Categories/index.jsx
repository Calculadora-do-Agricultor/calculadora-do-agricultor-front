import React from "react"
import "./styles.css"

export function Categories({ categories, onSelect, selectedCategory }) {
  if (!categories || categories.length === 0) {
    return (
      <div className="categories-empty">
        <p>Nenhuma categoria disponível.</p>
      </div>
    )
  }

  return (
    <div className="categories-container">
      {categories.map((category, index) => (
        <button
          key={index}
          onClick={() => onSelect(category.name)}
          className={`category-item ${selectedCategory === category.name ? "selected" : ""}`}
        >
          <span className="category-name">{category.name}</span>
          {selectedCategory === category.name && (
            <span className="selected-indicator"></span>
          )}
        </button>
      ))}
    </div>
  )
}
