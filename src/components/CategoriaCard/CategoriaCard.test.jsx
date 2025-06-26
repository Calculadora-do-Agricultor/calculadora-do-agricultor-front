import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CategoriaCard from './index';
import { CalculatorIcon } from '@heroicons/react/24/outline';

// Mock do componente Badge
vi.mock('../ui/badge', () => ({
  Badge: ({ children, className }) => (
    <span className={className}>{children}</span>
  )
}));

describe('CategoriaCard', () => {
  const defaultProps = {
    title: 'Teste Categoria',
    description: 'Descrição de teste para a categoria',
    calculosCount: 5
  };

  it('renderiza o componente com props básicas', () => {
    render(<CategoriaCard {...defaultProps} />);
    
    expect(screen.getByText('Teste Categoria')).toBeInTheDocument();
    expect(screen.getByText('Descrição de teste para a categoria')).toBeInTheDocument();
    expect(screen.getByText('5 cálculos')).toBeInTheDocument();
  });

  it('renderiza o ícone quando fornecido', () => {
    render(
      <CategoriaCard 
        {...defaultProps} 
        icon={CalculatorIcon}
      />
    );
    
    const icon = screen.getByRole('button').querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('chama onClick quando clicado', () => {
    const handleClick = vi.fn();
    render(
      <CategoriaCard 
        {...defaultProps} 
        onClick={handleClick}
      />
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('responde a navegação por teclado', () => {
    const handleClick = vi.fn();
    render(
      <CategoriaCard 
        {...defaultProps} 
        onClick={handleClick}
      />
    );
    
    const card = screen.getByRole('button');
    
    // Teste Enter
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    // Teste Space
    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('renderiza badge quando fornecido', () => {
    const badge = { text: 'Nova', variant: 'secondary' };
    render(
      <CategoriaCard 
        {...defaultProps} 
        badge={badge}
      />
    );
    
    expect(screen.getByText('Nova')).toBeInTheDocument();
  });

  it('aplica estado desabilitado corretamente', () => {
    const handleClick = vi.fn();
    render(
      <CategoriaCard 
        {...defaultProps} 
        disabled={true}
        onClick={handleClick}
      />
    );
    
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-disabled', 'true');
    expect(card).toHaveAttribute('tabIndex', '-1');
    
    fireEvent.click(card);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('exibe texto singular/plural corretamente para contagem de cálculos', () => {
    // Teste singular
    const { rerender } = render(
      <CategoriaCard 
        {...defaultProps} 
        calculosCount={1}
      />
    );
    expect(screen.getByText('1 cálculo')).toBeInTheDocument();
    
    // Teste plural
    rerender(
      <CategoriaCard 
        {...defaultProps} 
        calculosCount={0}
      />
    );
    expect(screen.getByText('0 cálculos')).toBeInTheDocument();
    
    rerender(
      <CategoriaCard 
        {...defaultProps} 
        calculosCount={10}
      />
    );
    expect(screen.getByText('10 cálculos')).toBeInTheDocument();
  });

  it('aplica classes CSS customizadas', () => {
    render(
      <CategoriaCard 
        {...defaultProps} 
        className="custom-class"
      />
    );
    
    const card = screen.getByRole('button');
    expect(card).toHaveClass('custom-class');
  });

  it('tem atributos de acessibilidade corretos', () => {
    render(<CategoriaCard {...defaultProps} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', 'Navegar para categoria Teste Categoria');
    expect(card).toHaveAttribute('tabIndex', '0');
  });
});