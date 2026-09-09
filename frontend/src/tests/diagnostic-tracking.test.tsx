import { StrictMode } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiagnosticModal } from '../components/diagnostic/DiagnosticModal';

const successEvent = { event: 'diagnostic_lead_success' };

function successResponse() {
  return new Response(JSON.stringify({
    message: 'Lead de diagnóstico recebido com sucesso.',
    data: { public_id: 'test-public-id', status: 'new' },
  }), { status: 201 });
}

function renderModal() {
  const onClose = vi.fn();
  const modal = (isOpen: boolean) => (
    <StrictMode>
      <DiagnosticModal isOpen={isOpen} onClose={onClose} />
    </StrictMode>
  );
  const view = render(modal(true));
  return {
    onClose,
    rerenderModal: (isOpen = true) => view.rerender(modal(isOpen)),
  };
}

async function submitValidForm() {
  fireEvent.change(screen.getByLabelText(/^Nome\s*\*?$/), {
    target: { value: 'Pessoa Teste' },
  });
  fireEvent.change(screen.getByLabelText(/WhatsApp/), {
    target: { value: '(18) 99999-9999' },
  });
  fireEvent.change(screen.getByLabelText(/E-mail corporativo/), {
    target: { value: 'pessoa@algoritmux.com' },
  });
  await userEvent.setup().click(screen.getByRole('button', { name: 'Enviar diagnóstico' }));
}

describe('conversão do diagnóstico', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test');
    vi.stubGlobal('dataLayer', []);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('não dispara ao abrir nem ao tentar enviar um formulário inválido', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    renderModal();
    expect(window.dataLayer).toEqual([]);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Enviar diagnóstico' }));

    expect(await screen.findByText('Informe seu nome.')).toBeVisible();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(window.dataLayer).toEqual([]);
  });

  it.each([422, 500, 'network'] as const)('não dispara quando a API falha: %s', async (failure) => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    if (failure === 'network') {
      fetchSpy.mockRejectedValue(new TypeError('Failed to fetch'));
    } else {
      fetchSpy.mockResolvedValue(new Response(JSON.stringify({
        message: 'Os dados enviados são inválidos.',
      }), { status: failure }));
    }
    renderModal();

    await submitValidForm();

    expect(await screen.findByRole('alert')).toBeVisible();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Diagnóstico recebido')).not.toBeInTheDocument();
    expect(window.dataLayer).toEqual([]);
  });

  it('aguarda o sucesso e dispara uma vez, sem duplicar em re-renderizações', async () => {
    let resolveResponse!: (response: Response) => void;
    vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise<Response>((resolve) => {
      resolveResponse = resolve;
    }));
    const { rerenderModal } = renderModal();

    await submitValidForm();
    expect(window.dataLayer).toEqual([]);
    expect(screen.queryByText('Diagnóstico recebido')).not.toBeInTheDocument();

    await act(async () => resolveResponse(successResponse()));

    expect(await screen.findByText('Diagnóstico recebido')).toBeVisible();
    expect(window.dataLayer).toEqual([successEvent]);
    rerenderModal();
    rerenderModal();
    expect(window.dataLayer).toEqual([successEvent]);

    // Reexecuta o efeito por mudança de isOpen, preservando a mesma conclusão.
    rerenderModal(false);
    rerenderModal(true);
    expect(window.dataLayer).toEqual([successEvent]);
  });

  it('permite um novo evento após fechar, reabrir e concluir outro envio', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => successResponse());
    const { onClose, rerenderModal } = renderModal();

    await submitValidForm();
    expect(await screen.findByText('Diagnóstico recebido')).toBeVisible();
    expect(window.dataLayer).toEqual([successEvent]);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    rerenderModal(false);
    rerenderModal(true);
    expect(screen.getByLabelText(/^Nome\s*\*?$/)).toHaveValue('');
    expect(window.dataLayer).toEqual([successEvent]);

    await submitValidForm();

    expect(await screen.findByText('Diagnóstico recebido')).toBeVisible();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(window.dataLayer).toEqual([successEvent, successEvent]);
  });

  it('não dispara com o modal fechado enquanto a API termina', async () => {
    let resolveResponse!: (response: Response) => void;
    vi.spyOn(globalThis, 'fetch').mockReturnValue(new Promise<Response>((resolve) => {
      resolveResponse = resolve;
    }));
    const { rerenderModal } = renderModal();
    await submitValidForm();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Fechar diagnóstico' }));
    rerenderModal(false);

    await act(async () => resolveResponse(successResponse()));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(window.dataLayer).toEqual([]);
  });

  it('mantém o agradecimento funcionando quando dataLayer não existe', async () => {
    vi.stubGlobal('dataLayer', undefined);
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => successResponse());
    renderModal();

    await submitValidForm();

    await waitFor(() => expect(screen.getByText('Diagnóstico recebido')).toBeVisible());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(window.dataLayer).toBeUndefined();
  });
});
