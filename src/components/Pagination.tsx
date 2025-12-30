interface Props {
  page: number;
  onPrevious: () => void;
  onNext: () => void;
  disablePrevious?: boolean;
  disableNext?: boolean;
}

export default function Pagination({ page, onPrevious, onNext, disablePrevious, disableNext }: Props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center' }}>
      <button className="secondary" onClick={onPrevious} disabled={disablePrevious}>
        Previous
      </button>
      <span>Page {page}</span>
      <button className="secondary" onClick={onNext} disabled={disableNext}>
        Next
      </button>
    </div>
  );
}
