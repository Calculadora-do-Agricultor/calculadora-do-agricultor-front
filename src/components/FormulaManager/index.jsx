import React, { useState, useEffect } from 'react';
import { useFormulaService } from '../../hooks/useFormulaService';
import { validateExpression } from '../../utils/mathEvaluator';
import LoadingSpinner from '../LoadingSpinner';
import './styles.css';

/**
 * Componente para gerenciar fórmulas matemáticas
 * Demonstra o uso do FormulaService e useFormulaService
 */
const FormulaManager = () => {
  const {
    formulas,
    loading,
    error,
    saveFormula,
    updateFormula,
    deleteFormula,
    getFormulasByCategory,
    searchFormulas,
    getFormulaStats,
    validateFormulaIntegrity,
    clearError
  } = useFormulaService();

  // Estado local para formulários
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFormula, setEditingFormula] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    expression: '',
    description: '',
    category: 'matematica',
    parameters: []
  });
  const [validationResult, setValidationResult] = useState(null);

  // Categorias disponíveis
  const categories = [
    { value: 'matematica', label: 'Matemática' },
    { value: 'fisica', label: 'Física' },
    { value: 'quimica', label: 'Química' },
    { value: 'agricultura', label: 'Agricultura' },
    { value: 'economia', label: 'Economia' },
    { value: 'estatistica', label: 'Estatística' }
  ];

  // Fórmulas filtradas
  const filteredFormulas = React.useMemo(() => {
    let result = formulas;
    
    if (selectedCategory) {
      result = getFormulasByCategory(selectedCategory);
    }
    
    if (searchTerm) {
      result = searchFormulas(searchTerm);
    }
    
    return result;
  }, [formulas, selectedCategory, searchTerm, getFormulasByCategory, searchFormulas]);

  // Estatísticas das fórmulas
  const stats = getFormulaStats();

  // Manipuladores de eventos
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validar expressão em tempo real
    if (name === 'expression' && value.trim()) {
      const validation = validateExpression(value);
      setValidationResult(validation);
    } else if (name === 'expression') {
      setValidationResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingFormula) {
        await updateFormula(editingFormula.id, formData);
        setEditingFormula(null);
      } else {
        await saveFormula(formData);
      }
      
      // Resetar formulário
      setFormData({
        name: '',
        expression: '',
        description: '',
        category: 'matematica',
        parameters: []
      });
      setShowCreateForm(false);
      setValidationResult(null);
    } catch (err) {
      console.error('Erro ao salvar fórmula:', err);
    }
  };

  const handleEdit = (formula) => {
    setFormData({
      name: formula.name,
      expression: formula.expression,
      description: formula.description || '',
      category: formula.category,
      parameters: formula.parameters || []
    });
    setEditingFormula(formula);
    setShowCreateForm(true);
  };

  const handleDelete = async (formulaId) => {
    if (window.confirm('Tem certeza que deseja excluir esta fórmula?')) {
      try {
        await deleteFormula(formulaId);
      } catch (error) {
        console.error('Erro ao excluir fórmula:', error);
      }
    }
  };

  const handleValidateIntegrity = async (formulaId) => {
    try {
      const result = await validateFormulaIntegrity(formulaId);
      if (result) {
        alert(`Validação: ${result.isValid ? 'Válida' : 'Inválida'}\n${result.issues.join('\n')}`);
      }
    } catch (error) {
      console.error('Erro ao validar integridade da fórmula:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingFormula(null);
    setShowCreateForm(false);
    setFormData({
      name: '',
      expression: '',
      description: '',
      category: 'matematica',
      parameters: []
    });
    setValidationResult(null);
  };

  return (
    <div className="formula-manager">
      <div className="formula-manager__header">
        <h2>Gerenciador de Fórmulas</h2>
        <button 
          className="btn btn--primary"
          onClick={() => setShowCreateForm(true)}
          disabled={loading}
        >
          Nova Fórmula
        </button>
      </div>

      {/* Estatísticas */}
      <div className="formula-stats">
        <div className="stat-card">
          <h3>Total</h3>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card">
          <h3>Recentes</h3>
          <span className="stat-value">{stats.recentlyCreated}</span>
        </div>
        <div className="stat-card">
          <h3>Complexidade Alta</h3>
          <span className="stat-value">{stats.complexityDistribution.high}</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="formula-filters">
        <input
          id="formula-search"
          name="formula-search"
          type="text"
          placeholder="Buscar fórmulas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          id="formula-category-filter"
          name="formula-category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          <option value="">Todas as categorias</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mensagens de erro */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={clearError} className="btn btn--small">×</button>
        </div>
      )}

      {/* Formulário de criação/edição */}
      {showCreateForm && (
        <div className="formula-form-overlay">
          <div className="formula-form">
            <h3>{editingFormula ? 'Editar Fórmula' : 'Nova Fórmula'}</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nome da Fórmula *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  maxLength={100}
                  placeholder="Ex: Área do Círculo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="expression">Expressão Matemática *</label>
                <input
                  type="text"
                  id="expression"
                  name="expression"
                  value={formData.expression}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: PI * r^2"
                />
                {validationResult && (
                  <div className={`validation-result ${validationResult.isValid ? 'valid' : 'invalid'}`}>
                    {validationResult.isValid ? '✓ Expressão válida' : `✗ ${validationResult.errors.join(', ')}`}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="category">Categoria *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Descrição</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  maxLength={500}
                  placeholder="Descrição opcional da fórmula..."
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancelEdit} className="btn btn--secondary">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn--primary"
                  disabled={loading || (validationResult && !validationResult.isValid)}
                >
                  {loading ? (
                    <LoadingSpinner 
                      tipo="inline" 
                      mensagem="Salvando..." 
                      tamanho="small" 
                      cor="white" 
                      delay={0}
                      ariaLabel="Salvando fórmula"
                    />
                  ) : (
                    editingFormula ? 'Atualizar' : 'Salvar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de fórmulas */}
      <div className="formula-list">
        {loading && (
          <LoadingSpinner 
            tipo="inline" 
            mensagem="Carregando fórmulas..." 
            tamanho="medium" 
            cor="primary" 
            delay={200}
            ariaLabel="Carregando lista de fórmulas"
          />
        )}
        
        {!loading && filteredFormulas.length === 0 && (
          <div className="empty-state">
            <p>Nenhuma fórmula encontrada.</p>
            {formulas.length === 0 && (
              <p>Comece criando sua primeira fórmula!</p>
            )}
          </div>
        )}

        {!loading && filteredFormulas.map(formula => (
          <div key={formula.id} className="formula-card">
            <div className="formula-card__header">
              <h4>{formula.name}</h4>
              <span className="formula-category">{formula.category}</span>
            </div>
            
            <div className="formula-card__content">
              <div className="formula-expression">
                <code>{formula.expression}</code>
              </div>
              
              {formula.description && (
                <p className="formula-description">{formula.description}</p>
              )}
              
              <div className="formula-meta">
                <small>Criada em: {formula.createdAt?.toDate().toLocaleDateString()}</small>
                {formula.updatedAt && (
                  <small>Atualizada em: {formula.updatedAt.toDate().toLocaleDateString()}</small>
                )}
              </div>
            </div>
            
            <div className="formula-card__actions">
              <button 
                onClick={() => handleEdit(formula)}
                className="btn btn--small btn--secondary"
              >
                Editar
              </button>
              <button 
                onClick={() => handleValidateIntegrity(formula.id)}
                className="btn btn--small btn--info"
              >
                Validar
              </button>
              <button 
                onClick={() => handleDelete(formula.id)}
                className="btn btn--small btn--danger"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormulaManager;