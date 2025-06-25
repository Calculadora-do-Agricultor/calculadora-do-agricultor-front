import { useState, useEffect } from "react"
import {
  evaluateExpression,
  normalizeMathFunctions,
  validateExpression,
} from "../utils/mathEvaluator"

/**
 * Hook para calcular os resultados com base nos parâmetros e expressões do cálculo.
 *
 * @param {Object} calculation - Objeto do cálculo, contendo fórmulas e resultados
 * @param {Object} paramValues - Valores preenchidos dos parâmetros
 * @param {boolean} allFieldsFilled - Indica se todos os parâmetros foram preenchidos
 * @returns {Object} { results, error }
 */
export function useCalculationResult(calculation, paramValues, allFieldsFilled) {
  const [results, setResults] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!calculation || !allFieldsFilled || Object.keys(paramValues).length === 0) return

    try {
      const newResults = {}

      if (calculation.results && calculation.results.length > 0) {
        calculation.results.forEach((result, index) => {
          const val = calcularExpressao(result.expression, paramValues)
          newResults[`result_${index}`] = {
            name: result.name,
            description: result.description,
            value: val.toFixed(2),
            unit: result.unit || "",
          }
        })
      } else {
        const val = calcularExpressao(calculation.expression, paramValues)
        newResults.value = val.toFixed(2)

        if (calculation.additionalResults?.length > 0) {
          calculation.additionalResults.forEach((result) => {
            if (result.key === "coleta50m") {
              newResults[result.key] = ((val * 50) / 1000).toFixed(2)
            }
          })
        }
      }

      setResults(newResults)
      setError(null)
    } catch (e) {
      console.error("Erro ao calcular resultado:", e)
      setError("Erro no cálculo: " + e.message)
    }
  }, [calculation, paramValues, allFieldsFilled])

  // Função auxiliar para avaliação segura da expressão
  const calcularExpressao = (expression, values) => {
    const context = {}

    Object.keys(values).forEach((key) => {
      context[key] = parseFloat(values[key]) || 0
    })

    const validation = validateExpression(expression, context)
    if (!validation.isValid) {
      throw new Error(validation.errorMessage)
    }

    const normalized = normalizeMathFunctions(expression)
    return evaluateExpression(normalized, context, true)
  }

  return { results, error }
}
