import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FormulaPreviewModal from '../components/FormulaPreviewModal/index.jsx'

// Mock the Button component
vi.mock('../components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, icon: Icon, ...props }) => {
    const IconComponent = Icon
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`btn btn-${variant} ${disabled ? 'disabled' : ''}`}
        {...props}
      >
        {IconComponent && <IconComponent />}
        {children}
      </button>
    )
  }
}))

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  X: () => 'X',
  Calculator: () => 'Calculator',
  Play: () => 'Play', 
  ArrowLeft: () => 'ArrowLeft',
  Info: () => 'Info',
  Hash: () => 'Hash'
}))

describe('FormulaPreviewModal', () => {
  const mockCalculation = {
    id: 'test-calc',
    name: 'Test Calculation',
    description: 'A test calculation for demo purposes',
    expression: 'area * produtividade',
    parameters: [
      {
        name: 'area',
        type: 'number',
        unit: 'hectares',
        description: 'Total planted area',
        required: true,
        tooltip: 'Enter area in hectares'
      },
      {
        name: 'produtividade',
        type: 'number',
        unit: 'ton/ha',
        description: 'Expected productivity per hectare',
        required: true,
        tooltip: 'Enter productivity in tons per hectare'
      },
      {
        name: 'optional_param',
        type: 'number',
        unit: 'units',
        description: 'Optional parameter',
        required: false
      }
    ],
    results: [
      {
        name: 'Total Production',
        expression: 'area * produtividade',
        unit: 'tons',
        description: 'Total expected production'
      }
    ]
  }

  const mockParamValues = {
    area: '100',
    produtividade: '50'
    // optional_param is intentionally left empty
  }

  const defaultProps = {
    calculation: mockCalculation,
    paramValues: mockParamValues,
    isOpen: true,
    onClose: vi.fn(),
    onProceedToCalculation: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset body overflow style
    document.body.style.overflow = 'unset'
  })

  it('renders modal when isOpen is true', () => {
    render(<FormulaPreviewModal {...defaultProps} />)
    
    expect(screen.getByText('Visualização da Fórmula')).toBeInTheDocument()
    expect(screen.getByText('Test Calculation')).toBeInTheDocument()
  })

  it('does not render modal when isOpen is false', () => {
    render(<FormulaPreviewModal {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText('Visualização da Fórmula')).not.toBeInTheDocument()
  })

  it('displays calculation description', () => {
    render(<FormulaPreviewModal {...defaultProps} />)
    
    expect(screen.getByText('A test calculation for demo purposes')).toBeInTheDocument()
  })

  it('displays formula structure with parameter values', () => {
    render(<FormulaPreviewModal {...defaultProps} />)
    
    expect(screen.getByText('Estrutura da Fórmula')).toBeInTheDocument()
    // Should show the formula with replaced values
    expect(screen.getByText('100 * 50')).toBeInTheDocument()
  })

  it('displays parameters list with status', () => {
    render(<FormulaPreviewModal {...defaultProps} />)
    
    expect(screen.getByText('Parâmetros Necessários')).toBeInTheDocument()
    expect(screen.getByText('area')).toBeInTheDocument()
    expect(screen.getByText('produtividade')).toBeInTheDocument()
    expect(screen.getByText('optional_param')).toBeInTheDocument()
    
    // Check status indicators
    expect(screen.getAllByText('✓ Preenchido')).toHaveLength(2) // area and produtividade
    expect(screen.getByText('⚠ Pendente')).toBeInTheDocument() // optional_param
  })

  it('shows ready status when all required parameters are filled', () => {
    render(<FormulaPreviewModal {...defaultProps} />)
    
    expect(screen.getByText('Pronto para Calcular')).toBeInTheDocument()
    expect(screen.getByText('Todos os parâmetros obrigatórios foram preenchidos')).toBeInTheDocument()
  })

  it('shows pending status when required parameters are missing', () => {
    const incompleteParamValues = { area: '100' } // missing produtividade
    
    render(
      <FormulaPreviewModal 
        {...defaultProps} 
        paramValues={incompleteParamValues}
      />
    )
    
    expect(screen.getByText('Parâmetros Pendentes')).toBeInTheDocument()
    expect(screen.getByText('Preencha todos os campos obrigatórios antes de calcular')).toBeInTheDocument()
  })

  it('enables calculate button when all required parameters are filled', () => {
    render(<FormulaPreviewModal {...defaultProps} />)
    
    const calculateButton = screen.getByRole('button', { name: /calcular/i })
    expect(calculateButton).not.toBeDisabled()
  })

  it('disables calculate button when required parameters are missing', () => {
    const incompleteParamValues = { area: '100' }
    
    render(
      <FormulaPreviewModal 
        {...defaultProps} 
        paramValues={incompleteParamValues}
      />
    )
    
    const calculateButton = screen.getByRole('button', { name: /preencher parâmetros/i })
    expect(calculateButton).toBeDisabled()
  })

  it('calls onClose when close button is clicked', () => {
    render(<FormulaPreviewModal {...defaultProps} />)
    
    const closeButton = screen.getByLabelText('Fechar')
    fireEvent.click(closeButton)
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when back button is clicked', () => {
    render(<FormulaPreviewModal {...defaultProps} />)
    
    const backButton = screen.getByRole('button', { name: /voltar/i })
    fireEvent.click(backButton)
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onProceedToCalculation when calculate button is clicked', () => {
    render(<FormulaPreviewModal {...defaultProps} />)
    
    const calculateButton = screen.getByRole('button', { name: /calcular/i })
    fireEvent.click(calculateButton)
    
    expect(defaultProps.onProceedToCalculation).toHaveBeenCalledTimes(1)
  })

  it('handles ESC key press to close modal', () => {
    render(<FormulaPreviewModal {...defaultProps} />)
    
    fireEvent.keyDown(window, { key: 'Escape' })
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('handles overlay click to close modal', () => {
    render(<FormulaPreviewModal {...defaultProps} />)
    
    const overlay = document.querySelector('.formula-preview-overlay')
    fireEvent.click(overlay)
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('prevents body scroll when modal is open', () => {
    render(<FormulaPreviewModal {...defaultProps} />)
    
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body scroll when modal is closed', () => {
    const { rerender } = render(<FormulaPreviewModal {...defaultProps} />)
    
    // Modal is open, body scroll should be hidden
    expect(document.body.style.overflow).toBe('hidden')
    
    // Close modal
    rerender(<FormulaPreviewModal {...defaultProps} isOpen={false} />)
    
    // Body scroll should be restored
    expect(document.body.style.overflow).toBe('unset')
  })

  it('displays results formulas when available', () => {
    render(<FormulaPreviewModal {...defaultProps} />)
    
    expect(screen.getByText('Resultados:')).toBeInTheDocument()
    expect(screen.getByText('Total Production:')).toBeInTheDocument()
    expect(screen.getByText('(tons)')).toBeInTheDocument()
  })

  it('handles calculation without results array', () => {
    const calculationWithoutResults = {
      ...mockCalculation,
      results: undefined
    }
    
    render(
      <FormulaPreviewModal 
        {...defaultProps} 
        calculation={calculationWithoutResults}
      />
    )
    
    // Should still render the main formula
    expect(screen.getByText('Fórmula Principal:')).toBeInTheDocument()
    expect(screen.queryByText('Resultados:')).not.toBeInTheDocument()
  })

  it('handles empty parameters array', () => {
    const calculationWithoutParams = {
      ...mockCalculation,
      parameters: []
    }
    
    render(
      <FormulaPreviewModal 
        {...defaultProps} 
        calculation={calculationWithoutParams}
      />
    )
    
    expect(screen.getByText('Nenhum parâmetro necessário')).toBeInTheDocument()
  })

  it('formats expressions correctly with missing parameter values', () => {
    const emptyParamValues = {}
    
    render(
      <FormulaPreviewModal 
        {...defaultProps} 
        paramValues={emptyParamValues}
      />
    )
    
    // Should show parameter names in brackets when no values provided
    expect(screen.getByText('[area] * [produtividade]')).toBeInTheDocument()
  })
})