import { useState, useEffect } from "react"
import { evaluateExpression, normalizeMathFunctions, validateExpression } from "../utils/mathEvaluator"

export function useCalculationResult(calculation) {
  const [paramValues, setParamValues] = useState({})
  const [results, setResults] = useState({})
  const [allFieldsFilled, setAllFieldsFilled] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (calculation && calculation.parameters) {
      const initialValues = {}
      calculation.parameters.forEach(param => {
        initialValues[param.name] = ""
      })
      setParamValues(initialValues)

      const initialResults = {}
      if (calculation.results && calculation.results.length > 0) {
        calculation.results.forEach((result, index) => {
          initialResults[`result_${index}`] = {
            name: result.name,
            description: result.description,
            value: "0",
            unit: result.unit || "",
          }
        })
      } else {
        initialResults.value = "0"
        if (calculation.additionalResults && calculation.additionalResults.length > 0) {
          calculation.additionalResults.forEach(result => {
            initialResults[result.key] = "0"
          })
        }
      }
      setResults(initialResults)
      setAllFieldsFilled(false)
      setError(null)
    }
  }, [calculation])

  useEffect(() => {
    if (calculation && calculation.parameters) {
      const filled = calculation.parameters.every(
        param => paramValues[param.name] && paramValues[param.name] !== ""
      )
      setAllFieldsFilled(filled)
    }
  }, [paramValues, calculation])

  const calculateExpressionResult = (expression, values) => {
    try {
      const context = {}
      Object.keys(values).forEach(key => {
        context[key] = Number.parseFloat(values[key]) || 0
      })

      const validation = validateExpression(expression, context)
      if (!validation.isValid) {
        setError("Validation error: " + validation.errorMessage)
        return 0
      }

      const normalizedExpression = normalizeMathFunctions(expression)
      return evaluateExpression(normalizedExpression, context, true)
    } catch (e) {
      setError("Error evaluating expression: " + e.message)
      return 0
    }
  }

  useEffect(() => {
    if (calculation && Object.keys(paramValues).length > 0 && allFieldsFilled) {
      try {
        setError(null)
        const newResults = {}

        if (calculation.results && calculation.results.length > 0) {
          calculation.results.forEach((result, index) => {
            const val = calculateExpressionResult(result.expression, paramValues)
            newResults[`result_${index}`] = {
              name: result.name,
              description: result.description,
              value: val.toFixed(2),
              unit: result.unit || "",
            }
          })
        } else {
          const val = calculation.expression
            ? calculateExpressionResult(calculation.expression, paramValues)
            : 0
          newResults.value = val.toFixed(2)

          if (calculation.additionalResults && calculation.additionalResults.length > 0) {
            calculation.additionalResults.forEach(result => {
              if (result.key === "coleta50m") {
                newResults[result.key] = ((val * 50) / 1000).toFixed(2)
              }
            })
          }
        }

        setResults(newResults)
      } catch (error) {
        setError("Error calculating result: " + error.message)
      }
    }
  }, [paramValues, calculation, allFieldsFilled])

  return { paramValues, setParamValues, results, allFieldsFilled, error }
}
