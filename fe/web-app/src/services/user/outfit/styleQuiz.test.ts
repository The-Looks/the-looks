import { expect, it } from 'vitest';
import { STYLE_QUIZ, quizStyles } from './styleQuiz';

it('picks the two styles answered most often', () => {
  expect(quizStyles(['minimal', 'office', 'minimal', 'office', 'feminine'])).toEqual(['minimal', 'office']);
  expect(quizStyles(['sporty', 'sporty', 'sporty', undefined, 'vintage'])).toEqual(['sporty', 'vintage']);
  expect(quizStyles([])).toEqual([]);
});

it('has five questions and every answer maps to a known style', () => {
  const known = ['feminine', 'sporty', 'minimal', 'streetwear', 'vintage', 'office'];
  expect(STYLE_QUIZ).toHaveLength(5);
  STYLE_QUIZ.forEach((q) => q.answers.forEach((a) => expect(known).toContain(a.style)));
});
