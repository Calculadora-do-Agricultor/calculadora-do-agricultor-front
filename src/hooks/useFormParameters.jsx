import { useState, useEffect } from "react"

/**
 * Hook to manage calculation form parameters.
 * @param {Object} calculation - Calculation object with parameter list
 */
export function useFormParameters(calculation) {
  const [paramValues, setParamValues] = useState({})
  const [allFieldsFilled, setAllFieldsFilled] = useState(false)

  // Initialize parameter values when loading new calculation
  useEffect(() => {
    if (calculation?.parameters) {
      const initialValues = {}
      calculation.parameters.forEach((param) => {
        initialValues[param.name] = ""
      })
      setParamValues(initialValues)
      setAllFieldsFilled(false)
    }
  }, [calculation])

  // Check if all fields are filled
  useEffect(() => {
    if (calculation?.parameters) {
      const filled = calculation.parameters.every(
        (param) => paramValues[param.name] && paramValues[param.name] !== ""
      )
      setAllFieldsFilled(filled)
    }
  }, [paramValues, calculation])

  // Update a parameter value
  const setParamValue = (name, value) => {
    setParamValues((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return {
    paramValues,
    setParamValue,
    allFieldsFilled,
  }
}
