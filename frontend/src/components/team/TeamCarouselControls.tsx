export function TeamCarouselControls({
  onPrevious,
  onNext,
}: {
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="team-controls">
      <button type="button" onClick={onPrevious} aria-label="Integrante anterior">
        ←
      </button>
      <button type="button" onClick={onNext} aria-label="Próximo integrante">
        →
      </button>
    </div>
  );
}
