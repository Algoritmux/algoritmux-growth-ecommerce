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

async function fillBusinessStep(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nome da empresa'), 'Empresa Teste');
  await user.selectOptions(
    screen.getByLabelText('Faturamento mensal'),
    '75001_150000',
  );
  await user.type(screen.getByLabelText('Site da empresa'), 'empresa.io');
  await user.click(screen.getByRole('button', { name: 'Continuar' }));
}

async function fillContactStep(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Seu nome'), 'Pessoa Teste');
  await user.type(screen.getByLabelText('WhatsApp'), '12999999999');
  await user.type(screen.getByLabelText('E-mail corporativo'), 'PESSOA@EXAMPLE.TEST');
}

describe('navegação e diagnóstico', () => {
  it('marca a rota ativa e controla o menu mobile com aria-expanded', async () => {
    const user = userEvent.setup();
    renderApp('/blog.html');
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
    renderApp();
    await user.click(
      screen.getAllByRole('button', { name: 'Solicitar diagnóstico' })[0],
    );

    await fillBusinessStep(user);
    await fillContactStep(user);
    await user.click(screen.getByRole('button', { name: 'Enviar diagnóstico' }));

    await waitFor(() => {
      expect(screen.getByText('Diagnóstico recebido')).toBeVisible();
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/leads/diagnostic'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(JSON.parse(String(fetchSpy.mock.calls[0][1]?.body))).toMatchObject({
      whatsapp: '12999999999',
      email: 'pessoa@example.test',
      website: 'https://empresa.io',
      revenue_range: '75001_150000',
      source_page: '/',
    });

    await user.click(screen.getByRole('button', { name: 'Conversar com nosso time' }));
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://wa.me/5512992474969?text='),
      '_blank',
      'noopener,noreferrer',
    );
    fetchSpy.mockRestore();
    openSpy.mockRestore();
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
    renderApp();
    await user.click(
      screen.getAllByRole('button', { name: 'Solicitar diagnóstico' })[0],
    );

    await fillBusinessStep(user);
    await fillContactStep(user);
    await user.click(screen.getByRole('button', { name: 'Enviar diagnóstico' }));

    await waitFor(() => {
      expect(screen.getByText('Os dados enviados são inválidos.')).toBeVisible();
    });
    expect(screen.queryByText('Diagnóstico recebido')).not.toBeInTheDocument();
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
      screen.getByRole('button', { name: 'Solicitar diagnóstico de performance' }),
    ).toHaveClass('button--primary');
  });
});
