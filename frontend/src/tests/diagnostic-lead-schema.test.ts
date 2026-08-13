import {
  diagnosticLeadSchema,
  formatBrazilianWhatsApp,
  normalizeWhatsApp,
} from '../components/diagnostic/diagnosticLeadSchema';

const validLead = {
  name: 'Pessoa Teste',
  whatsapp: '(18) 99999-9999',
  email: 'pessoa@algoritmux.com',
  company_name: '',
  revenue_range: '',
};

describe('validação do formulário de diagnóstico', () => {
  it('exige nome, WhatsApp e e-mail corporativo', () => {
    expect(diagnosticLeadSchema.safeParse(validLead).success).toBe(true);

    expect(
      diagnosticLeadSchema.safeParse({
        ...validLead,
        name: '',
      }).success,
    ).toBe(false);

    expect(
      diagnosticLeadSchema.safeParse({
        ...validLead,
        whatsapp: '',
      }).success,
    ).toBe(false);

    expect(
      diagnosticLeadSchema.safeParse({
        ...validLead,
        email: '',
      }).success,
    ).toBe(false);
  });

  it.each([
    ['(18) 99999-9999', '18999999999'],
    ['18 99999-9999', '18999999999'],
    ['+55 18 99999-9999', '5518999999999'],
    ['5518999999999', '5518999999999'],
  ])('aceita e normaliza o WhatsApp %s', (whatsapp, expected) => {
    expect(
      diagnosticLeadSchema.safeParse({
        ...validLead,
        whatsapp,
      }).success,
    ).toBe(true);

    expect(normalizeWhatsApp(whatsapp)).toBe(expected);
  });

  it('formata números locais e com código do país sem rejeitar a entrada', () => {
    expect(formatBrazilianWhatsApp('18999999999')).toBe(
      '(18) 99999-9999',
    );

    expect(formatBrazilianWhatsApp('+5518999999999')).toBe(
      '+55 (18) 99999-9999',
    );
  });

  it('rejeita WhatsApp inválido', () => {
    expect(
      diagnosticLeadSchema.safeParse({
        ...validLead,
        whatsapp: '123',
      }).success,
    ).toBe(false);
  });

  it.each([
    'pessoa@gmail.com',
    'pessoa@hotmail.com',
    'pessoa@outlook.com',
    'pessoa@yahoo.com',
    'pessoa@icloud.com',
  ])('rejeita e-mail gratuito %s', (email) => {
    const result = diagnosticLeadSchema.safeParse({
      ...validLead,
      email,
    });

    expect(result.success).toBe(false);
  });

  it('aceita e-mail corporativo', () => {
    expect(
      diagnosticLeadSchema.safeParse({
        ...validLead,
        email: 'contato@algoritmux.com',
      }).success,
    ).toBe(true);

    expect(
      diagnosticLeadSchema.safeParse({
        ...validLead,
        email: 'diretoria@algoritmux.com',
      }).success,
    ).toBe(true);
  });

  it('rejeita e-mail com formato inválido', () => {
    expect(
      diagnosticLeadSchema.safeParse({
        ...validLead,
        email: 'email-invalido',
      }).success,
    ).toBe(false);
  });

  it('mantém empresa e faturamento como opcionais', () => {
    expect(
      diagnosticLeadSchema.safeParse({
        ...validLead,
        company_name: '',
        revenue_range: '',
      }).success,
    ).toBe(true);

    expect(
      diagnosticLeadSchema.safeParse({
        ...validLead,
        company_name: 'Empresa Teste',
        revenue_range: '75001_150000',
      }).success,
    ).toBe(true);
  });
});