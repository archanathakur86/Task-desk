import { useEffect, useState } from 'react';

export default function SearchInput({ value, onSearch, placeholder }) {
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (text === value) return undefined;
    const timer = setTimeout(() => onSearch(text.trim()), 350);
    return () => clearTimeout(timer);
  }, [text]);

  return (
    <input
      type="search"
      className="input"
      value={text}
      placeholder={placeholder}
      aria-label={placeholder}
      onChange={(event) => setText(event.target.value)}
    />
  );
}
