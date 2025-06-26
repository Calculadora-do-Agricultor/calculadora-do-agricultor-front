/**
 * Safe mathematical evaluator that replaces eval()
 * Uses Function constructor with limited scope for better security
 */

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
    // Validate the expression using the validation function
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

    // Não validamos variáveis indefinidas pois os campos são definidos pelo usuário
    processedExpression = processedExpression.replace(/@\[(.*?)\]/g, '0')

    // Create a function with limited scope
    const func = new Function('Math', `"use strict"; return (${processedExpression})`)
    
    // Execute the function with only allowed Math functions
    let result = func(allowedMathFunctions.Math)
    
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

  return result
}

/**
 * Normalizes math function names in an expression
 * @param {string} expression - The expression to normalize
 * @returns {string} - The normalized expression
 */
export const normalizeMathFunctions = (expression) => {
  return expression
    .replace(/Math\./g, '')
    .replace(/\bsin\b/g, 'Math.sin')
    .replace(/\bcos\b/g, 'Math.cos')
    .replace(/\btan\b/g, 'Math.tan')
    .replace(/\bsqrt\b/g, 'Math.sqrt')
    .replace(/\babs\b/g, 'Math.abs')
    .replace(/\bpow\b/g, 'Math.pow')
    .replace(/\blog\b/g, 'Math.log')
    .replace(/\bexp\b/g, 'Math.exp')
    .replace(/\bPI\b/g, 'Math.PI')
    .replace(/\bE\b/g, 'Math.E')
    .replace(/\bmax\b/g, 'Math.max')
    .replace(/\bmin\b/g, 'Math.min')
    .replace(/\bround\b/g, 'Math.round')
    .replace(/\bfloor\b/g, 'Math.floor')
    .replace(/\bceil\b/g, 'Math.ceil')
}

/**
 * Tests an expression with example values
 * @param {string} expression - The expression to test
 * @param {Object} exampleValues - Example values for testing
 * @returns {Object} - Test result with value and any errors
 */
export const testExpression = (expression, exampleValues = {}) => {
  try {
    const result = evaluateExpression(expression, exampleValues, true)
    return {
      isValid: true,
      value: result,
      error: null
    }
  } catch (error) {
    return {
      isValid: false,
      value: null,
      error: error.message
    }
  }
}

/**
 * Gets documentation for supported expression syntax
 * @returns {Object} - Documentation object with syntax rules and examples
 */
export const getExpressionSyntaxDocs = () => {
  return {
    operators: [
      { symbol: '+', description: 'Addition' },
      { symbol: '-', description: 'Subtraction' },
      { symbol: '*', description: 'Multiplication' },
      { symbol: '/', description: 'Division' },
      { symbol: '()', description: 'Grouping' }
    ],
    mathFunctions: [
      { name: 'sin(x)', description: 'Sine function' },
      { name: 'cos(x)', description: 'Cosine function' },
      { name: 'tan(x)', description: 'Tangent function' },
      { name: 'sqrt(x)', description: 'Square root' },
      { name: 'abs(x)', description: 'Absolute value' },
      { name: 'pow(x,y)', description: 'x raised to power y' },
      { name: 'log(x)', description: 'Natural logarithm' },
      { name: 'exp(x)', description: 'e raised to power x' },
      { name: 'round(x)', description: 'Round to nearest integer' },
      { name: 'floor(x)', description: 'Round down to integer' },
      { name: 'ceil(x)', description: 'Round up to integer' },
      { name: 'max(x,y)', description: 'Maximum of x and y' },
      { name: 'min(x,y)', description: 'Minimum of x and y' }
    ],
    constants: [
      { name: 'PI', description: 'Pi (≈ 3.14159)' },
      { name: 'E', description: 'Euler\'s number (≈ 2.71828)' }
    ],
    variables: {
      format: '@[variableName]',
      description: 'Reference variables using @[name] syntax'
    },
    restrictions: [
      'No assignment operators (=)',
      'No comparison operators (<, >, ==)',
      'No logical operators (&&, ||)',
      'No loops or control structures',
      'No function definitions',
      'Only allowed mathematical operations'
    ]
  }
}
