import { useState, useEffect } from "react"

/**
 * Hook para gerenciar os parâmetros do formulário de cálculo.
 * @param {Object} calculation - Objeto de cálculo com a lista de parâmetros
 */
export function useParametrosFormulario(calculation) {
  const [paramValues, setParamValues] = useState({})
  const [allFieldsFilled, setAllFieldsFilled] = useState(false)

  // Inicializa os valores dos parâmetros ao carregar novo cálculo
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

  // Verifica se todos os campos estão preenchidos
  useEffect(() => {
    if (calculation?.parameters) {
      const filled = calculation.parameters.every(
        (param) => paramValues[param.name] && paramValues[param.name] !== ""
      )
      setAllFieldsFilled(filled)
    }
  }, [paramValues, calculation])

  // Atualiza valor de um parâmetro
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
