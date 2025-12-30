interface Props {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ placeholder = 'Search…', value, onChange }: Props) {
  return (
    <input
      type="search"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      style={{ maxWidth: '320px' }}
    />
  );
}
