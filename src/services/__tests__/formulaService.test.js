import { FormulaService } from '../formulaService';
import { validateExpression } from '../../utils/mathEvaluator';
import { auth } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';

// Mock das dependências
jest.mock('../firebaseConfig', () => ({
  db: {},
  auth: {
    currentUser: {
      uid: 'test-user-id',
      email: 'test@example.com'
    }
  }
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  serverTimestamp: jest.fn(() => new Date())
}));

jest.mock('../../utils/mathEvaluator', () => ({
  validateExpression: jest.fn()
}));

describe('FormulaService', () => {
  const mockFormulaData = {
    name: 'Teste Fórmula',
    expression: '2 + 2',
    description: 'Fórmula de teste',
    category: 'matematica',
    parameters: []
  };

  const mockFormulaDoc = {
    id: 'formula-123',
    data: () => ({
      ...mockFormulaData,
      userId: 'test-user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }),
    exists: () => true
  };

  beforeEach(() => {
    jest.clearAllMocks();
    validateExpression.mockReturnValue({ isValid: true, errors: [] });
  });

  describe('saveFormula', () => {
    it('deve salvar uma fórmula válida com sucesso', async () => {
      const mockDocRef = { id: 'new-formula-id' };
      doc.mockReturnValue(mockDocRef);
      setDoc.mockResolvedValue();
      
      // Mock para verificação de limite
      const mockQuerySnapshot = {
        size: 5,
        docs: []
      };
      getDocs.mockResolvedValue(mockQuerySnapshot);

      const result = await FormulaService.saveFormula(mockFormulaData);

      expect(result).toBe('new-formula-id');
      expect(validateExpression).toHaveBeenCalledWith('2 + 2');
      expect(setDoc).toHaveBeenCalled();
    });

    it('deve rejeitar fórmula com expressão inválida', async () => {
      validateExpression.mockReturnValue({ 
        isValid: false, 
        errors: ['Expressão inválida'] 
      });

      await expect(FormulaService.saveFormula(mockFormulaData))
        .rejects
        .toThrow('Expressão matemática inválida: Expressão inválida');
    });

    it('deve rejeitar quando usuário não está autenticado', async () => {
      const originalUser = auth.currentUser;
      auth.currentUser = null;

      await expect(FormulaService.saveFormula(mockFormulaData))
        .rejects
        .toThrow('Usuário não autenticado');

      auth.currentUser = originalUser;
    });

    it('deve rejeitar quando limite de fórmulas é excedido', async () => {
      const mockQuerySnapshot = {
        size: 50, // Limite máximo
        docs: []
      };
      getDocs.mockResolvedValue(mockQuerySnapshot);

      await expect(FormulaService.saveFormula(mockFormulaData))
        .rejects
        .toThrow('Limite máximo de fórmulas atingido (50)');
    });

    it('deve rejeitar dados inválidos', async () => {
      const invalidData = {
        name: '', // Nome vazio
        expression: '2 + 2'
      };

      await expect(FormulaService.saveFormula(invalidData))
        .rejects
        .toThrow('Nome da fórmula é obrigatório');
    });
  });

  describe('getFormula', () => {
    it('deve recuperar uma fórmula existente', async () => {
      getDoc.mockResolvedValue(mockFormulaDoc);

      const result = await FormulaService.getFormula('formula-123');

      expect(result).toEqual({
        id: 'formula-123',
        ...mockFormulaDoc.data()
      });
    });

    it('deve retornar null para fórmula inexistente', async () => {
      getDoc.mockResolvedValue({ exists: () => false });

      const result = await FormulaService.getFormula('inexistente');

      expect(result).toBeNull();
    });

    it('deve rejeitar quando usuário não está autenticado', async () => {
      const originalUser = auth.currentUser;
      auth.currentUser = null;

      await expect(FormulaService.getFormula('formula-123'))
        .rejects
        .toThrow('Usuário não autenticado');

      auth.currentUser = originalUser;
    });
  });

  describe('getUserFormulas', () => {
    it('deve recuperar fórmulas do usuário', async () => {
      const mockQuerySnapshot = {
        docs: [mockFormulaDoc]
      };
      getDocs.mockResolvedValue(mockQuerySnapshot);

      const result = await FormulaService.getUserFormulas();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'formula-123',
        ...mockFormulaDoc.data()
      });
    });

    it('deve aplicar filtros corretamente', async () => {
      const mockQuerySnapshot = {
        docs: [mockFormulaDoc]
      };
      getDocs.mockResolvedValue(mockQuerySnapshot);

      const options = {
        category: 'matematica',
        limit: 10,
        orderBy: 'createdAt'
      };

      await FormulaService.getUserFormulas(options);

      expect(query).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith('category', '==', 'matematica');
      expect(limit).toHaveBeenCalledWith(10);
      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    });
  });

  describe('updateFormula', () => {
    it('deve atualizar uma fórmula existente', async () => {
      getDoc.mockResolvedValue(mockFormulaDoc);
      updateDoc.mockResolvedValue();

      const updateData = {
        name: 'Fórmula Atualizada',
        description: 'Nova descrição'
      };

      await FormulaService.updateFormula('formula-123', updateData);

      expect(updateDoc).toHaveBeenCalled();
    });

    it('deve validar nova expressão se fornecida', async () => {
      getDoc.mockResolvedValue(mockFormulaDoc);
      updateDoc.mockResolvedValue();

      const updateData = {
        expression: '3 + 3'
      };

      await FormulaService.updateFormula('formula-123', updateData);

      expect(validateExpression).toHaveBeenCalledWith('3 + 3');
    });

    it('deve rejeitar atualização de fórmula inexistente', async () => {
      getDoc.mockResolvedValue({ exists: () => false });

      await expect(FormulaService.updateFormula('inexistente', {}))
        .rejects
        .toThrow('Fórmula não encontrada');
    });
  });

  describe('deleteFormula', () => {
    it('deve fazer soft delete de uma fórmula', async () => {
      getDoc.mockResolvedValue(mockFormulaDoc);
      updateDoc.mockResolvedValue();

      await FormulaService.deleteFormula('formula-123');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          isActive: false,
          deletedAt: expect.any(Date)
        })
      );
    });

    it('deve rejeitar exclusão de fórmula inexistente', async () => {
      getDoc.mockResolvedValue({ exists: () => false });

      await expect(FormulaService.deleteFormula('inexistente'))
        .rejects
        .toThrow('Fórmula não encontrada');
    });
  });

  describe('validateFormulaIntegrity', () => {
    it('deve validar integridade de fórmula válida', async () => {
      getDoc.mockResolvedValue(mockFormulaDoc);

      const result = await FormulaService.validateFormulaIntegrity('formula-123');

      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('deve detectar problemas de integridade', async () => {
      const corruptedFormulaDoc = {
        ...mockFormulaDoc,
        data: () => ({
          ...mockFormulaDoc.data(),
          expression: '' // Expressão vazia
        })
      };
      getDoc.mockResolvedValue(corruptedFormulaDoc);

      const result = await FormulaService.validateFormulaIntegrity('formula-123');

      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Expressão matemática está vazia');
    });
  });

  describe('_validateFormulaData', () => {
    it('deve validar dados corretos', () => {
      expect(() => FormulaService._validateFormulaData(mockFormulaData))
        .not.toThrow();
    });

    it('deve rejeitar nome vazio', () => {
      const invalidData = { ...mockFormulaData, name: '' };
      expect(() => FormulaService._validateFormulaData(invalidData))
        .toThrow('Nome da fórmula é obrigatório');
    });

    it('deve rejeitar nome muito longo', () => {
      const invalidData = { ...mockFormulaData, name: 'a'.repeat(101) };
      expect(() => FormulaService._validateFormulaData(invalidData))
        .toThrow('Nome da fórmula deve ter no máximo 100 caracteres');
    });

    it('deve rejeitar expressão vazia', () => {
      const invalidData = { ...mockFormulaData, expression: '' };
      expect(() => FormulaService._validateFormulaData(invalidData))
        .toThrow('Expressão matemática é obrigatória');
    });

    it('deve rejeitar categoria inválida', () => {
      const invalidData = { ...mockFormulaData, category: 'categoria-inexistente' };
      expect(() => FormulaService._validateFormulaData(invalidData))
        .toThrow('Categoria inválida');
    });
  });

  describe('_sanitizeFormulaData', () => {
    it('deve sanitizar dados corretamente', () => {
      const dirtyData = {
        name: '  Fórmula com espaços  ',
        expression: '  2 + 2  ',
        description: '  Descrição com espaços  ',
        category: 'matematica'
      };

      const sanitized = FormulaService._sanitizeFormulaData(dirtyData);

      expect(sanitized.name).toBe('Fórmula com espaços');
      expect(sanitized.expression).toBe('2 + 2');
      expect(sanitized.description).toBe('Descrição com espaços');
    });

    it('deve remover caracteres perigosos', () => {
      const dangerousData = {
        name: 'Fórmula<script>alert("xss")</script>',
        expression: '2 + 2',
        description: 'Descrição<img src=x onerror=alert(1)>',
        category: 'matematica'
      };

      const sanitized = FormulaService._sanitizeFormulaData(dangerousData);

      expect(sanitized.name).not.toContain('<script>');
      expect(sanitized.description).not.toContain('<img');
    });
  });
});