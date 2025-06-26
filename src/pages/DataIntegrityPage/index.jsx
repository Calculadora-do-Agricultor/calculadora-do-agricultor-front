import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Database, Loader2, FileWarning } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import DataIntegrityReport from '../../components/DataIntegrityReport';
import { useOptimizedCategories } from '../../hooks/useOptimizedFirestore';
import { useDataIntegrityCheck } from '../../hooks/useDataIntegrityCheck';
import { useToast } from '../../context/ToastContext';

/**
 * Página de administração para verificação de integridade de dados
 * Exibe um relatório detalhado de problemas de integridade e permite correções automáticas
 * Inclui verificação de IDs duplicados em formulários
 */
const DataIntegrityPage = () => {
  const [showReport, setShowReport] = useState(false);
  const [calculationsCount, setCalculationsCount] = useState(0);
  const [calculationsLoading, setCalculationsLoading] = useState(true);
  const { categories, loading: categoriesLoading, error: categoriesError, integrityIssues: dataIssues, integrityChecked } = useOptimizedCategories();
  const { duplicateFormIds, loading: formCheckLoading, error: formCheckError, checkDuplicateFormIds } = useDataIntegrityCheck();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { info, warning } = useToast();

  // Função para contar cálculos diretamente da coleção 'calculations'
  const fetchCalculationsCount = async () => {
    try {
      setCalculationsLoading(true);
      const calculationsRef = collection(db, 'calculations');
      const snapshot = await getDocs(calculationsRef);
      setCalculationsCount(snapshot.size);
    } catch (err) {
      console.error('Erro ao buscar contagem de cálculos:', err);
      setCalculationsCount(0);
    } finally {
      setCalculationsLoading(false);
    }
  };

  // Buscar contagem de cálculos ao carregar a página
  useEffect(() => {
    fetchCalculationsCount();
  }, []);
  
  // Verificar IDs duplicados em formulários ao carregar a página
  useEffect(() => {
    const checkForms = async () => {
      try {
        await checkDuplicateFormIds();
      } catch (err) {
        console.error('Erro ao verificar IDs duplicados:', err);
      }
    };
    
    checkForms();
  }, [checkDuplicateFormIds]);
  
  // Atualizar estado de carregamento e erro
  useEffect(() => {
    setLoading(categoriesLoading || formCheckLoading);
    setError(categoriesError || formCheckError);
  }, [categoriesLoading, formCheckLoading, categoriesError, formCheckError]);
  
  // Notificar sobre problemas encontrados
  useEffect(() => {
    if (integrityChecked && dataIssues?.length > 0) {
      info(`${dataIssues.length} problemas de integridade de dados detectados`);
    }
    
    if (duplicateFormIds?.length > 0) {
      warning(`${duplicateFormIds.length} IDs duplicados encontrados em formulários`);
    }
  }, [integrityChecked, dataIssues, duplicateFormIds, info, warning]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Verificação de Integridade de Dados</h1>
        </div>
      </div>

      <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-700">Visão Geral</h2>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Carregando dados...</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="mb-2 text-sm font-medium text-gray-600">Categorias Carregadas</p>
            <p className="text-2xl font-bold text-blue-700">{loading ? '...' : categories.length}</p>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <p className="mb-2 text-sm font-medium text-gray-600">Cálculos Existentes</p>
            <p className="text-2xl font-bold text-blue-700">
              {calculationsLoading ? '...' : calculationsCount}
            </p>
          </div>

          <div className={`rounded-lg p-4 ${dataIssues?.length > 0 ? 'bg-orange-50' : 'bg-green-50'}`}>
            <p className="mb-2 text-sm font-medium text-gray-600">Problemas de Dados</p>
            <div className="flex items-center gap-2">
              <p className={`text-2xl font-bold ${dataIssues?.length > 0 ? 'text-orange-700' : 'text-green-700'}`}>
                {loading ? '...' : dataIssues?.length || 0}
              </p>
              {!loading && integrityChecked && dataIssues?.length === 0 && (
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Tudo OK</span>
              )}
            </div>
          </div>
          
          <div className={`rounded-lg p-4 ${duplicateFormIds?.length > 0 ? 'bg-orange-50' : 'bg-green-50'}`}>
            <p className="mb-2 text-sm font-medium text-gray-600">IDs Duplicados</p>
            <div className="flex items-center gap-2">
              <p className={`text-2xl font-bold ${duplicateFormIds?.length > 0 ? 'text-orange-700' : 'text-green-700'}`}>
                {loading ? '...' : duplicateFormIds?.length || 0}
              </p>
              {!loading && duplicateFormIds?.length === 0 && (
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Tudo OK</span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4 text-red-700">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-medium">Erro ao carregar dados</p>
            </div>
            <p className="mt-1 text-sm">{error.message}</p>
          </div>
        )}
      </div>

      <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-700">Relatório de Integridade</h2>
          </div>

          <button
            onClick={() => setShowReport(true)}
            disabled={loading}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando...
              </span>
            ) : (
              'Abrir Relatório Detalhado'
            )}
          </button>
        </div>

        <p className="text-gray-600">
          O relatório de integridade verifica problemas como campos obrigatórios ausentes, referências inválidas, expressões matemáticas incorretas e IDs duplicados em formulários.
          Utilize o relatório detalhado para visualizar e corrigir problemas específicos.
        </p>

        {!loading && integrityChecked && dataIssues?.length === 0 && duplicateFormIds?.length === 0 && (
          <div className="mt-4 rounded-md bg-green-50 p-4">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <p className="font-medium text-green-700">
                Nenhum problema de integridade detectado
              </p>
            </div>
            <p className="mt-1 text-sm text-green-600">
              Todos os dados estão em conformidade com as regras de integridade.
            </p>
          </div>
        )}

        {(dataIssues?.length > 0 || duplicateFormIds?.length > 0) && (
          <div className="mt-4 rounded-md bg-orange-50 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <p className="font-medium text-orange-700">
                {(dataIssues?.length || 0) + (duplicateFormIds?.length || 0)} {(dataIssues?.length || 0) + (duplicateFormIds?.length || 0) === 1 ? 'problema' : 'problemas'} detectado
                {(dataIssues?.length || 0) + (duplicateFormIds?.length || 0) === 1 ? '' : 's'}
              </p>
            </div>
            <p className="mt-1 text-sm text-orange-600">
              Abra o relatório detalhado para visualizar e corrigir os problemas.
            </p>
            
            {/* Resumo dos tipos de problemas */}
            {(dataIssues?.length > 0 || duplicateFormIds?.length > 0) && (
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {(() => {
                  // Combinar problemas de dados e IDs duplicados
                  const issueTypes = {};
                  
                  // Processar problemas de dados
                  if (dataIssues?.length > 0) {
                    dataIssues.forEach(issue => {
                      const type = issue.type || 'unknown';
                      issueTypes[type] = (issueTypes[type] || 0) + 1;
                    });
                  }
                  
                  // Adicionar problemas de IDs duplicados
                  if (duplicateFormIds?.length > 0) {
                    issueTypes['duplicate_id'] = duplicateFormIds.length;
                  }
                  
                  return Object.entries(issueTypes).map(([type, count]) => {
                    const getTypeLabel = (type) => {
                      switch (type) {
                        case 'missing_field': return 'Campos ausentes';
                        case 'invalid_value': return 'Valores inválidos';
                        case 'reference': return 'Referências inválidas';
                        case 'expression': return 'Expressões inválidas';
                        case 'duplicate_id': return 'IDs duplicados';
                        default: return 'Outros problemas';
                      }
                    };
                    
                    return (
                      <div key={type} className="rounded-md bg-white p-2 text-sm border border-orange-100">
                        <span className="font-medium">{getTypeLabel(type)}:</span> {count}
                      </div>
                    );
                  });
                })()} 
              </div>
            )}
          </div>
        )}
      </div>

      {showReport && <DataIntegrityReport onClose={() => setShowReport(false)} />}
    </div>
  );
};

export default DataIntegrityPage;