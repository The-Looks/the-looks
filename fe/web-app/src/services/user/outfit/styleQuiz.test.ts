import { expect, it } from 'vitest';
import { STYLES, STYLE_QUIZ, quizStyles } from './styleQuiz';

it('counts every picked answer and returns up to three most frequent styles', () => {
  expect(quizStyles([['minimal', 'office'], ['office'], ['minimal', 'vintage'], ['office'], []])).toEqual(['office', 'minimal', 'vintage']);
  expect(quizStyles([['sporty'], ['sporty']])).toEqual(['sporty']);
  expect(quizStyles([])).toEqual([]);
});

it('offers 12 styles and five questions with six answers that all map to them', () => {
  expect(STYLES).toHaveLength(12);
  expect(STYLE_QUIZ).toHaveLength(5);
  const known = STYLES.map((s) => s.value);
  STYLE_QUIZ.forEach((q) => {
    expect(q.answers).toHaveLength(6);
    q.answers.forEach((a) => expect(known).toContain(a.style));
  });
});
