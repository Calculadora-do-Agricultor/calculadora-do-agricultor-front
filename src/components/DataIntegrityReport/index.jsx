import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, Loader2, ChevronDown, ChevronUp, X, FileWarning, Code } from 'lucide-react';
import { useDataIntegrityCheck } from '../../hooks/useDataIntegrityCheck';
import { useToast } from '../../context/ToastContext';
import './styles.css';

const DataIntegrityReport = ({ onClose }) => {
  const {
    loading,
    error,
    integrityIssues,
    fixedIssues,
    duplicateFormIds,
    isCheckingIntegrity,
    checkComplete,
    checkDataIntegrity,
    checkDuplicateFormIds,
    checkAllIntegrity
  } = useDataIntegrityCheck();
  
  const { success, error: toastError, info } = useToast();
  const [expandedSections, setExpandedSections] = useState({});
  const [autoFix, setAutoFix] = useState(true);
  const [checkForms, setCheckForms] = useState(true);
  const [groupedIssues, setGroupedIssues] = useState({});
  const [groupedFormIssues, setGroupedFormIssues] = useState({});
  
  // Agrupar problemas por tipo e documento
  useEffect(() => {
    if (integrityIssues.length > 0) {
      const grouped = integrityIssues.reduce((acc, issue) => {
        const type = issue.type || 'unknown';
        const docId = issue.calculationId || issue.categoryId || 'unknown';
        const docName = issue.calculationName || issue.categoryName || 'Documento desconhecido';
        
        if (!acc[type]) acc[type] = {};
        if (!acc[type][docId]) {
          acc[type][docId] = {
            name: docName,
            issues: []
          };
        }
        
        acc[type][docId].issues.push(issue);
        return acc;
      }, {});
      
      setGroupedIssues(grouped);
    } else {
      setGroupedIssues({});
    }
  }, [integrityIssues]);
  
  // Agrupar problemas de IDs duplicados por arquivo
  useEffect(() => {
    if (duplicateFormIds.length > 0) {
      const grouped = duplicateFormIds.reduce((acc, issue) => {
        const file = issue.file || 'unknown';
        
        if (!acc[file]) {
          acc[file] = {
            issues: []
          };
        }
        
        acc[file].issues.push(issue);
        return acc;
      }, {});
      
      setGroupedFormIssues(grouped);
    } else {
      setGroupedFormIssues({});
    }
  }, [duplicateFormIds]);
  
  // Iniciar verificação automática ao montar o componente
  useEffect(() => {
    handleCheckIntegrity();
  }, []);
  
  // Função para alternar a expansão de uma seção
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Função para alternar a expansão de um documento
  const toggleDocument = (type, docId) => {
    const key = `${type}_${docId}`;
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Função para verificar integridade dos dados
  const handleCheckIntegrity = async () => {
    try {
      await checkAllIntegrity(autoFix, checkForms);
      if (autoFix) {
        success('Verificação de integridade concluída com correções automáticas');
      } else {
        info('Verificação de integridade concluída');
      }
    } catch (err) {
      toastError('Erro ao verificar integridade dos dados');
    }
  };
  
  // Renderiza o cabeçalho do relatório
  const renderHeader = () => (
    <div className="integrity-report-header">
      <div className="header-title">
        <AlertTriangle size={20} />
        <h2>Relatório de Integridade de Dados</h2>
      </div>
      <button onClick={onClose} className="close-button" aria-label="Fechar relatório">
        <X size={20} />
      </button>
    </div>
  );
  
  // Renderiza os controles do relatório
  const renderControls = () => (
    <div className="integrity-report-controls">
      <div className="control-groups">
        <div className="control-group">
          <label className="control-label">
            <input
              type="checkbox"
              checked={autoFix}
              onChange={() => setAutoFix(!autoFix)}
              disabled={isCheckingIntegrity}
            />
            Corrigir problemas automaticamente
          </label>
        </div>
        
        <div className="control-group">
          <label className="control-label">
            <input
              type="checkbox"
              checked={checkForms}
              onChange={() => setCheckForms(!checkForms)}
              disabled={isCheckingIntegrity}
            />
            Verificar IDs duplicados em formulários
          </label>
        </div>
      </div>
      
      <button
        onClick={handleCheckIntegrity}
        disabled={isCheckingIntegrity}
        className="check-button"
      >
        {isCheckingIntegrity ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Verificando...</span>
          </>
        ) : (
          <>
            <RefreshCw size={16} />
            <span>Verificar Integridade</span>
          </>
        )}
      </button>
    </div>
  );
  
  // Renderiza o resumo do relatório
  const renderSummary = () => {
    if (!checkComplete) return null;
    
    const totalIssues = integrityIssues.length + duplicateFormIds.length;
    
    return (
      <div className="integrity-report-summary">
        <div className="summary-item">
          <span className="summary-label">Problemas encontrados:</span>
          <span className="summary-value">{totalIssues}</span>
        </div>
        
        <div className="summary-item">
          <span className="summary-label">Problemas de dados:</span>
          <span className="summary-value">{integrityIssues.length}</span>
        </div>
        
        <div className="summary-item">
          <span className="summary-label">IDs duplicados:</span>
          <span className="summary-value">{duplicateFormIds.length}</span>
        </div>
        
        {autoFix && (
          <div className="summary-item">
            <span className="summary-label">Problemas corrigidos:</span>
            <span className="summary-value">{fixedIssues.length}</span>
          </div>
        )}
        
        {totalIssues === 0 && (
          <div className="integrity-success">
            <CheckCircle size={20} />
            <span>Todos os dados estão íntegros!</span>
          </div>
        )}
      </div>
    );
  };
  
  // Renderiza a lista de problemas agrupados
  const renderIssuesList = () => {
    if (integrityIssues.length === 0) return null;
    
    return (
      <div className="integrity-issues-list">
        <h3>Problemas Encontrados</h3>
        
        {Object.entries(groupedIssues).map(([type, documents]) => (
          <div key={type} className="issue-type-section">
            <div
              className="issue-type-header"
              onClick={() => toggleSection(type)}
            >
              <div className="issue-type-title">
                <AlertTriangle size={16} />
                <span>{getTypeLabel(type)} ({countIssuesByType(documents)})</span>
              </div>
              {expandedSections[type] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            
            {expandedSections[type] && (
              <div className="issue-documents">
                {Object.entries(documents).map(([docId, doc]) => (
                  <div key={docId} className="issue-document">
                    <div
                      className="document-header"
                      onClick={() => toggleDocument(type, docId)}
                    >
                      <span className="document-name">{doc.name}</span>
                      <div className="document-meta">
                        <span className="issue-count">{doc.issues.length} {doc.issues.length === 1 ? 'problema' : 'problemas'}</span>
                        {expandedSections[`${type}_${docId}`] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </div>
                    
                    {expandedSections[`${type}_${docId}`] && (
                      <ul className="issue-list">
                        {doc.issues.map((issue, index) => (
                          <li key={index} className="issue-item">
                            <div className="issue-message">{issue.message}</div>
                            {issue.fixed && (
                              <div className="issue-fixed">
                                <CheckCircle size={14} />
                                <span>Corrigido automaticamente</span>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Função auxiliar para contar problemas por tipo
  const countIssuesByType = (documents) => {
    return Object.values(documents).reduce((count, doc) => count + doc.issues.length, 0);
  };
  
  // Renderiza a lista de problemas de IDs duplicados
  const renderFormIssuesList = () => {
    if (duplicateFormIds.length === 0) return null;
    
    return (
      <div className="integrity-issues-list form-issues-list">
        <h3>
          <FileWarning size={16} />
          <span>IDs Duplicados em Formulários</span>
        </h3>
        
        {Object.entries(groupedFormIssues).map(([file, data]) => (
          <div key={file} className="issue-type-section">
            <div
              className="issue-type-header"
              onClick={() => toggleSection(`form_${file}`)}
            >
              <div className="issue-type-title">
                <Code size={16} />
                <span>{getFileDisplayName(file)} ({data.issues.length})</span>
              </div>
              {expandedSections[`form_${file}`] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            
            {expandedSections[`form_${file}`] && (
              <div className="issue-documents">
                <ul className="issue-list">
                  {data.issues.map((issue, index) => (
                    <li key={index} className="issue-item">
                      <div className="issue-message">
                        <strong>ID:</strong> {issue.id}
                      </div>
                      <div className="issue-detail">
                        <strong>Ocorrências:</strong> {issue.occurrences}
                      </div>
                      {issue.affectedElements && issue.affectedElements.length > 0 && (
                        <div className="issue-detail">
                          <strong>Elementos afetados:</strong> {issue.affectedElements.join(', ')}
                        </div>
                      )}
                      <div className="issue-warning">
                        <AlertTriangle size={14} />
                        <span>Este problema pode causar falhas no preenchimento automático do navegador</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Função auxiliar para obter nome de exibição do arquivo
  const getFileDisplayName = (filePath) => {
    const parts = filePath.split('/');
    return parts[parts.length - 1];
  };
  
  // Função auxiliar para obter rótulo do tipo de problema
  const getTypeLabel = (type) => {
    const labels = {
      'missing_field': 'Campos Obrigatórios Ausentes',
      'reference': 'Referências Inválidas',
      'expression': 'Expressões Inválidas',
      'duplicate_id': 'IDs Duplicados',
      'unknown': 'Problemas Desconhecidos'
    };
    
    return labels[type] || type;
  };
  
  return (
    <div className="data-integrity-report-overlay">
      <div className="data-integrity-report">
        {renderHeader()}
        {renderControls()}
        
        {error && (
          <div className="integrity-error">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}
        
        {renderSummary()}
        {renderIssuesList()}
        {renderFormIssuesList()}
      </div>
    </div>
  );
};

export default DataIntegrityReport;