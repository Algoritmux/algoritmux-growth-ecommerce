import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../App';

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

async function fillCompleteDiagnostic(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nome'), 'Pessoa Teste');
  await user.type(screen.getByLabelText('WhatsApp'), '+55 18 99999-9999');
  await user.type(screen.getByLabelText('Nome da empresa'), 'Empresa Teste');
  await user.type(screen.getByLabelText('E-mail'), 'PESSOA@EXAMPLE.TEST');
  await user.selectOptions(
    screen.getByLabelText('Faturamento mensal'),
    '75001_150000',
  );
}

describe('navegação e diagnóstico', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('marca a rota ativa e controla o menu mobile com aria-expanded', async () => {
    const user = userEvent.setup();
    renderApp('/blog');
    const activeLinks = screen.getAllByRole('link', { name: 'Blog' });
    expect(activeLinks[0]).toHaveAttribute('aria-current', 'page');

    const menuButton = screen.getByRole('button', { name: 'Abrir menu' });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await user.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('navigation', { name: 'Navegação mobile' })).toBeVisible();
    await user.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('preserva as UTMs capturadas durante a navegação interna', async () => {
    const user = userEvent.setup();
    renderApp('/?utm_source=google&utm_campaign=lancamento');

    await waitFor(() => {
      expect(window.sessionStorage.getItem('diagnostic_lead_utms')).toContain('google');
    });
    await user.click(screen.getAllByRole('link', { name: 'Metodologia' })[0]);

    expect(window.sessionStorage.getItem('diagnostic_lead_utms')).toContain('google');
    expect(window.sessionStorage.getItem('diagnostic_lead_utms')).toContain('lancamento');
  });

  it('abre e fecha o modal, bloqueia scroll e retorna o foco', async () => {
    const user = userEvent.setup();
    renderApp();
    const opener = screen.getAllByRole('button', {
      name: 'Solicitar diagnóstico',
    })[0];
    opener.focus();
    await user.click(opener);

    expect(screen.getByRole('dialog')).toBeVisible();
    expect(document.body).toHaveStyle({ overflow: 'hidden' });
    expect(screen.getByRole('button', { name: 'Fechar diagnóstico' })).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(opener).toHaveFocus();
  });

  it('exibe todos os campos em uma única etapa sem website ou navegação', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(
      screen.getAllByRole('button', { name: 'Solicitar diagnóstico' })[0],
    );

    expect(screen.getByLabelText('Nome')).toBeVisible();
    expect(screen.getByLabelText('WhatsApp')).toBeVisible();
    expect(screen.getByLabelText('Nome da empresa')).toBeVisible();
    expect(screen.getByLabelText('E-mail')).toBeVisible();
    expect(screen.getByLabelText('Faturamento mensal')).toBeVisible();
    expect(screen.queryByLabelText('Site da empresa')).not.toBeInTheDocument();
    expect(screen.queryByText(/Etapa \d de 3/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continuar' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Voltar' })).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Enviar diagnóstico' }),
    ).toBeVisible();
  });

  it('envia o diagnóstico, normaliza o payload e mostra o agradecimento', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'Lead de diagnóstico recebido com sucesso.',
          data: { public_id: 'test-public-id', status: 'new' },
        }),
        { status: 201 },
      ),
    );
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderApp('/?utm_source=google&utm_medium=cpc&utm_campaign=lancamento&utm_content=banner&utm_term=ecommerce');
    await user.click(
      screen.getAllByRole('button', { name: 'Solicitar diagnóstico' })[0],
    );

    await fillCompleteDiagnostic(user);
    await user.click(screen.getByRole('button', { name: 'Enviar diagnóstico' }));

    await waitFor(() => {
      expect(screen.getByText('Diagnóstico recebido')).toBeVisible();
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/leads/diagnostic'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(JSON.parse(String(fetchSpy.mock.calls[0][1]?.body))).toMatchObject({
      whatsapp: '5518999999999',
      email: 'pessoa@example.test',
      company_name: 'Empresa Teste',
      revenue_range: '75001_150000',
      source_page: '/',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'lancamento',
      utm_content: 'banner',
      utm_term: 'ecommerce',
    });
    expect(JSON.parse(String(fetchSpy.mock.calls[0][1]?.body))).not.toHaveProperty(
      'website',
    );
    expect(window.sessionStorage.getItem('diagnostic_lead_utms')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Conversar com nosso time' }));
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/5512992474969?text='),
      '_blank',
      'noopener,noreferrer',
    );
    fetchSpy.mockRestore();
    openSpy.mockRestore();
  });

  it('envia somente o nome uma única vez e converte opcionais vazios em null', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'Lead de diagnóstico recebido com sucesso.',
          data: { public_id: 'name-only-id', status: 'new' },
        }),
        { status: 201 },
      ),
    );
    renderApp();
    await user.click(
      screen.getAllByRole('button', { name: 'Solicitar diagnóstico' })[0],
    );
    await user.type(screen.getByLabelText('Nome'), 'Pessoa Sem Atrito');

    const submitButton = screen.getByRole('button', {
      name: 'Enviar diagnóstico',
    });
    await user.dblClick(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Diagnóstico recebido')).toBeVisible();
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(fetchSpy.mock.calls[0][1]?.body))).toMatchObject({
      name: 'Pessoa Sem Atrito',
      whatsapp: null,
      email: null,
      company_name: null,
      revenue_range: null,
    });
    fetchSpy.mockRestore();
  });

  it('mostra os erros retornados pela API sem avançar para o agradecimento', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'Os dados enviados são inválidos.',
          errors: { email: ['O campo e-mail é inválido.'] },
        }),
        { status: 422 },
      ),
    );
    renderApp('/?utm_source=linkedin');
    await user.click(
      screen.getAllByRole('button', { name: 'Solicitar diagnóstico' })[0],
    );

    await user.type(screen.getByLabelText('Nome'), 'Pessoa Teste');
    await user.type(screen.getByLabelText('E-mail'), 'pessoa@example.test');
    await user.click(screen.getByRole('button', { name: 'Enviar diagnóstico' }));

    await waitFor(() => {
      expect(screen.getByText('Os dados enviados são inválidos.')).toBeVisible();
    });
    expect(screen.queryByText('Diagnóstico recebido')).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem('diagnostic_lead_utms')).toContain('linkedin');
    fetchSpy.mockRestore();
  });

  it('mantém links externos seguros e CTAs principais na variante verde', () => {
    renderApp();
    const externalLinks = [
      ...document.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]'),
    ];
    expect(externalLinks.length).toBeGreaterThan(0);
    externalLinks.forEach((link) => {
      expect(link.rel).toContain('noopener');
      expect(link.rel).toContain('noreferrer');
    });
    expect(
      screen.getByRole('button', {
        name: 'Fale conosco e receba um diagnóstico gratuito',
      }),
    ).toHaveClass('button--primary');
  });
});
