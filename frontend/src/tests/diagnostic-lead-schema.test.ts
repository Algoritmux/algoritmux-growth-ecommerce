import {
  diagnosticLeadSchema,
  formatBrazilianWhatsApp,
  normalizeWhatsApp,
} from '../components/diagnostic/diagnosticLeadSchema';

const nameOnlyLead = {
  name: 'Pessoa Teste',
  whatsapp: '',
  email: '',
  company_name: '',
  revenue_range: '',
};

describe('validação do formulário de diagnóstico', () => {
  it('exige somente o nome', () => {
    expect(diagnosticLeadSchema.parse(nameOnlyLead)).toEqual(nameOnlyLead);
    expect(
      diagnosticLeadSchema.safeParse({ ...nameOnlyLead, name: '' }).success,
    ).toBe(false);
  });

  it.each([
    ['(18) 99999-9999', '18999999999'],
    ['18 99999-9999', '18999999999'],
    ['+55 18 99999-9999', '5518999999999'],
    ['5518999999999', '5518999999999'],
  ])('aceita e normaliza o WhatsApp %s', (whatsapp, expected) => {
    expect(
      diagnosticLeadSchema.safeParse({ ...nameOnlyLead, whatsapp }).success,
    ).toBe(true);
    expect(normalizeWhatsApp(whatsapp)).toBe(expected);
  });

  it('formata números locais e com código do país sem rejeitar a entrada', () => {
    expect(formatBrazilianWhatsApp('18999999999')).toBe('(18) 99999-9999');
    expect(formatBrazilianWhatsApp('+5518999999999')).toBe(
      '+55 (18) 99999-9999',
    );
  });

  it('valida campos opcionais somente quando preenchidos', () => {
    expect(
      diagnosticLeadSchema.safeParse({
        ...nameOnlyLead,
        whatsapp: '(18) 9999-9999',
        email: 'pessoa@empresa.com',
        company_name: 'Empresa Teste',
        revenue_range: '75001_150000',
      }).success,
    ).toBe(true);
    expect(
      diagnosticLeadSchema.safeParse({
        ...nameOnlyLead,
        whatsapp: '123',
      }).success,
    ).toBe(false);
    expect(
      diagnosticLeadSchema.safeParse({
        ...nameOnlyLead,
        email: 'email-inválido',
      }).success,
    ).toBe(false);
  });
});
