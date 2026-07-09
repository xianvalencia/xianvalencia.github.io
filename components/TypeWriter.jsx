'use client';

// Interactive typing effect for the hero — cycles through phrases.
import { useEffect, useState } from 'react';

const PHRASES = [
  'git push && go run',
  'while(alive) { code(); run(); ride(); }',
  'pace: 5:35/km · cadence: 90rpm',
  'deploying miles and watts to production',
];

export default function TypeWriter() {
  const [text, setText] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = PHRASES[phraseIdx];
    let delay = deleting ? 35 : 70;
    if (!deleting && text === phrase) delay = 1800;

    const timer = setTimeout(() => {
      if (!deleting && text === phrase) {
        setDeleting(true);
      } else if (deleting && text === '') {
        setDeleting(false);
        setPhraseIdx((i) => (i + 1) % PHRASES.length);
      } else {
        setText(phrase.slice(0, text.length + (deleting ? -1 : 1)));
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [text, deleting, phraseIdx]);

  return (
    <span className="typed">
      $ {text}
      <span className="cursor" aria-hidden="true" />
    </span>
  );
}
