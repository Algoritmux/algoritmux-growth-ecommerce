import {
  captureUtmParameters,
  clearStoredUtmParameters,
  getStoredUtmParameters,
  getUtmPayload,
} from '../services/utmService';

describe('captura e persistência de UTMs', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('captura todas as UTMs da URL e limita os valores a 255 caracteres', () => {
    const longTerm = 'x'.repeat(300);

    captureUtmParameters(
      `?utm_source=google&utm_medium=cpc&utm_campaign=black-friday&utm_content=banner&utm_term=${longTerm}`,
    );

    expect(getStoredUtmParameters()).toEqual({
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'black-friday',
      utm_content: 'banner',
      utm_term: 'x'.repeat(255),
    });
  });

  it('aceita ausência total de UTMs e produz o payload nullable completo', () => {
    captureUtmParameters('?ref=homepage');

    expect(getStoredUtmParameters()).toEqual({});
    expect(getUtmPayload()).toEqual({
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_content: null,
      utm_term: null,
    });
  });

  it('preserva UTMs ao navegar e não as sobrescreve com valores vazios', () => {
    captureUtmParameters('?utm_source=google&utm_campaign=lancamento');
    captureUtmParameters('?utm_source=&utm_medium=email');
    captureUtmParameters('');

    expect(getStoredUtmParameters()).toEqual({
      utm_source: 'google',
      utm_medium: 'email',
      utm_campaign: 'lancamento',
    });
  });

  it('limpa somente quando solicitado após o envio', () => {
    captureUtmParameters('?utm_source=google');
    clearStoredUtmParameters();

    expect(getStoredUtmParameters()).toEqual({});
  });
});
