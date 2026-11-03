import { useState } from 'react';

export function useCreateVoteDraft() {
  const [duration, setDuration] = useState('24 giờ');
  const [anonymous, setAnonymous] = useState(true);
  return { duration, setDuration, anonymous, setAnonymous };
}
