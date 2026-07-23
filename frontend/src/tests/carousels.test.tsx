import { act, fireEvent, render, screen } from '@testing-library/react';
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

describe('carrossel de cases', () => {
  it('com um item não exibe controles, indicadores ou autoplay', () => {
    render(<CaseCarousel items={[cases[0]]} />);
    expect(screen.getByText('Rodas Lençóis')).toBeVisible();
    expect(screen.queryByRole('button', { name: /Próximo: case/i })).toBeNull();
    expect(screen.queryByLabelText(/Posição do carrossel/i)).toBeNull();
  });

  it('com dois itens responde aos botões anterior e próximo', () => {
    render(<CaseCarousel items={cases} />);
    const firstCards = screen.getAllByRole('article');
    expect(firstCards[0]).toHaveTextContent('Rodas Lençóis');
    fireEvent.click(screen.getByRole('button', { name: 'Próximo: case' }));
    expect(screen.getAllByRole('article')[0]).toHaveTextContent('EmbaleBem');
    fireEvent.click(screen.getByRole('button', { name: 'Anterior: case' }));
    expect(screen.getAllByRole('article')[0]).toHaveTextContent('Rodas Lençóis');
  });

  it('com vários itens oferece indicadores e navegação por teclado', () => {
    render(<CaseCarousel items={[...cases, extraCase]} />);
    const carousel = screen.getByRole('region', { name: 'Cases de sucesso' });
    expect(
      screen.getAllByRole('button', { name: /Ir para item/i }),
    ).toHaveLength(3);
    fireEvent.keyDown(carousel, { key: 'ArrowRight' });
    expect(screen.getAllByRole('article')[0]).toHaveTextContent('EmbaleBem');
    fireEvent.click(screen.getByRole('button', { name: 'Ir para item 3 de 3' }));
    expect(screen.getAllByRole('article')[0]).toHaveTextContent('Terceiro Case');
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
    expect(screen.getAllByRole('article')[0]).toHaveTextContent('EmbaleBem');
    vi.useRealTimers();
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
