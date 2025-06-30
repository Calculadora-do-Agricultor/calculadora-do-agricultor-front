# FormulaService - Serviço de Persistência de Fórmulas

O **FormulaService** é um serviço robusto para gerenciar fórmulas matemáticas no Firestore com parsing seguro, validação e sanitização de dados.

## 📋 Características

- ✅ **Parsing Seguro**: Validação de expressões matemáticas antes da persistência
- 🔒 **Segurança**: Sanitização de dados e proteção contra XSS
- 🚀 **Performance**: Cache e otimizações para consultas eficientes
- 📊 **Validação**: Verificação de integridade de dados
- 🔄 **CRUD Completo**: Operações completas de Create, Read, Update, Delete
- 👥 **Multi-usuário**: Isolamento de dados por usuário
- 📱 **Responsivo**: Suporte a diferentes dispositivos

## 🚀 Instalação e Configuração

### Pré-requisitos

```bash
# Dependências necessárias
npm install firebase
```

### Configuração do Firestore

Certifique-se de que as regras de segurança do Firestore estão configuradas:

```javascript
// firestore.rules
match /formulas/{formulaId} {
  allow read: if isAuthenticated() && 
    (request.auth.uid == resource.data.userId || isAdmin());
  
  allow create: if isAuthenticated() && 
    request.auth.uid == request.resource.data.userId &&
    isValidFormulaData(request.resource.data);
  
  allow update: if isAuthenticated() && 
    request.auth.uid == resource.data.userId &&
    isValidFormulaUpdate(request.resource.data);
  
  allow delete: if isAuthenticated() && 
    (request.auth.uid == resource.data.userId || isAdmin());
}
```

## 📖 Uso Básico

### Importação

```javascript
import { FormulaService } from '../services/formulaService';
```

### Salvando uma Fórmula

```javascript
const formulaData = {
  name: 'Área do Círculo',
  expression: 'PI * r^2',
  description: 'Calcula a área de um círculo',
  category: 'matematica',
  parameters: [
    { name: 'r', description: 'Raio do círculo', unit: 'm' }
  ]
};

try {
  const formulaId = await FormulaService.saveFormula(formulaData);
  console.log('Fórmula salva com ID:', formulaId);
} catch (error) {
  console.error('Erro ao salvar fórmula:', error.message);
}
```

### Recuperando Fórmulas

```javascript
// Buscar fórmula específica
const formula = await FormulaService.getFormula('formula-id');

// Buscar todas as fórmulas do usuário
const userFormulas = await FormulaService.getUserFormulas();

// Buscar com filtros
const filteredFormulas = await FormulaService.getUserFormulas({
  category: 'matematica',
  limit: 10,
  orderBy: 'createdAt'
});
```

### Atualizando uma Fórmula

```javascript
const updateData = {
  name: 'Área do Círculo - Atualizada',
  description: 'Nova descrição'
};

await FormulaService.updateFormula('formula-id', updateData);
```

### Excluindo uma Fórmula

```javascript
// Soft delete (recomendado)
await FormulaService.deleteFormula('formula-id');
```

## 🎣 Hook Personalizado

Use o hook `useFormulaService` para integração fácil com React:

```javascript
import { useFormulaService } from '../hooks/useFormulaService';

function MyComponent() {
  const {
    formulas,
    loading,
    error,
    saveFormula,
    updateFormula,
    deleteFormula,
    searchFormulas,
    getFormulaStats
  } = useFormulaService();

  const handleSave = async () => {
    const formulaData = {
      name: 'Nova Fórmula',
      expression: '2 + 2',
      category: 'matematica'
    };
    
    await saveFormula(formulaData);
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <button onClick={handleSave}>Salvar Fórmula</button>
      {formulas.map(formula => (
        <div key={formula.id}>{formula.name}</div>
      ))}
    </div>
  );
}
```

## 📊 Estrutura de Dados

### Objeto Formula

```javascript
{
  id: 'string',                    // ID único da fórmula
  name: 'string',                  // Nome da fórmula (obrigatório)
  expression: 'string',            // Expressão matemática (obrigatório)
  description: 'string',           // Descrição opcional
  category: 'string',              // Categoria (obrigatório)
  parameters: Array,               // Parâmetros da fórmula
  userId: 'string',                // ID do usuário proprietário
  createdAt: Timestamp,            // Data de criação
  updatedAt: Timestamp,            // Data da última atualização
  isActive: boolean,               // Status ativo/inativo
  metadata: {
    complexity: number,            // Nível de complexidade (0-20)
    usageCount: number,            // Contador de uso
    lastUsed: Timestamp           // Último uso
  }
}
```

### Categorias Disponíveis

- `matematica` - Matemática
- `fisica` - Física
- `quimica` - Química
- `agricultura` - Agricultura
- `economia` - Economia
- `estatistica` - Estatística

## 🔒 Segurança

### Validação de Expressões

Todas as expressões matemáticas são validadas usando o `mathEvaluator`:

