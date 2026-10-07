import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeadMagnetCard } from '../components/lead-magnet/LeadMagnetCard';
import { captureUtmParameters } from '../services/utmService';

function successResponse() {
  return new Response(JSON.stringify({
    message: 'E-book enviado. Confira sua caixa de entrada.',
    data: { public_id: 'test-public-id', email_status: 'sent' },
  }), { status: 201 });
}

async function fillValidForm(consent = false) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Nome'), 'Pessoa Teste');
  await user.type(screen.getByLabelText('E-mail'), 'Pessoa@Gmail.com');

  if (consent) {
    await user.click(screen.getByRole('checkbox'));
  }

  return user;
}

describe('lead magnet', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test');
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('é acessível e valida nome e e-mail antes de chamar a API', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<LeadMagnetCard />);

    expect(screen.getByRole('form', { name: 'Receber e-book gratuito' })).toBeVisible();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    expect(screen.getByText(/A entrega do e-book não depende/)).toBeVisible();

    await userEvent.setup().click(
      screen.getByRole('button', { name: /Receber e-book gratuito/ }),
    );

    expect(await screen.findByText('Informe seu nome.')).toBeVisible();
    expect(screen.getByText('Informe seu e-mail.')).toBeVisible();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('envia payload normalizado com consentimento opcional, origem e UTMs', async () => {
    captureUtmParameters('?utm_source=google&utm_medium=cpc&utm_campaign=ebook&utm_content=card&utm_term=growth');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(successResponse());
    render(<LeadMagnetCard />);
    const user = await fillValidForm(true);

    await user.click(screen.getByRole('button', { name: /Receber e-book gratuito/ }));

    expect(await screen.findByText('O e-book está a caminho.')).toBeVisible();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const request = fetchSpy.mock.calls[0];
    const body = JSON.parse((request[1] as RequestInit).body as string);
    expect(request[0]).toBe('https://api.example.test/api/v1/leads/lead-magnet');
    expect(body).toMatchObject({
      name: 'Pessoa Teste',
      email: 'pessoa@gmail.com',
      lead_magnet: 'growth-ecommerce-playbook',
      newsletter_consent: true,
      company_website: '',
      source_page: '/',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'ebook',
      utm_content: 'card',
      utm_term: 'growth',
    });
  });

  it('envia normalmente sem consentimento', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(successResponse());
    render(<LeadMagnetCard />);
    const user = await fillValidForm();

    await user.click(screen.getByRole('button', { name: /Receber e-book gratuito/ }));

    await screen.findByText('O e-book está a caminho.');
    const body = JSON.parse((fetchSpy.mock.calls[0][1] as RequestInit).body as string);
    expect(body.newsletter_consent).toBe(false);
  });

  it('mostra loading enquanto aguarda a API e depois sucesso', async () => {
    let resolveResponse!: (response: Response) => void;
    vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise<Response>((resolve) => {
      resolveResponse = resolve;
    }));
    render(<LeadMagnetCard />);
    const user = await fillValidForm();

    await user.click(screen.getByRole('button', { name: /Receber e-book gratuito/ }));

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');

    await act(async () => resolveResponse(successResponse()));
    expect(await screen.findByText('O e-book está a caminho.')).toBeVisible();
  });

  it.each([
    [500, 'Não foi possível enviar o e-book agora.'],
    [429, 'Você já solicitou este material recentemente.'],
  ] as const)('exibe erro da API para status %s e mantém o formulário', async (status, message) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({}), { status }));
    render(<LeadMagnetCard />);
    const user = await fillValidForm();

    await user.click(screen.getByRole('button', { name: /Receber e-book gratuito/ }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(message));
    expect(screen.getByLabelText('E-mail')).toBeVisible();
  });
});
