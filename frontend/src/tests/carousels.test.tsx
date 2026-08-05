import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { CaseCarousel } from '../components/cases/CaseCarousel';
import { TeamShowcase } from '../components/team/TeamShowcase';
import { cases } from '../data/cases';
import { team } from '../data/team';
import type { CaseStudy } from '../types/content';

const extraCase: CaseStudy = {
  id: 'terceiro',
  company: 'Terceiro Case',
  segment: 'Serviços',
  growth: '+90%',
  roas: '3.2x',
  description: 'Case adicional para validar múltiplas posições.',
  ariaLabel: 'Terceiro case de teste.',
};

function visibleCompanies(): string[] {
  return screen.getAllByRole('article').map((card) =>
    within(card).getByRole('heading', { level: 3 }).textContent ?? '',
  );
}

function useMobileViewport(): void {
  vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
    matches: query === '(max-width: 767px)',
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }));
}

describe('carrossel de cases', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('com um item não exibe controles, indicadores ou autoplay', () => {
    render(<CaseCarousel items={[cases[0]]} />);
    expect(screen.getByText('Rodas Lençóis')).toBeVisible();
    expect(screen.queryByRole('button', { name: /Próximo: case/i })).toBeNull();
    expect(screen.queryByLabelText(/Posição do carrossel/i)).toBeNull();
  });

  it('exibe dois cards por página e avança sem sobreposição no desktop', () => {
    render(<CaseCarousel items={cases} />);

    const firstPage = visibleCompanies();
    expect(firstPage).toEqual(['Rodas Lençóis', 'EmbaleBem']);
    expect(screen.getAllByRole('button', { name: /Ir para página/i })).toHaveLength(3);

    fireEvent.click(screen.getByRole('button', { name: 'Próximo: case' }));
    const secondPage = visibleCompanies();
    expect(secondPage).toEqual(['Carrozza', 'The Best']);
    expect(secondPage.some((company) => firstPage.includes(company))).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Próximo: case' }));
    const thirdPage = visibleCompanies();
    expect(thirdPage).toEqual(['ITX', 'Wcare']);
    expect(thirdPage.some((company) => secondPage.includes(company))).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Próximo: case' }));
    expect(visibleCompanies()).toEqual(firstPage);
  });

  it('retorna exatamente ao grupo anterior no desktop', () => {
    render(<CaseCarousel items={cases} />);

    fireEvent.click(screen.getByRole('button', { name: 'Próximo: case' }));
    expect(visibleCompanies()).toEqual(['Carrozza', 'The Best']);
    fireEvent.click(screen.getByRole('button', { name: 'Anterior: case' }));
    expect(visibleCompanies()).toEqual(['Rodas Lençóis', 'EmbaleBem']);
  });

  it('oferece indicadores por página e navegação por teclado no desktop', () => {
    render(<CaseCarousel items={cases} />);
    const carousel = screen.getByRole('region', { name: 'Cases de sucesso' });

    fireEvent.keyDown(carousel, { key: 'ArrowRight' });
    expect(visibleCompanies()).toEqual(['Carrozza', 'The Best']);
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Ir para página 3 de 3',
      }),
    );
    expect(visibleCompanies()).toEqual(['ITX', 'Wcare']);
  });

  it('exibe e avança um case por vez no mobile, inclusive por swipe', () => {
    useMobileViewport();
    render(<CaseCarousel items={cases} />);
    const carousel = screen.getByRole('region', { name: 'Cases de sucesso' });

    expect(visibleCompanies()).toEqual(['Rodas Lençóis']);
    expect(screen.getAllByRole('button', { name: /Ir para item/i })).toHaveLength(6);

    fireEvent.click(screen.getByRole('button', { name: 'Próximo: case' }));
    expect(visibleCompanies()).toEqual(['EmbaleBem']);

    fireEvent.touchStart(carousel, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(carousel, { changedTouches: [{ clientX: 20 }] });
    expect(visibleCompanies()).toEqual(['Carrozza']);

    fireEvent.click(screen.getByRole('button', { name: 'Anterior: case' }));
    expect(visibleCompanies()).toEqual(['EmbaleBem']);
  });

  it('mantém os cases reais sem IDs ou empresas duplicados', () => {
    expect(new Set(cases.map(({ id }) => id)).size).toBe(cases.length);
    expect(new Set(cases.map(({ company }) => company)).size).toBe(cases.length);
    expect(cases.map(({ company }) => company)).toEqual([
      'Rodas Lençóis',
      'EmbaleBem',
      'Carrozza',
      'The Best',
      'ITX',
      'Wcare',
    ]);
  });

  it('pausa o autoplay durante hover e retoma de forma controlada', () => {
    vi.useFakeTimers();
    render(<CaseCarousel items={[...cases, extraCase]} autoPlayInterval={6000} />);
    const carousel = screen.getByRole('region', { name: 'Cases de sucesso' });
    fireEvent.mouseEnter(carousel);
    act(() => vi.advanceTimersByTime(7000));
    expect(screen.getAllByRole('article')[0]).toHaveTextContent('Rodas Lençóis');
    fireEvent.mouseLeave(carousel);
    act(() => vi.advanceTimersByTime(6000));
    expect(visibleCompanies()).toEqual(['Carrozza', 'The Best']);
  });
});

describe('vitrine da equipe', () => {
  it('troca integrantes por controles e não inclui o ex-integrante removido', () => {
    render(<TeamShowcase members={team} />);
    expect(screen.getByRole('heading', { name: 'Guilherme Correia' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Próximo integrante' }));
    expect(screen.getByRole('heading', { name: 'Hugo Hoch' })).toBeVisible();
    expect(screen.queryByText(/Marcelo Falcão/i)).not.toBeInTheDocument();
  });
});
