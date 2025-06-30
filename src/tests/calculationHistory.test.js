import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CalculationHistoryService } from '../services/calculationHistoryService';
import { authWrapper } from '../services/firebaseWrapper';

// Mock Firebase services
vi.mock('../services/firebaseWrapper', () => ({
  authWrapper: {
    getCurrentUser: vi.fn(),
  },
  firestoreWrapper: {
    addDocument: vi.fn(),
    getDocuments: vi.fn(),
    deleteDocument: vi.fn(),
  },
}));

vi.mock('firebase/firestore', () => ({
  serverTimestamp: vi.fn(() => ({ _methodName: 'serverTimestamp' })),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
}));

describe('CalculationHistoryService', () => {
  const mockUser = {
    uid: 'test-user-123',
    email: 'test@example.com',
  };

  const mockCalculation = {
    id: 'calc_pulverizacao',
    name: 'Cálculo de Pulverização',
    parameters: [
      {
        id: 'param_velocidade',
        name: 'Velocidade',
        type: 'number',
        unit: 'km/h',
      },
      {
        id: 'param_largura',
        name: 'Largura da Barra',
        type: 'number',
        unit: 'm',
      },
    ],
    results: [
      {
        id: 'res_volume_total',
        name: 'Volume Total',
        unit: 'L/ha',
      },
      {
        id: 'res_tempo_aplicacao',
        name: 'Tempo de Aplicação',
        unit: 'min/ha',
      },
    ],
  };

  const mockParamValues = {
    'Velocidade': '12',
    'Largura da Barra': '18',
  };

  const mockResults = {
    result_0: {
      value: '150.5',
      formatted: '150,5 L/ha',
    },
    result_1: {
      value: '5.2',
      formatted: '5,2 min/ha',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authWrapper.getCurrentUser.mockReturnValue(mockUser);
  });

  describe('transformToHistoryFormat', () => {
    it('should transform calculation data to history format correctly', () => {
      const result = CalculationHistoryService.transformToHistoryFormat(
        mockCalculation,
        mockParamValues,
        mockResults
      );

      expect(result.parametersUsed).toEqual({
        'param_velocidade': '12',
        'param_largura': '18',
      });

      expect(result.results).toEqual({
        'res_volume_total': '150,5 L/ha',
        'res_tempo_aplicacao': '5,2 min/ha',
      });
    });

    it('should handle missing parameter IDs by generating fallback IDs', () => {
      const calculationWithoutIds = {
        ...mockCalculation,
        parameters: [
          {
            name: 'Velocidade do Vento',
            type: 'number',
            unit: 'm/s',
          },
        ],
        results: [
          {
            name: 'Deriva Estimada',
            unit: '%',
          },
        ],
      };

      const paramValues = { 'Velocidade do Vento': '5.5' };
      const results = {
        result_0: {
          value: '12.3',
          formatted: '12,3%',
        },
      };

      const result = CalculationHistoryService.transformToHistoryFormat(
        calculationWithoutIds,
        paramValues,
        results
      );

      expect(result.parametersUsed).toEqual({
        'param_velocidade_do_vento': '5.5',
      });

      expect(result.results).toEqual({
        'res_deriva_estimada': '12,3%',
      });
    });

    it('should skip empty or undefined parameter values', () => {
      const paramValuesWithEmpty = {
        'Velocidade': '12',
        'Largura da Barra': '',
        'Campo Vazio': undefined,
      };

      const result = CalculationHistoryService.transformToHistoryFormat(
        mockCalculation,
        paramValuesWithEmpty,
        mockResults
      );

      expect(result.parametersUsed).toEqual({
        'param_velocidade': '12',
      });
    });
  });

  describe('saveCalculationHistory', () => {
    it('should save calculation history with correct data structure', async () => {
      const { firestoreWrapper } = await import('../services/firebaseWrapper');
      firestoreWrapper.addDocument.mockResolvedValue('doc-id-123');

      const { parametersUsed, results } = CalculationHistoryService.transformToHistoryFormat(
        mockCalculation,
        mockParamValues,
        mockResults
      );

      const docId = await CalculationHistoryService.saveCalculationHistory(
        mockCalculation.id,
        parametersUsed,
        results
      );

      expect(firestoreWrapper.addDocument).toHaveBeenCalledWith(
        `users/${mockUser.uid}/calculationHistory`,
        {
          calculationId: 'calc_pulverizacao',
          timestamp: { _methodName: 'serverTimestamp' },
          parametersUsed: {
            'param_velocidade': '12',
            'param_largura': '18',
          },
          results: {
            'res_volume_total': '150,5 L/ha',
            'res_tempo_aplicacao': '5,2 min/ha',
          },
          userId: 'test-user-123',
        }
      );

      expect(docId).toBe('doc-id-123');
    });

    it('should throw error when user is not authenticated', async () => {
      authWrapper.getCurrentUser.mockReturnValue(null);

      await expect(
        CalculationHistoryService.saveCalculationHistory(
          'calc_test',
          { param1: 'value1' },
          { result1: 'value1' }
        )
      ).rejects.toThrow('User must be authenticated to save calculation history');
    });
  });

  describe('getCalculationHistory', () => {
    it('should retrieve calculation history for authenticated user', async () => {
      const { firestoreWrapper } = await import('../services/firebaseWrapper');
      const mockHistoryData = [
        {
          id: 'history-1',
          calculationId: 'calc_pulverizacao',
          timestamp: new Date('2024-01-15T10:30:00Z'),
          parametersUsed: { param_velocidade: '12' },
          results: { res_volume_total: '150,5 L/ha' },
        },
      ];

      firestoreWrapper.getDocuments.mockResolvedValue(mockHistoryData);

      const history = await CalculationHistoryService.getCalculationHistory();

      expect(firestoreWrapper.getDocuments).toHaveBeenCalledWith(
        `users/${mockUser.uid}/calculationHistory`,
        expect.any(Array) // query constraints
      );

      expect(history).toEqual(mockHistoryData);
    });
  });
});