```javascript
// Expressões válidas
'2 + 2'
'PI * r^2'
'sqrt(x^2 + y^2)'
'sin(angle) * cos(angle)'

// Expressões inválidas (rejeitadas)
'eval("malicious code")'
'document.cookie'
'<script>alert("xss")</script>'
```

### Sanitização de Dados

Todos os dados são sanitizados antes da persistência:

- Remoção de tags HTML
- Escape de caracteres especiais
- Validação de tipos de dados
- Limitação de tamanho de strings

### Limites de Segurança

- **Máximo de fórmulas por usuário**: 50
- **Tamanho máximo do nome**: 100 caracteres
- **Tamanho máximo da expressão**: 1000 caracteres
- **Tamanho máximo da descrição**: 500 caracteres

## 🧪 Testes

Execute os testes unitários:

```bash
npm test formulaService.test.js
```

Os testes cobrem:
- ✅ Operações CRUD
- ✅ Validação de dados
- ✅ Sanitização
- ✅ Tratamento de erros
- ✅ Limites de segurança
- ✅ Autenticação

## 🔧 API Reference

### FormulaService.saveFormula(formulaData)

Salva uma nova fórmula no Firestore.

**Parâmetros:**
- `formulaData` (Object): Dados da fórmula

**Retorna:**
- `Promise<string>`: ID da fórmula criada

**Throws:**
- `Error`: Se dados inválidos ou usuário não autenticado

### FormulaService.getFormula(formulaId)

Recupera uma fórmula específica.

**Parâmetros:**
- `formulaId` (string): ID da fórmula

**Retorna:**
- `Promise<Object|null>`: Dados da fórmula ou null se não encontrada

### FormulaService.getUserFormulas(options)

Recupera fórmulas do usuário com filtros opcionais.

**Parâmetros:**
- `options` (Object): Opções de consulta
  - `category` (string): Filtrar por categoria
  - `limit` (number): Limitar resultados
  - `orderBy` (string): Campo para ordenação
  - `orderDirection` (string): 'asc' ou 'desc'

**Retorna:**
- `Promise<Array>`: Lista de fórmulas

### FormulaService.updateFormula(formulaId, updateData)

Atualiza uma fórmula existente.

**Parâmetros:**
- `formulaId` (string): ID da fórmula
- `updateData` (Object): Dados para atualização

**Retorna:**
- `Promise<void>`

### FormulaService.deleteFormula(formulaId)

Exclui uma fórmula (soft delete).

**Parâmetros:**
- `formulaId` (string): ID da fórmula

**Retorna:**
- `Promise<void>`

### FormulaService.validateFormulaIntegrity(formulaId)

Valida a integridade de uma fórmula.

**Parâmetros:**
- `formulaId` (string): ID da fórmula

**Retorna:**
- `Promise<Object>`: Resultado da validação
  - `isValid` (boolean): Se a fórmula é válida
  - `issues` (Array): Lista de problemas encontrados

## 🐛 Tratamento de Erros

O FormulaService lança erros específicos para diferentes situações:

```javascript
try {
  await FormulaService.saveFormula(invalidData);
} catch (error) {
  switch (error.message) {
    case 'Usuário não autenticado':
      // Redirecionar para login
      break;
    case 'Limite máximo de fórmulas atingido (50)':
      // Mostrar mensagem de limite
      break;
    case 'Expressão matemática inválida':
      // Mostrar erro de validação
      break;
    default:
      // Erro genérico
      console.error('Erro inesperado:', error);
  }
}
```

## 📈 Performance

### Otimizações Implementadas

- **Índices Firestore**: Criados automaticamente para consultas eficientes
- **Paginação**: Suporte a limit e offset
- **Cache**: Resultados podem ser cacheados no cliente
- **Lazy Loading**: Carregamento sob demanda

### Melhores Práticas

1. **Use filtros**: Sempre filtre por categoria quando possível
2. **Limite resultados**: Use o parâmetro `limit` para consultas grandes
3. **Cache local**: Implemente cache no cliente para dados frequentes
4. **Validação prévia**: Valide dados no frontend antes de enviar

## 🤝 Contribuição

Para contribuir com o FormulaService:

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Adicione testes para novas funcionalidades
4. Execute os testes existentes
5. Faça commit das mudanças
6. Abra um Pull Request

## 📝 Changelog

### v1.0.0
- ✨ Implementação inicial do FormulaService
- 🔒 Sistema de segurança e validação
- 🧪 Testes unitários completos
- 📖 Documentação completa
- 🎣 Hook useFormulaService
- 🎨 Componente FormulaManager de exemplo

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🆘 Suporte

Para dúvidas ou problemas:

1. Verifique a documentação
2. Execute os testes para verificar a configuração
3. Verifique os logs do console para erros específicos
4. Abra uma issue no repositório do projeto

---

**Desenvolvido com ❤️ para a Calculadora do Agricultor**