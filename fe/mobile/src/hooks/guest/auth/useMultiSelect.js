import { useState } from 'react';

export function useMultiSelect(initial, limit = Number.POSITIVE_INFINITY) {
  const [selected, setSelected] = useState(initial);
  const toggle = (value) => setSelected((previous) => (
    previous.includes(value)
      ? previous.filter((item) => item !== value)
      : previous.length < limit ? [...previous, value] : previous
  ));
  return [selected, toggle];
}
