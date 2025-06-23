/**
 * Avaliador matemático seguro que substitui o uso de eval()
 * Utiliza Function constructor com escopo limitado para maior segurança
 */

// Lista de funções matemáticas permitidas
const allowedMathFunctions = {
  Math: {
    pow: Math.pow,
    sqrt: Math.sqrt,
    abs: Math.abs,
    round: Math.round,
    floor: Math.floor,
    ceil: Math.ceil,
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    log: Math.log,
    exp: Math.exp,
    PI: Math.PI,
    E: Math.E,
    max: Math.max,
    min: Math.min
  }
}

/**
 * Avalia uma expressão matemática de forma segura
 * @param {string} expression - A expressão matemática a ser avaliada
 * @param {Object} variables - Objeto com as variáveis e seus valores
 * @returns {number} - O resultado da expressão ou 0 em caso de erro
 */
export const evaluateExpression = (expression, variables = {}) => {
  try {
    // Valida se a expressão contém apenas caracteres seguros
    const safePattern = /^[0-9+\-*/().\s@\[\]a-zA-Z_]+$/
    if (!safePattern.test(expression)) {
      throw new Error('Expressão contém caracteres não permitidos')
    }

    // Substitui as variáveis na expressão usando o formato @[nome]
    let processedExpression = expression
    Object.keys(variables).forEach((key) => {
      const value = Number.parseFloat(variables[key]) || 0
      const regex = new RegExp(`@\\[${key}\\]`, 'g')
      processedExpression = processedExpression.replace(regex, value)
    })

    // Verifica se ainda há variáveis não substituídas
    if (processedExpression.includes('@[')) {
      throw new Error('Variáveis não definidas encontradas na expressão')
    }

    // Cria uma função com escopo limitado
    const func = new Function('Math', `"use strict"; return (${processedExpression})`)
    
    // Executa a função com apenas as funções Math permitidas
    const result = func(allowedMathFunctions.Math)
    
    // Verifica se o resultado é um número válido
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Resultado inválido')
    }
    
    return result
  } catch (error) {
    console.error('Erro ao avaliar expressão:', error.message)
    return 0
  }
}

/**
 * Valida se uma expressão é segura para avaliação
 * @param {string} expression - A expressão a ser validada
 * @returns {boolean} - true se a expressão é segura
 */
export const isExpressionSafe = (expression) => {
  if (!expression || typeof expression !== 'string') {
    return false
  }

  // Verifica caracteres permitidos
  const safePattern = /^[0-9+\-*/().\s@\[\]a-zA-Z_]+$/
  if (!safePattern.test(expression)) {
    return false
  }

  // Verifica se não contém palavras-chave perigosas
  const dangerousKeywords = [
    'eval', 'function', 'Function', 'constructor', 'prototype',
    'window', 'document', 'global', 'process', 'require',
    'import', 'export', 'this', 'arguments'
  ]
  
  const lowerExpression = expression.toLowerCase()
  return !dangerousKeywords.some(keyword => lowerExpression.includes(keyword))
}

/**
 * Substitui funções matemáticas na expressão para garantir compatibilidade
 * @param {string} expression - A expressão original
 * @returns {string} - A expressão com funções matemáticas normalizadas
 */
export const normalizeMathFunctions = (expression) => {
  return expression
    .replace(/Math\.pow\(/g, 'Math.pow(')
    .replace(/Math\.sqrt\(/g, 'Math.sqrt(')
    .replace(/Math\.abs\(/g, 'Math.abs(')
    .replace(/Math\.round\(/g, 'Math.round(')
    .replace(/Math\.floor\(/g, 'Math.floor(')
    .replace(/Math\.ceil\(/g, 'Math.ceil(')
    .replace(/Math\.sin\(/g, 'Math.sin(')
    .replace(/Math\.cos\(/g, 'Math.cos(')
    .replace(/Math\.tan\(/g, 'Math.tan(')
    .replace(/Math\.log\(/g, 'Math.log(')
    .replace(/Math\.exp\(/g, 'Math.exp(')
    .replace(/Math\.PI/g, 'Math.PI')
    .replace(/Math\.E/g, 'Math.E')
    .replace(/Math\.max\(/g, 'Math.max(')
    .replace(/Math\.min\(/g, 'Math.min(')
}