/**
 * Avaliador matemático seguro que substitui o uso de eval()
 * Utiliza Function constructor com escopo limitado para maior segurança
 */

// Importação do math.js
import * as mathjs from 'mathjs';

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

// Funções matemáticas seguras disponíveis para uso
const safeMathFunctions = {
  // Funções matemáticas básicas
  abs: mathjs.abs,
  add: mathjs.add,
  subtract: mathjs.subtract,
  multiply: mathjs.multiply,
  divide: mathjs.divide,
  pow: mathjs.pow,
  sqrt: mathjs.sqrt,
  // Funções trigonométricas
  sin: mathjs.sin,
  cos: mathjs.cos,
  tan: mathjs.tan,
  // Funções de análise
  derivative: mathjs.derivative,
  simplify: mathjs.simplify,
  // Função de parsing para validação de sintaxe
  parse: mathjs.parse
}

/**
 * Tipos de erros de validação de expressões matemáticas
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

/**
 * Avalia uma expressão matemática de forma segura
 * @param {string} expression - A expressão matemática a ser avaliada
 * @param {Object} variables - Objeto com as variáveis e seus valores
 * @param {boolean} throwOnError - Se true, lança exceções em vez de retornar 0
 * @returns {number} - O resultado da expressão ou 0 em caso de erro
 */
