// Otimização: Exportar apenas componentes essenciais para reduzir bundle inicial
// Componentes críticos que são usados em múltiplas páginas
export { default as Navbar } from './Navbar';
export { default as Footer } from './Footer';
export { default as PrivateRoute } from './PrivateRoute';
export { default as ProtectedRoute } from './ProtectedRoute';

// Componentes específicos da calculadora - lazy load quando necessário
export { default as CalculationList } from './CalculationList';
export { default as Categories } from './Categories';

// Outros componentes podem ser importados diretamente quando necessários
// para evitar carregar código desnecessário no bundle inicial
// Exemplo: import CalculationModal from '@/components/CalculationModal';

// Componentes administrativos - apenas carregados quando necessário
// export { default as CalculationActions } from "./CalculationActions"
// export { default as CategoryActions } from "./CategoryActions"
// export { default as EditCategory } from "./EditCategory"
// export { default as CalculationModal } from './CalculationModal';
// export { default as CreateCalculation } from './CreateCalculation';
// export { default as CreateCategory } from './CreateCategory';
// export { default as EditCalculation } from './EditCalculation';
// export { default as LogCard } from './LogCard';
// export { default as MetricCard } from './MetricCard';
// export { default as MetricsToggle } from './MetricsToggle';
// export { default as TermsOfUseModal } from './TermsOfUseModal';
// export { default as BrazilFlag } from './BrazilFlag';
// export { default as Alert } from './Alert';
