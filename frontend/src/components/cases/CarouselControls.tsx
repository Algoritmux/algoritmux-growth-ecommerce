type Props = {
  onPrevious: () => void;
  onNext: () => void;
  label: string;
};

export function CarouselControls({ onPrevious, onNext, label }: Props) {
  return (
    <div className="carousel-controls">
      <button type="button" onClick={onPrevious} aria-label={`Anterior: ${label}`}>
        ←
      </button>
      <button type="button" onClick={onNext} aria-label={`Próximo: ${label}`}>
        →
      </button>
    </div>
  );
}