export const evaluateExpression = (expression, variables = {}, throwOnError = false) => {
  try {
    // Valida a expressão usando a função de validação completa
    const validation = validateExpression(expression, variables)
    if (!validation.isValid) {
      throw new Error(validation.errorMessage || 'Expressão inválida')
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
    
    // Verifica se há funções matemáticas sem argumentos
    // Separa pow das outras funções, pois pow precisa de dois argumentos
    const mathFunctions = ['abs', 'sqrt', 'round', 'floor', 'ceil', 'sin', 'cos', 'tan', 'log', 'exp', 'max', 'min']
    const powFunction = 'pow'
    for (const func of mathFunctions) {
      // Verifica tanto para Math.func() quanto para func()
      // Usa expressões regulares mais precisas para detectar funções sem argumentos
      // Verifica se a função é chamada sem argumentos, mas permite espaços
      const mathPattern = new RegExp('Math\\.' + func + '\\(\\s*\\)');
      const funcPattern = new RegExp('\\b' + func + '\\(\\s*\\)');
      
      if (mathPattern.test(processedExpression) || funcPattern.test(processedExpression)) {
        throw new Error(`A função ${func}() precisa de pelo menos um argumento`)
      }
    }

    // Verifica especificamente a função pow que precisa de dois argumentos
    // Verifica se pow ou Math.pow é chamada sem o segundo argumento
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
    // Isso é mais seguro do que usar o sandbox personalizado para avaliação
    // Verifica se há chamadas para pow() sem argumentos suficientes
    if (processedExpression.includes('pow(') && !processedExpression.match(/pow\([^,]+,[^)]+\)/)) {
      throw new Error('A função pow() precisa de pelo menos dois argumentos (base, expoente)')
    }
    
    const result = mathjs.evaluate(processedExpression)
    
    // Verifica se o resultado é um número válido
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Resultado inválido ou não numérico')
    }
    
    return result
  } catch (error) {
    console.error('Erro ao avaliar expressão:', error.message)
      if (throwOnError) {
      throw error
    }
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
  const safePattern = /^[0-9+\-*/().\ s@\[\]a-zA-Z_]+$/
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

/**Add commentMore actions
 * Valida uma expressão matemática e retorna detalhes sobre erros encontrados
 * @param {string} expression - A expressão matemática a ser validada
 * @param {Object} variables - Objeto com as variáveis que serão usadas na expressão
 * @returns {Object} - Objeto com resultado da validação {isValid, errors, errorType, errorMessage}
 */
export const validateExpression = (expression, variables = {}) => {
  // Resultado padrão
  const result = {
    isValid: true,
    errors: [],
    errorType: null,
    errorMessage: null
  }

  // Verifica se a expressão está vazia
  if (!expression || expression.trim() === '') {
    result.isValid = false
    result.errorType = ExpressionErrorType.EMPTY_EXPRESSION
    result.errorMessage = 'A expressão não pode estar vazia'
    result.errors.push({
      type: ExpressionErrorType.EMPTY_EXPRESSION,
      message: 'A expressão não pode estar vazia'
    })
    return result
  }
  
  // Verifica se há funções matemáticas sem argumentos
  // Separa pow das outras funções, pois pow precisa de dois argumentos
  const mathFunctions = ['abs', 'sqrt', 'round', 'floor', 'ceil', 'sin', 'cos', 'tan', 'log', 'exp', 'max', 'min']
  const powFunction = 'pow'
  for (const func of mathFunctions) {
    // Verifica tanto para Math.func() quanto para func()
    // Usa expressões regulares mais precisas para detectar funções sem argumentos
    // Verifica se a função é chamada sem argumentos, mas permite espaços
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
  // Verifica se pow ou Math.pow é chamada sem o segundo argumento
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
  
  // Verifica caracteres inválidos
  const safePattern = /^[0-9+\-*/().\ s@\[\]a-zA-Z_]+$/
  if (!safePattern.test(expression)) {
    result.isValid = false
    result.errorType = ExpressionErrorType.INVALID_CHARACTERS
    result.errorMessage = 'A expressão contém caracteres não permitidos'
    result.errors.push({
      type: ExpressionErrorType.INVALID_CHARACTERS,
      message: 'A expressão contém caracteres não permitidos'
    })
  }

  // Verifica palavras-chave perigosas
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
    result.errorMessage = `A expressão contém a palavra-chave não permitida: ${foundKeyword}`
    result.errors.push({
      type: ExpressionErrorType.INVALID_FUNCTION,
      message: `A expressão contém a palavra-chave não permitida: ${foundKeyword}`
    })
  }

  // Verifica parênteses balanceados
  const openParenCount = (expression.match(/\(/g) || []).length
  const closeParenCount = (expression.match(/\)/g) || []).length
  if (openParenCount !== closeParenCount) {
    result.isValid = false
    result.errorType = ExpressionErrorType.UNBALANCED_PARENTHESES
    result.errorMessage = 'A expressão contém parênteses desbalanceados'
    result.errors.push({
      type: ExpressionErrorType.UNBALANCED_PARENTHESES,
      message: 'A expressão contém parênteses desbalanceados'
    })
  }

  // Verifica variáveis não definidas
  const variablePattern = /@\[(.*?)\]/g
  let match
  const foundVariables = []
  while ((match = variablePattern.exec(expression)) !== null) {
    foundVariables.push(match[1])
  }

  const undefinedVariables = foundVariables.filter(varName => {
    return variables[varName] === undefined
  })

  if (undefinedVariables.length > 0) {
    result.isValid = false
    result.errorType = ExpressionErrorType.UNDEFINED_VARIABLE
    result.errorMessage = `Variáveis não definidas: ${undefinedVariables.join(', ')}`
    result.errors.push({
      type: ExpressionErrorType.UNDEFINED_VARIABLE,
      message: `Variáveis não definidas: ${undefinedVariables.join(', ')}`,
      variables: undefinedVariables
    })
  }

  // Verifica divisão por zero (quando possível)
  if (expression.includes('/0') || expression.includes('/ 0')) {
    result.isValid = false
    result.errorType = ExpressionErrorType.DIVISION_BY_ZERO
    result.errorMessage = 'A expressão contém divisão por zero'
    result.errors.push({
      type: ExpressionErrorType.DIVISION_BY_ZERO,
      message: 'A expressão contém divisão por zero'
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
      mathjs.parse(testExpression)
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
 * Testa uma expressão matemática com valores de exemplo
 * @param {string} expression - A expressão a ser testada
 * @param {Object} exampleValues - Valores de exemplo para as variáveis
 * @returns {Object} - Resultado do teste {success, value, error}
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
    const value = evaluateExpression(expression, exampleValues, true)
    result.success = true
    result.value = value
    return result
  } catch (error) {
    result.error = error.message
    return result
  }
}

/**
 * Retorna a documentação da sintaxe suportada pelo avaliador de expressões
 * @returns {Object} - Documentação da sintaxe
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
      { symbol: '()', description: 'Parênteses para controlar a ordem das operações', example: '(@[A] + @[B]) * @[C]' }
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
      { name: 'max(x, y, ...) ou Math.max(x, y, ...)', description: 'Retorna o maior valor', example: 'max(@[A], @[B]) ou Math.max(@[A], @[B])' },
      { name: 'min(x, y, ...) ou Math.min(x, y, ...)', description: 'Retorna o menor valor', example: 'min(@[A], @[B]) ou Math.min(@[A], @[B])' }
    ],
    constants: [
      { name: 'pi ou Math.PI', description: 'Valor de π (pi)', example: '@[Raio] * pi * 2 ou @[Raio] * Math.PI * 2' },
      { name: 'e ou Math.E', description: 'Valor de e (base do logaritmo natural)', example: 'e * @[Valor] ou Math.E * @[Valor]' }
    ],
    examples: [
      { description: 'Cálculo de área', expression: '@[Comprimento] * @[Largura]' },
      { description: 'Conversão de unidades', expression: '@[Valor] * 0.3048' },
      { description: 'Fórmula com múltiplas operações', expression: '(@[A] + @[B]) * Math.pow(@[C], 2) / (Math.sqrt(@[D]) + @[E])' },
      { description: 'Cálculo de média', expression: '(@[Valor1] + @[Valor2] + @[Valor3]) / 3' }
    ],
    restrictions: [
      'Não são permitidas funções personalizadas',
      'Não são permitidas estruturas de controle (if, for, while)',
      'Não são permitidas atribuições de variáveis',
      'Não são permitidas chamadas a métodos de objetos',
      'Não são permitidas referências a objetos globais como window ou document',
      'Todas as funções matemáticas precisam de pelo menos um argumento (ex: sqrt() não é válido, use sqrt(x))'
    ]
  }
}
