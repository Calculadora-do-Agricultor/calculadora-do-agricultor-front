import { db } from './firebaseConfig';
import { authWrapper } from './firebaseWrapper';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { validateExpression, isExpressionSafe } from '../utils/mathEvaluator';

/**
 * Serviço seguro para persistência de fórmulas matemáticas no Firestore
 * Inclui parsing seguro, sanitização, validação e estrutura otimizada
 */
export class FormulaService {
  static COLLECTION_NAME = 'formulas';
  static MAX_FORMULA_LENGTH = 1000;
  static MAX_FORMULAS_PER_USER = 100;

  /**
   * Salva uma fórmula matemática com validação e sanitização completa
   * @param {Object} formulaData - Dados da fórmula
   * @param {string} formulaData.name - Nome da fórmula
   * @param {string} formulaData.expression - Expressão matemática
   * @param {string} formulaData.description - Descrição da fórmula
   * @param {Array} formulaData.parameters - Parâmetros da fórmula
   * @param {string} formulaData.category - Categoria da fórmula
   * @param {Object} formulaData.metadata - Metadados adicionais
   * @returns {Promise<string>} - ID do documento criado
   */
  static async saveFormula(formulaData) {
    try {
      // Verificar autenticação
      const currentUser = authWrapper.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário deve estar autenticado para salvar fórmulas');
      }

      // Validar dados de entrada
      this._validateFormulaData(formulaData);

      // Sanitizar e validar expressão
      const sanitizedExpression = this._sanitizeExpression(formulaData.expression);
      const validationResult = this._validateFormulaExpression(sanitizedExpression, formulaData.parameters);
      
      if (!validationResult.isValid) {
        throw new Error(`Fórmula inválida: ${validationResult.errorMessage}`);
      }

      // Verificar limite de fórmulas por usuário
      await this._checkUserFormulaLimit(currentUser.uid);

      // Estruturar dados para persistência
      const formulaDocument = {
        name: this._sanitizeString(formulaData.name),
        expression: sanitizedExpression,
        description: this._sanitizeString(formulaData.description || ''),
        parameters: this._sanitizeParameters(formulaData.parameters || []),
        category: this._sanitizeString(formulaData.category || 'geral'),
        metadata: {
          ...formulaData.metadata,
          version: '1.0',
          complexity: this._calculateComplexity(sanitizedExpression),
          lastValidated: serverTimestamp()
        },
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        validationHash: this._generateValidationHash(sanitizedExpression)
      };

      // Salvar no Firestore
      const formulasRef = collection(db, this.COLLECTION_NAME);
      const docRef = await addDoc(formulasRef, formulaDocument);

      return docRef.id;
    } catch (error) {
      console.error('Erro ao salvar fórmula:', error);
      throw error;
    }
  }

  /**
   * Recupera uma fórmula por ID com verificação de segurança
   * @param {string} formulaId - ID da fórmula
   * @returns {Promise<Object>} - Dados da fórmula
   */
  static async getFormula(formulaId) {
    try {
      const currentUser = authWrapper.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário deve estar autenticado para acessar fórmulas');
      }

      const formulaRef = doc(db, this.COLLECTION_NAME, formulaId);
      const formulaDoc = await getDoc(formulaRef);

      if (!formulaDoc.exists()) {
        throw new Error('Fórmula não encontrada');
      }

      const formulaData = formulaDoc.data();

      // Verificar propriedade
      if (formulaData.userId !== currentUser.uid) {
        throw new Error('Acesso negado: fórmula pertence a outro usuário');
      }

      return {
        id: formulaDoc.id,
        ...formulaData
      };
    } catch (error) {
      console.error('Erro ao recuperar fórmula:', error);
      throw error;
    }
  }

  /**
   * Lista fórmulas do usuário com paginação e filtros
   * @param {Object} options - Opções de consulta
   * @param {number} options.limitCount - Limite de resultados
   * @param {string} options.category - Filtro por categoria
   * @param {string} options.orderField - Campo para ordenação
   * @returns {Promise<Array>} - Lista de fórmulas
   */
  static async getUserFormulas(options = {}) {
    try {
      const currentUser = authWrapper.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário deve estar autenticado para listar fórmulas');
      }

      const {
        limitCount = 50,
        category = null,
        orderField = 'updatedAt'
      } = options;

      const formulasRef = collection(db, this.COLLECTION_NAME);
      let formulaQuery = query(
        formulasRef,
        where('userId', '==', currentUser.uid),
        where('isActive', '==', true),
        orderBy(orderField, 'desc'),
        limit(limitCount)
      );

      if (category) {
        formulaQuery = query(
          formulasRef,
          where('userId', '==', currentUser.uid),
          where('isActive', '==', true),
          where('category', '==', category),
          orderBy(orderField, 'desc'),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(formulaQuery);
      const formulas = [];

      querySnapshot.forEach((doc) => {
        formulas.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return formulas;
    } catch (error) {
      console.error('Erro ao listar fórmulas:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma fórmula existente
   * @param {string} formulaId - ID da fórmula
   * @param {Object} updateData - Dados para atualização
   * @returns {Promise<void>}
   */
  static async updateFormula(formulaId, updateData) {
    try {
      const currentUser = authWrapper.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário deve estar autenticado para atualizar fórmulas');
      }

      // Verificar propriedade
      const existingFormula = await this.getFormula(formulaId);
      
      // Validar e sanitizar dados de atualização
      const sanitizedData = {};
      
      if (updateData.name) {
        sanitizedData.name = this._sanitizeString(updateData.name);
      }
      
      if (updateData.expression) {
        sanitizedData.expression = this._sanitizeExpression(updateData.expression);
        const validationResult = this._validateFormulaExpression(
          sanitizedData.expression,
          updateData.parameters || existingFormula.parameters
        );
        
        if (!validationResult.isValid) {
          throw new Error(`Fórmula inválida: ${validationResult.errorMessage}`);
        }
        
        sanitizedData.validationHash = this._generateValidationHash(sanitizedData.expression);
      }
      
      if (updateData.description) {
        sanitizedData.description = this._sanitizeString(updateData.description);
      }
      
      if (updateData.parameters) {
        sanitizedData.parameters = this._sanitizeParameters(updateData.parameters);
      }
      
      if (updateData.category) {
        sanitizedData.category = this._sanitizeString(updateData.category);
      }

      sanitizedData.updatedAt = serverTimestamp();
      sanitizedData['metadata.lastValidated'] = serverTimestamp();

      const formulaRef = doc(db, this.COLLECTION_NAME, formulaId);
      await updateDoc(formulaRef, sanitizedData);
    } catch (error) {
      console.error('Erro ao atualizar fórmula:', error);
      throw error;
    }
  }

  /**
   * Remove uma fórmula (soft delete)
   * @param {string} formulaId - ID da fórmula
   * @returns {Promise<void>}
   */
  static async deleteFormula(formulaId) {
    try {
      const currentUser = authWrapper.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuário deve estar autenticado para excluir fórmulas');
      }

      // Verificar propriedade
      await this.getFormula(formulaId);

      const formulaRef = doc(db, this.COLLECTION_NAME, formulaId);
      await updateDoc(formulaRef, {
        isActive: false,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao excluir fórmula:', error);
      throw error;
    }
  }

  // Métodos privados de validação e sanitização

  /**
   * Valida dados básicos da fórmula
   * @private
   */
  static _validateFormulaData(formulaData) {
    if (!formulaData || typeof formulaData !== 'object') {
      throw new Error('Dados da fórmula são obrigatórios');
    }

    if (!formulaData.name || typeof formulaData.name !== 'string' || formulaData.name.trim().length === 0) {
      throw new Error('Nome da fórmula é obrigatório');
    }

    if (!formulaData.expression || typeof formulaData.expression !== 'string' || formulaData.expression.trim().length === 0) {
      throw new Error('Expressão da fórmula é obrigatória');
    }

    if (formulaData.expression.length > this.MAX_FORMULA_LENGTH) {
      throw new Error(`Expressão muito longa. Máximo ${this.MAX_FORMULA_LENGTH} caracteres`);
    }
  }

  /**
   * Sanitiza uma string removendo caracteres perigosos
   * @private
   */
  static _sanitizeString(str) {
    if (typeof str !== 'string') return '';
    
    return str
      .trim()
      .replace(/[<>"'&]/g, '') // Remove caracteres HTML perigosos
      .substring(0, 500); // Limita tamanho
  }

  /**
   * Sanitiza uma expressão matemática
   * @private
   */
  static _sanitizeExpression(expression) {
    if (typeof expression !== 'string') {
      throw new Error('Expressão deve ser uma string');
    }

    const sanitized = expression.trim();
    
    // Verificar segurança básica
    if (!isExpressionSafe(sanitized)) {
      throw new Error('Expressão contém caracteres ou palavras-chave não permitidos');
    }

    return sanitized;
  }

  /**
   * Valida uma expressão matemática
   * @private
   */
  static _validateFormulaExpression(expression, parameters = []) {
    try {
      // Criar objeto de variáveis de teste
      const testVariables = {};
      parameters.forEach(param => {
        testVariables[param.name] = 1; // Valor de teste
      });

      return validateExpression(expression, testVariables);
    } catch (error) {
      return {
        isValid: false,
        errorMessage: error.message
      };
    }
  }

  /**
   * Sanitiza parâmetros da fórmula
   * @private
   */
  static _sanitizeParameters(parameters) {
    if (!Array.isArray(parameters)) return [];

    return parameters.map(param => ({
      name: this._sanitizeString(param.name || ''),
      type: this._sanitizeString(param.type || 'number'),
      description: this._sanitizeString(param.description || ''),
      required: Boolean(param.required),
      defaultValue: param.defaultValue || null,
      unit: this._sanitizeString(param.unit || '')
    })).filter(param => param.name.length > 0);
  }

  /**
   * Calcula complexidade da expressão
   * @private
   */
  static _calculateComplexity(expression) {
    const operators = (expression.match(/[+\-*/()]/g) || []).length;
    const functions = (expression.match(/\b(sin|cos|tan|log|exp|sqrt|abs|pow)\b/g) || []).length;
    const variables = (expression.match(/@\[[^\]]+\]/g) || []).length;
    
    return operators + (functions * 2) + variables;
  }

  /**
   * Gera hash de validação para a expressão
   * @private
   */
  static _generateValidationHash(expression) {
    // Simples hash para verificação de integridade
    let hash = 0;
    for (let i = 0; i < expression.length; i++) {
      const char = expression.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converte para 32bit
    }
    return hash.toString(36);
  }

  /**
   * Verifica limite de fórmulas por usuário
   * @private
   */
  static async _checkUserFormulaLimit(userId) {
    const formulasRef = collection(db, this.COLLECTION_NAME);
    const countQuery = query(
      formulasRef,
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(countQuery);
    
    if (snapshot.size >= this.MAX_FORMULAS_PER_USER) {
      throw new Error(`Limite de ${this.MAX_FORMULAS_PER_USER} fórmulas por usuário atingido`);
    }
  }

  /**
   * Valida integridade de uma fórmula
   * @param {string} formulaId - ID da fórmula
   * @returns {Promise<Object>} - Resultado da validação
   */
  static async validateFormulaIntegrity(formulaId) {
    try {
      const formula = await this.getFormula(formulaId);
      
      // Verificar hash de validação
      const currentHash = this._generateValidationHash(formula.expression);
      const isHashValid = currentHash === formula.validationHash;
      
      // Revalidar expressão
      const validationResult = this._validateFormulaExpression(formula.expression, formula.parameters);
      
      return {
        isValid: isHashValid && validationResult.isValid,
        hashValid: isHashValid,
        expressionValid: validationResult.isValid,
        errors: validationResult.errors || []
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }
}

export default FormulaService;