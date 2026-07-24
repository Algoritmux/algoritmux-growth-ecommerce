import {
  diagnosticLeadSchema,
  normalizeWebsite,
} from '../components/diagnostic/diagnosticLeadSchema';

const validLead = {
  name: 'Pessoa Teste',
  whatsapp: '(12) 99999-9999',
  email: 'pessoa@example.test',
  company_name: 'Empresa Teste',
  revenue_range: 'up_to_50000',
};

describe('validação do site no diagnóstico', () => {
  it.each([
    ['empresa.com', 'https://empresa.com'],
    ['empresa.com.br', 'https://empresa.com.br'],
    ['empresa.io', 'https://empresa.io'],
    ['empresa.ai', 'https://empresa.ai'],
    ['empresa.net', 'https://empresa.net'],
    ['empresa.org', 'https://empresa.org'],
    ['loja.empresa.com/campanha?origem=ads#form', 'https://loja.empresa.com/campanha?origem=ads#form'],
    ['http://empresa.net/contato', 'http://empresa.net/contato'],
  ])('normaliza e aceita %s', (website, expected) => {
    const result = diagnosticLeadSchema.parse({ ...validLead, website });

    expect(result.website).toBe(expected);
  });

  it('permite site vazio', () => {
    expect(diagnosticLeadSchema.parse({ ...validLead, website: '   ' }).website).toBe('');
  });

  it.each([
    'www',
    'empresa',
    'javascript:alert(1)',
    'file:///arquivo',
    'ftp://empresa.com',
    'http://localhost',
    'http://127.0.0.1',
    'http://192.168.1.10',
  ])('rejeita %s', (website) => {
    expect(diagnosticLeadSchema.safeParse({ ...validLead, website }).success).toBe(false);
  });

  it('remove espaços externos antes de enviar', () => {
    expect(normalizeWebsite('  empresa.tech/pagina  ')).toBe('https://empresa.tech/pagina');
  });
});
