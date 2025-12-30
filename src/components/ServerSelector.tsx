import { OpenAPIServer } from '../types';

interface Props {
  servers?: OpenAPIServer[];
  value?: string;
  onChange: (url: string) => void;
}

export default function ServerSelector({ servers, value, onChange }: Props) {
  if (!servers?.length) {
    return null;
  }
  return (
    <div className="panel">
      <label>Server</label>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {servers.map((server) => (
          <option key={server.url} value={server.url}>
            {server.url} {server.description ? `(${server.description})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
