type Props = {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
  label: string;
};

export function CarouselIndicators({
  count,
  activeIndex,
  onSelect,
  label,
}: Props) {
  return (
    <div className="carousel-indicators" aria-label={`Posição do ${label}`}>
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          className={index === activeIndex ? 'is-active' : ''}
          aria-label={`Ir para item ${index + 1} de ${count}`}
          aria-current={index === activeIndex ? 'true' : undefined}
          onClick={() => onSelect(index)}
        />
      ))}
    </div>
  );
}
