import { useState, useEffect } from "react"
import { evaluateExpression, normalizeMathFunctions, validateExpression } from "../utils/mathEvaluator"

/**
 * Hook to calculate results based on parameters and calculation expressions.
 *
 * @param {Object} calculation - Calculation object containing formulas and results
 * @returns {Object} { paramValues, setParamValues, results, allFieldsFilled, error }
 */
export function useCalculationResult(calculation) {
  const [paramValues, setParamValues] = useState({})
  
  // Check if all required fields are filled
  const allFieldsFilled = calculation?.parameters ? 
    calculation.parameters.every(param => 
      paramValues[param.name] !== undefined && 
      paramValues[param.name] !== null && 
      paramValues[param.name] !== ""
    ) : false
  const [results, setResults] = useState(() => {
    // Initialize results with default values
    const defaultResults = {}
    if (calculation?.results?.length > 0) {
      calculation.results.forEach((result, index) => {
        defaultResults[`result_${index}`] = {
          name: result.name,
          description: result.description,
          value: "0",
          unit: result.unit || "",
        }
      })
    } else if (calculation) {
      defaultResults.value = "0"
      if (calculation.additionalResults?.length > 0) {
        calculation.additionalResults.forEach((result) => {
          defaultResults[result.key] = "0"
        })
      }
    }
    return defaultResults
  })
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!calculation || !allFieldsFilled || Object.keys(paramValues).length === 0) {
      // Initialize with default values when conditions are not met
      const defaultResults = {}
      if (calculation?.results?.length > 0) {
        calculation.results.forEach((result, index) => {
          defaultResults[`result_${index}`] = {
            name: result.name,
            description: result.description,
            value: "0",
            unit: result.unit || "",
          }
        })
      } else if (calculation) {
        defaultResults.value = "0"
        if (calculation.additionalResults?.length > 0) {
          calculation.additionalResults.forEach((result) => {
            defaultResults[result.key] = "0"
          })
        }
      }
      setResults(defaultResults)
      return
    }

    try {
      const newResults = {}

      if (calculation.results && calculation.results.length > 0) {
        calculation.results.forEach((result, index) => {
          const val = calculateExpression(result.expression, paramValues)
          newResults[`result_${index}`] = {
            name: result.name,
            description: result.description,
            value: val.toFixed(2),
            unit: result.unit || "",
          }
        })
      } else {
        const val = calculateExpression(calculation.expression, paramValues)
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
      console.error("Erro no cálculo:", e)
      setError(e.message.includes("Error in calculation:") ? e.message.replace("Error in calculation: ", "") : "Expressão inválida! Corrija e tente novamente")
    }
  }, [calculation, paramValues, allFieldsFilled])

  // Helper function for safe expression evaluation
  const calculateExpression = (expression, values) => {
    const context = {}

    Object.keys(values).forEach((key) => {
      context[key] = parseFloat(values[key]) || 0
    })

    const validation = validateExpression(expression, context)
    if (!validation.isValid && validation.errorType !== 'UNDEFINED_VARIABLE') {
      throw new Error(validation.errorMessage)
    }

    const normalized = normalizeMathFunctions(expression)
    return evaluateExpression(normalized, context, true)
  }

  return { paramValues, setParamValues, results, allFieldsFilled, error }
}
