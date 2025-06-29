import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useFAQAdmin } from '../../../hooks/useFAQ';
import { faqService } from '../../../services/faqService';
import FAQItemModal from './FAQItemModal';
import ConfirmDialog from '../../../components/ConfirmDialog';
import LoadingSpinner from '../../../components/LoadingSpinner';

const FAQAdmin = () => {
  const {
    faqItems,
    loading,
    error,
    loadFAQItems,
    deleteFAQItem,
    toggleFAQItemStatus,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredAndSortedItems,
    stats
  } = useFAQAdmin();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, item: null });
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    loadFAQItems();
  }, [loadFAQItems]);

  const handleCreateNew = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = (item) => {
    setDeleteConfirm({ open: true, item });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.item) {
      await deleteFAQItem(deleteConfirm.item.id);
      setDeleteConfirm({ open: false, item: null });
    }
  };

  const handleToggleStatus = async (item) => {
    await toggleFAQItemStatus(item.id, !item.isActive);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (loading && faqItems.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar FAQ</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gerencie perguntas frequentes e suas respostas
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={() => setShowStats(!showStats)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Estatísticas
              </button>
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nova Pergunta
              </button>
            </div>
          </div>

          {/* Estatísticas */}
          {showStats && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-600">Total de Itens</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <div className="text-sm text-green-600">Itens Ativos</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
                <div className="text-sm text-red-600">Itens Inativos</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(stats.byCategory).length}
                </div>
                <div className="text-sm text-purple-600">Categorias</div>
              </div>
            </div>
          )}
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar perguntas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Filtro por Categoria */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            >
              <option value="todos">Todas as Categorias</option>
              {faqService.CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Ordenação */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            >
              <option value="category-asc">Categoria (A-Z)</option>
              <option value="category-desc">Categoria (Z-A)</option>
              <option value="question-asc">Pergunta (A-Z)</option>
              <option value="question-desc">Pergunta (Z-A)</option>
              <option value="createdAt-desc">Mais Recentes</option>
              <option value="createdAt-asc">Mais Antigas</option>
              <option value="order-asc">Ordem Crescente</option>
              <option value="order-desc">Ordem Decrescente</option>
            </select>
          </div>
        </div>

        {/* Lista de Itens */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {filteredAndSortedItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Nenhum item encontrado</div>
              <p className="text-gray-400 mt-2">
                {searchTerm || selectedCategory !== 'todos'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece criando sua primeira pergunta'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange('question')}
                    >
                      Pergunta {getSortIcon('question')}
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange('category')}
                    >
                      Categoria {getSortIcon('category')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange('order')}
                    >
                      Ordem {getSortIcon('order')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedItems.map((item) => {
                    const categoryLabel = faqService.CATEGORIES.find(
                      cat => cat.value === item.category
                    )?.label || item.category;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 line-clamp-2">
                            {item.question}
                          </div>
                          {item.tags && item.tags.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {tag}
                                </span>
                              ))}
                              {item.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{item.tags.length - 3} mais
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {categoryLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.order}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleToggleStatus(item)}
                              className={`p-1 rounded-full hover:bg-gray-100 ${
                                item.isActive ? 'text-red-600' : 'text-green-600'
                              }`}
                              title={item.isActive ? 'Desativar' : 'Ativar'}
                            >
                              {item.isActive ? (
                                <EyeSlashIcon className="h-4 w-4" />
                              ) : (
                                <EyeIcon className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1 rounded-full text-blue-600 hover:bg-blue-100"
                              title="Editar"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1 rounded-full text-red-600 hover:bg-red-100"
                              title="Excluir"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Criação/Edição */}
        {modalOpen && (
          <FAQItemModal
            isOpen={modalOpen}
            onClose={handleModalClose}
            item={editingItem}
            onSuccess={() => {
              handleModalClose();
              loadFAQItems();
            }}
          />
        )}

        {/* Dialog de Confirmação de Exclusão */}
        <ConfirmDialog
          isOpen={deleteConfirm.open}
          onClose={() => setDeleteConfirm({ open: false, item: null })}
          onConfirm={confirmDelete}
          title="Excluir Item do FAQ"
          message={`Tem certeza que deseja excluir a pergunta "${deleteConfirm.item?.question}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
        />
      </div>
    </div>
  );
};

export default FAQAdmin;