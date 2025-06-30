import React, { useState } from 'react'
import FormulaPreviewModal from './index'
import { Button } from '../ui/button'

// Demo component to test the FormulaPreviewModal
const FormulaPreviewDemo = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [paramValues, setParamValues] = useState({
    area: '100',
    produtividade: '50',
    preco: '2.5'
  })

  // Sample calculation object
  const sampleCalculation = {
    id: 'demo-calculation',
    name: 'Cálculo de Receita Agrícola',
    description: 'Calcula a receita total baseada na área plantada, produtividade e preço de venda.',
    expression: 'area * produtividade * preco',
    parameters: [
      {
        name: 'area',
        type: 'number',
        unit: 'hectares',
        description: 'Área total plantada',
        required: true,
        tooltip: 'Digite a área em hectares'
      },
      {
        name: 'produtividade',
        type: 'number',
        unit: 'ton/ha',
        description: 'Produtividade esperada por hectare',
        required: true,
        tooltip: 'Digite a produtividade em toneladas por hectare'
      },
      {
        name: 'preco',
        type: 'number',
        unit: 'R$/ton',
        description: 'Preço de venda por tonelada',
        required: true,
        tooltip: 'Digite o preço em reais por tonelada'
      }
    ],
    results: [
      {
        name: 'Receita Total',
        expression: 'area * produtividade * preco',
        unit: 'R$',
        description: 'Receita total esperada'
      },
      {
        name: 'Receita por Hectare',
        expression: 'produtividade * preco',
        unit: 'R$/ha',
        description: 'Receita por hectare'
      }
    ]
  }

  const handleParamChange = (paramName, value) => {
    setParamValues(prev => ({
      ...prev,
      [paramName]: value
    }))
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Demo: Formula Preview Modal</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>Parâmetros de Teste:</h3>
        {sampleCalculation.parameters.map(param => (
          <div key={param.name} style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              {param.name} ({param.unit})
            </label>
            <input
              type="number"
              value={paramValues[param.name] || ''}
              onChange={(e) => handleParamChange(param.name, e.target.value)}
              placeholder={param.description}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>
        ))}
      </div>

      <Button
        onClick={() => setIsOpen(true)}
        variant="primary"
      >
        Abrir Preview da Fórmula
      </Button>

      <FormulaPreviewModal
        calculation={sampleCalculation}
        paramValues={paramValues}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onProceedToCalculation={() => {
          setIsOpen(false)
          alert('Procedendo para o cálculo!')
        }}
      />
    </div>
  )
}

export default FormulaPreviewDemo