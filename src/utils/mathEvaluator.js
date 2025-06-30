/**
 * Safe mathematical evaluator that replaces eval()
 * Uses Function constructor with limited scope for better security
 */

// Importação do math.js
import { evaluate, parse, abs, add, subtract, multiply, divide, pow, sqrt, sin, cos, tan, derivative, simplify } from 'mathjs';

// List of allowed mathematical functions
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

// Funções matemáticas seguras disponíveis para uso
const safeMathFunctions = {
  // Funções matemáticas básicas
  abs: abs,
  add: add,
  subtract: subtract,
  multiply: multiply,
  divide: divide,
  pow: pow,
  sqrt: sqrt,
  // Funções trigonométricas
  sin: sin,
  cos: cos,
  tan: tan,
  // Funções de análise
  derivative: derivative,
  simplify: simplify,
  // Função de parsing para validação de sintaxe
  parse: parse
}

/**
 * Types of mathematical expression validation errors
 */
export const ExpressionErrorType = {
  SYNTAX_ERROR: 'SYNTAX_ERROR',
  INVALID_CHARACTERS: 'INVALID_CHARACTERS',
  UNBALANCED_PARENTHESES: 'UNBALANCED_PARENTHESES',
  UNDEFINED_VARIABLE: 'UNDEFINED_VARIABLE',
  DIVISION_BY_ZERO: 'DIVISION_BY_ZERO',
  INVALID_FUNCTION: 'INVALID_FUNCTION',
  EMPTY_EXPRESSION: 'EMPTY_EXPRESSION',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

// Error messages in Portuguese
const errorMessages = {
  [ExpressionErrorType.SYNTAX_ERROR]: 'Erro de sintaxe na expressão',
  [ExpressionErrorType.INVALID_CHARACTERS]: 'A expressão contém caracteres inválidos',
  [ExpressionErrorType.UNBALANCED_PARENTHESES]: 'A expressão contém parênteses desbalanceados',
  [ExpressionErrorType.UNDEFINED_VARIABLE]: 'Variáveis não definidas: ',
  [ExpressionErrorType.DIVISION_BY_ZERO]: 'A expressão contém divisão por zero',
  [ExpressionErrorType.INVALID_FUNCTION]: 'Função não permitida: ',
  [ExpressionErrorType.EMPTY_EXPRESSION]: 'A expressão não pode estar vazia',
  [ExpressionErrorType.UNKNOWN_ERROR]: 'Expressão inválida! Corrija e tente novamente'
}

/**
 * Safely evaluates a mathematical expression
 * @param {string} expression - The mathematical expression to evaluate
 * @param {Object} variables - Object with variables and their values
 * @param {boolean} throwOnError - If true, throws exceptions instead of returning 0
 * @returns {number} - The result of the expression or 0 in case of error
 */
export const evaluateExpression = (expression, variables = {}, throwOnError = false) => {
  try {
    // Valida a expressão usando a função de validação completa
    const validation = validateExpression(expression, variables)
    if (!validation.isValid && validation.errorType !== ExpressionErrorType.UNDEFINED_VARIABLE) {
      throw new Error(validation.errorMessage || 'Invalid expression')
    }

    // Replace variables in the expression using @[name] format
    let processedExpression = expression
    Object.keys(variables).forEach((key) => {
      const value = Number.parseFloat(variables[key]) || 0
      const regex = new RegExp(`@\\[${key}\\]`, 'g')
      processedExpression = processedExpression.replace(regex, value)
    })

    // Verifica se ainda há variáveis não substituídas
    if (processedExpression.includes('@[')) {
      // Não validamos variáveis indefinidas pois os campos são definidos pelo usuário
      processedExpression = processedExpression.replace(/@\[(.*?)\]/g, '0')
    }
    
    // Verifica se há funções matemáticas sem argumentos
    const mathFunctions = ['abs', 'sqrt', 'round', 'floor', 'ceil', 'sin', 'cos', 'tan', 'log', 'exp', 'max', 'min']
    for (const func of mathFunctions) {
      const mathPattern = new RegExp('Math\\.' + func + '\\(\\s*\\)');
      const funcPattern = new RegExp('\\b' + func + '\\(\\s*\\)');
      
      if (mathPattern.test(processedExpression) || funcPattern.test(processedExpression)) {
        throw new Error(`A função ${func}() precisa de pelo menos um argumento`)
      }
    }

    // Verifica especificamente a função pow que precisa de dois argumentos
    if ((processedExpression.includes('pow(') && !processedExpression.match(/pow\([^,]+,[^)]+\)/)) ||
        (processedExpression.includes('Math.pow(') && !processedExpression.match(/Math\.pow\([^,]+,[^)]+\)/))) {
      throw new Error(`A função pow() precisa de pelo menos dois argumentos (base, expoente)`)
    }
    
    // Normaliza funções matemáticas
    processedExpression = normalizeMathFunctions(processedExpression)
    
    // Substitui funções Math.* pelas equivalentes do mathjs
    processedExpression = processedExpression
      .replace(/Math\.abs\(/g, 'abs(')
      .replace(/Math\.pow\(/g, 'pow(')
      .replace(/Math\.sqrt\(/g, 'sqrt(')
      .replace(/Math\.round\(/g, 'round(')
      .replace(/Math\.floor\(/g, 'floor(')
      .replace(/Math\.ceil\(/g, 'ceil(')
      .replace(/Math\.sin\(/g, 'sin(')
      .replace(/Math\.cos\(/g, 'cos(')
      .replace(/Math\.tan\(/g, 'tan(')
      .replace(/Math\.log\(/g, 'log(')
      .replace(/Math\.exp\(/g, 'exp(')
      .replace(/Math\.PI/g, 'pi')
      .replace(/Math\.E/g, 'e')
      .replace(/Math\.max\(/g, 'max(')
      .replace(/Math\.min\(/g, 'min(')
    
    // Avalia a expressão usando o mathjs diretamente
    if (processedExpression.includes('pow(') && !processedExpression.match(/pow\([^,]+,[^)]+\)/)) {
      throw new Error('A função pow() precisa de pelo menos dois argumentos (base, expoente)')
    }
    
    let result = evaluate(processedExpression)
    
    // Convert result to number if possible
    result = Number(result)
    
    // Verify if the result is a valid number
    if (isNaN(result) || !isFinite(result)) {
      throw new Error('Resultado inválido ou não numérico')
    }
    
    return result
  } catch (error) {
    // console.error('Error evaluating expression:', error.message)
    if (throwOnError) {
      throw error
    }
    return 0
  }
}

/**
 * Validates if an expression is safe for evaluation
 * @param {string} expression - The expression to validate
 * @returns {boolean} - true if the expression is safe
 */
export const isExpressionSafe = (expression) => {
  if (!expression || typeof expression !== 'string') {
    return false
  }

  // Check allowed characters - permitindo caracteres especiais e espaços
  const safePattern = /^[\s0-9+\-*/().@\[\]a-zA-ZÀ-ÿ_,\s]+$/
  if (!safePattern.test(expression)) {
    return false
  }

  // Check for dangerous keywords
  const dangerousKeywords = [
    'eval', 'function', 'Function', 'constructor', 'prototype',
    'window', 'document', 'global', 'process', 'require',
    'import', 'export', 'this', 'arguments'
  ]
  
  const lowerExpression = expression.toLowerCase()
  return !dangerousKeywords.some(keyword => lowerExpression.includes(keyword))
}

/**
 * Validates a mathematical expression and returns details about any errors found
 * @param {string} expression - The mathematical expression to validate
 * @param {Object} variables - Object with variables to be used in the expression
 * @returns {Object} - Object with validation result {isValid, errors, errorType, errorMessage}
 */
export const validateExpression = (expression, variables = {}) => {
  // Default result
  const result = {
    isValid: true,
    errors: [],
    errorType: null,
    errorMessage: null
  }

  // Check if expression is empty
  if (!expression || expression.trim() === '') {
    result.isValid = false
    result.errorType = ExpressionErrorType.EMPTY_EXPRESSION
    result.errorMessage = errorMessages[ExpressionErrorType.EMPTY_EXPRESSION]
    result.errors.push({
      type: ExpressionErrorType.EMPTY_EXPRESSION,
      message: errorMessages[ExpressionErrorType.EMPTY_EXPRESSION]
    })
    return result
  }
  
  // Verifica se há funções matemáticas sem argumentos
  const mathFunctions = ['abs', 'sqrt', 'round', 'floor', 'ceil', 'sin', 'cos', 'tan', 'log', 'exp', 'max', 'min']
  for (const func of mathFunctions) {
    const mathPattern = new RegExp('Math\\.' + func + '\\(\\s*\\)');
    const funcPattern = new RegExp('\\b' + func + '\\(\\s*\\)');
    
    if (mathPattern.test(expression) || funcPattern.test(expression)) {
      result.isValid = false
      result.errorType = ExpressionErrorType.SYNTAX_ERROR
      result.errorMessage = `A função ${func}() precisa de pelo menos um argumento`
      result.errors.push({
        type: ExpressionErrorType.SYNTAX_ERROR,
        message: `A função ${func}() precisa de pelo menos um argumento`
      })
      return result
    }
  }

  // Verifica especificamente a função pow que precisa de dois argumentos
  if ((expression.includes('pow(') && !expression.match(/pow\([^,]+,[^)]+\)/)) ||
      (expression.includes('Math.pow(') && !expression.match(/Math\.pow\([^,]+,[^)]+\)/))) {
    result.isValid = false
    result.errorType = ExpressionErrorType.SYNTAX_ERROR
    result.errorMessage = `A função pow() precisa de pelo menos dois argumentos (base, expoente)`
    result.errors.push({
      type: ExpressionErrorType.SYNTAX_ERROR,
      message: `A função pow() precisa de pelo menos dois argumentos (base, expoente)`
    })
    return result
  }
  
  // Check for invalid characters - permitindo caracteres especiais e espaços
  const safePattern = /^[\s0-9+\-*/().@\[\]a-zA-ZÀ-ÿ_,\s]+$/
  if (!safePattern.test(expression)) {
    result.isValid = false
    result.errorType = ExpressionErrorType.INVALID_CHARACTERS
    result.errorMessage = errorMessages[ExpressionErrorType.INVALID_CHARACTERS]
    result.errors.push({
      type: ExpressionErrorType.INVALID_CHARACTERS,
      message: errorMessages[ExpressionErrorType.INVALID_CHARACTERS]
    })
  }

  // Check for dangerous keywords
  const dangerousKeywords = [
    'eval', 'function', 'Function', 'constructor', 'prototype',
    'window', 'document', 'global', 'process', 'require',
    'import', 'export', 'this', 'arguments'
  ]
  
  const lowerExpression = expression.toLowerCase()
  const foundKeyword = dangerousKeywords.find(keyword => lowerExpression.includes(keyword))
  if (foundKeyword) {
    result.isValid = false
    result.errorType = ExpressionErrorType.INVALID_FUNCTION
    result.errorMessage = errorMessages[ExpressionErrorType.INVALID_FUNCTION] + foundKeyword
    result.errors.push({
      type: ExpressionErrorType.INVALID_FUNCTION,
      message: errorMessages[ExpressionErrorType.INVALID_FUNCTION] + foundKeyword
    })
  }

  // Check for balanced parentheses
  const openParenCount = (expression.match(/\(/g) || []).length
  const closeParenCount = (expression.match(/\)/g) || []).length
  if (openParenCount !== closeParenCount) {
    result.isValid = false
    result.errorType = ExpressionErrorType.UNBALANCED_PARENTHESES
    result.errorMessage = errorMessages[ExpressionErrorType.UNBALANCED_PARENTHESES]
    result.errors.push({
      type: ExpressionErrorType.UNBALANCED_PARENTHESES,
      message: errorMessages[ExpressionErrorType.UNBALANCED_PARENTHESES]
    })
  }

  // Check for undefined variables
  const variablePattern = /@\[(.*?)\]/g
  const matches = [...expression.matchAll(variablePattern)]
  const foundVariables = matches.map(match => match[1])
  // Não validamos variáveis indefinidas pois os campos são definidos pelo usuário

  // Check for division by zero
  if (expression.includes('/0')) {
    result.isValid = false
    result.errorType = ExpressionErrorType.DIVISION_BY_ZERO
    result.errorMessage = errorMessages[ExpressionErrorType.DIVISION_BY_ZERO]
    result.errors.push({
      type: ExpressionErrorType.DIVISION_BY_ZERO,
      message: errorMessages[ExpressionErrorType.DIVISION_BY_ZERO]
    })
  }

  // Verifica sintaxe da expressão usando math.js
  if (result.isValid) {
    try {
      // Substitui as variáveis por valores de teste para verificar a sintaxe
      let testExpression = expression
      foundVariables.forEach(varName => {
        const regex = new RegExp(`@\\[${varName}\\]`, 'g')
        testExpression = testExpression.replace(regex, '1') // Substitui por 1 para teste
      })
      
      // Normaliza funções matemáticas
      testExpression = normalizeMathFunctions(testExpression)
      
      // Substitui funções Math.* pelas equivalentes do mathjs
      testExpression = testExpression
        .replace(/Math\.abs\(/g, 'abs(')
        .replace(/Math\.pow\(/g, 'pow(')
        .replace(/Math\.sqrt\(/g, 'sqrt(')
        .replace(/Math\.round\(/g, 'round(')
        .replace(/Math\.floor\(/g, 'floor(')
        .replace(/Math\.ceil\(/g, 'ceil(')
        .replace(/Math\.sin\(/g, 'sin(')
        .replace(/Math\.cos\(/g, 'cos(')
        .replace(/Math\.tan\(/g, 'tan(')
        .replace(/Math\.log\(/g, 'log(')
        .replace(/Math\.exp\(/g, 'exp(')
        .replace(/Math\.PI/g, 'pi')
        .replace(/Math\.E/g, 'e')
        .replace(/Math\.max\(/g, 'max(')
        .replace(/Math\.min\(/g, 'min(')
      
      // Tenta analisar a expressão com math.js para verificar a sintaxe
      parse(testExpression)
    } catch (error) {
      result.isValid = false
      result.errorType = ExpressionErrorType.SYNTAX_ERROR
      result.errorMessage = `Erro de sintaxe: ${error.message}`
      result.errors.push({
        type: ExpressionErrorType.SYNTAX_ERROR,
        message: `Erro de sintaxe: ${error.message}`
      })
    }
  }

  return result
}

/**
 * Substitui funções matemáticas na expressão para garantir compatibilidade
 * @param {string} expression - A expressão original
 * @returns {string} - A expressão com funções matemáticas normalizadas
 */
export const normalizeMathFunctions = (expression) => {
  // Primeiro, mantém a compatibilidade com código existente que já usa Math.*
  const normalized = expression
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
  
  return normalized;
}

/**
 * Tests an expression with example values
 * @param {string} expression - The expression to test
 * @param {Object} exampleValues - Example values for testing
 * @returns {Object} - Test result with value and any errors
 */
export const testExpression = (expression, exampleValues = {}) => {
  const result = {
    success: false,
    value: null,
    error: null,
    validation: null
  }

  // Primeiro valida a expressão
  const validation = validateExpression(expression, exampleValues)
  result.validation = validation

  if (!validation.isValid) {
    result.error = validation.errorMessage
    return result
  }
  
  // Se a validação passou, tenta avaliar a expressão
  try {
    const evalResult = evaluateExpression(expression, exampleValues, true)
    result.success = true
    result.value = evalResult
    return result
  } catch (error) {
    result.error = error.message
    return result
  }
}

/**
 * Gets documentation for supported expression syntax
 * @returns {Object} - Documentation object with syntax rules and examples
 */
export const getExpressionSyntaxDocs = () => {
  return {
    title: 'Documentação de Sintaxe para Expressões Matemáticas',
    description: 'Este guia explica a sintaxe suportada para criar expressões matemáticas válidas. Você pode usar tanto as funções do Math.js diretamente quanto as funções do objeto Math do JavaScript.',
    variableSyntax: {
      format: '@[NomeDaVariavel]',
      example: '@[Comprimento] * @[Largura]',
      description: 'As variáveis devem ser referenciadas usando o formato @[NomeDaVariavel]'
    },
    operators: [
      { symbol: '+', description: 'Adição', example: '@[A] + @[B]' },
      { symbol: '-', description: 'Subtração', example: '@[A] - @[B]' },
      { symbol: '*', description: 'Multiplicação', example: '@[A] * @[B]' },
      { symbol: '/', description: 'Divisão', example: '@[A] / @[B]' },
      { symbol: '()', description: 'Agrupamento', example: '(@[A] + @[B]) * @[C]' }
    ],
    mathFunctions: [
      { name: 'abs(x) ou Math.abs(x)', description: 'Valor absoluto de x', example: 'abs(@[Valor]) ou Math.abs(@[Valor])' },
      { name: 'pow(x, y) ou Math.pow(x, y)', description: 'Potência: x elevado a y', example: 'pow(@[Base], @[Expoente]) ou Math.pow(@[Base], @[Expoente])' },
      { name: 'sqrt(x) ou Math.sqrt(x)', description: 'Raiz quadrada de x', example: 'sqrt(@[Valor]) ou Math.sqrt(@[Valor])' },
      { name: 'round(x) ou Math.round(x)', description: 'Arredonda x para o inteiro mais próximo', example: 'round(@[Valor]) ou Math.round(@[Valor])' },
      { name: 'floor(x) ou Math.floor(x)', description: 'Arredonda x para baixo', example: 'floor(@[Valor]) ou Math.floor(@[Valor])' },
      { name: 'ceil(x) ou Math.ceil(x)', description: 'Arredonda x para cima', example: 'ceil(@[Valor]) ou Math.ceil(@[Valor])' },
      { name: 'sin(x) ou Math.sin(x)', description: 'Seno de x (em radianos)', example: 'sin(@[Angulo]) ou Math.sin(@[Angulo])' },
      { name: 'cos(x) ou Math.cos(x)', description: 'Cosseno de x (em radianos)', example: 'cos(@[Angulo]) ou Math.cos(@[Angulo])' },
      { name: 'tan(x) ou Math.tan(x)', description: 'Tangente de x (em radianos)', example: 'tan(@[Angulo]) ou Math.tan(@[Angulo])' },
      { name: 'log(x) ou Math.log(x)', description: 'Logaritmo natural de x', example: 'log(@[Valor]) ou Math.log(@[Valor])' },
      { name: 'exp(x) ou Math.exp(x)', description: 'e elevado a x', example: 'exp(@[Valor]) ou Math.exp(@[Valor])' },
      { name: 'max(x,y) ou Math.max(x,y)', description: 'Máximo entre x e y', example: 'max(@[A], @[B]) ou Math.max(@[A], @[B])' },
      { name: 'min(x,y) ou Math.min(x,y)', description: 'Mínimo entre x e y', example: 'min(@[A], @[B]) ou Math.min(@[A], @[B])' }
    ],
    constants: [
      { name: 'pi ou Math.PI', description: 'Pi (≈ 3.14159)', example: '2 * pi * @[Raio] ou 2 * Math.PI * @[Raio]' },
      { name: 'e ou Math.E', description: 'Número de Euler (≈ 2.71828)', example: 'e^@[Valor] ou Math.E^@[Valor]' }
    ],
    restrictions: [
      'Não são permitidos operadores de atribuição (=)',
      'Não são permitidos operadores de comparação (<, >, ==)',
      'Não são permitidos operadores lógicos (&&, ||)',
      'Não são permitidos loops ou estruturas de controle',
      'Não são permitidas definições de função',
      'Apenas operações matemáticas permitidas',
      'Todas as funções devem ter argumentos válidos',
      'A função pow() requer exatamente dois argumentos'
    ],
    examples: [
      {
        description: 'Cálculo de área de um círculo',
        expression: 'pi * pow(@[Raio], 2)',
        variables: { 'Raio': 5 },
        result: '≈ 78.54'
      },
      {
        description: 'Cálculo de hipotenusa',
        expression: 'sqrt(pow(@[CatetoA], 2) + pow(@[CatetoB], 2))',
        variables: { 'CatetoA': 3, 'CatetoB': 4 },
        result: '5'
      },
      {
        description: 'Conversão de temperatura',
        expression: '(@[Celsius] * 9/5) + 32',
        variables: { 'Celsius': 25 },
        result: '77'
      }
    ]
  }
}
