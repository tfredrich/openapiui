interface Props {
  title: string;
  ready: boolean;
  onOpenSetup: () => void;
  onOpenToken?: () => void;
  tokenEnabled?: boolean;
}

export default function TopBar({ title, ready, onOpenSetup, onOpenToken, tokenEnabled }: Props) {
  return (
    <div className="top-bar">
      <div className="top-bar-heading">
        <h1>{title}</h1>
        <span className="badge" style={{ background: ready ? '#dcfce7' : '#fee2e2', color: ready ? '#166534' : '#991b1b' }}>
          {ready ? 'Ready' : 'Setup Required'}
        </span>
      </div>
      <div className="top-bar-actions">
        {tokenEnabled && onOpenToken && (
          <button className="icon-button primary" onClick={onOpenToken}>
            Token
          </button>
        )}
        <button className="icon-button" onClick={onOpenSetup} aria-label="Open setup">
          <span className="gear-icon" aria-hidden="true">
            ⚙️
          </span>
          <span>Setup</span>
        </button>
      </div>
    </div>
  );
}
