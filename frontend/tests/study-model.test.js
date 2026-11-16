import test from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
import { DAY, isDue, parseStudy, scheduleReview, scoreQuiz, shuffleCards, validatePersonalCard } from '../src/utils/studyModel.js';
import { cobbDouglas, marginalCost, solveLeontief, transpose } from '../src/utils/mathExplorers.js';
import { studyTopics, studyTopicIds } from '../src/data/studyCurriculum.js';

test('Review intervals reflect the selected rating and cap long intervals', () => {
  assert.equal(scheduleReview(null, 'again', 100).dueAt, 60100);
  assert.equal(scheduleReview(null, 'hard', 100).interval, 600000);
  assert.equal(scheduleReview(null, 'good', 100).interval, DAY);
  assert.equal(scheduleReview({ interval: 20 * DAY, count: 6 }, 'good', 100).interval, 30 * DAY);
  assert.equal(scheduleReview({ interval: 20 * DAY, count: 6 }, 'again', 100).interval, 60000);
  assert.equal(isDue({ dueAt: 100 }, 100), true);
  assert.equal(isDue({ dueAt: 101 }, 100), false);
});
test('Shuffle retains membership, changes order and never mutates the source', () => {
  const original = ['a', 'b', 'c', 'd'];
  const shuffled = shuffleCards(original, () => 0);
  assert.notDeepEqual(shuffled, original);
  assert.deepEqual([...shuffled].sort(), original);
  assert.deepEqual(original, ['a', 'b', 'c', 'd']);
});
test('Quiz scores count unanswered items separately', () => {
  assert.deepEqual(scoreQuiz([{ id: 'a', correctIndex: 0 }, { id: 'b', correctIndex: 1 }, { id: 'c', correctIndex: 3 }], { a: 0, b: 2 }), { total: 3, answered: 2, correct: 1, incorrect: 1 });
});
test('Card imports reject invalid topics, data types and excess size', () => {
  const valid = { topicId: studyTopicIds[0], front: 'Question', back: 'Answer' };
  assert.ok(validatePersonalCard(valid, studyTopicIds).personal);
  assert.equal(validatePersonalCard({ ...valid, topicId: 'foreign' }, studyTopicIds), null);
  assert.equal(validatePersonalCard({ ...valid, front: {} }, studyTopicIds), null);
  assert.equal(validatePersonalCard({ ...valid, back: 'x'.repeat(6001) }, studyTopicIds), null);
  assert.equal(parseStudy({ cards: [valid, { front: null }], reviews: { a: { rating: 'fake', dueAt: 20 } }, quizzes: [{ topicId: studyTopicIds[0], total: 1, correct: 9, at: 100 }] }, studyTopicIds).cards.length, 1);
  assert.deepEqual(parseStudy({ reviews: { a: { rating: 'fake', dueAt: 20 } } }, studyTopicIds).reviews, {});
});
test('Leontief outputs balance every row and transactions scale by receiving column', () => {
  const a = [[.2, .1], [.3, .2]], d = [80, 60];
  const result = solveLeontief(a, d);
  result.output.forEach((value, i) => assert.ok(Math.abs(value - result.transactions[i].reduce((sum, v) => sum + v, 0) - d[i]) < 1e-9));
  assert.equal(result.transactions[0][1], .1 * result.output[1]);
  const raised = solveLeontief(a, [160, 60]);
  assert.ok(raised.output[0] > result.output[0] && raised.output[1] > result.output[1]);
  assert.equal(solveLeontief([[1, 0], [0, 1]], d), null);
});
test('Marginal illustration separates differential estimate from actual change', () => {
  const result = marginalCost(40, 10);
  assert.ok(Math.abs(result.marginal - 3.6) < 1e-10);
  assert.ok(Math.abs(result.approximate - 36) < 1e-10);
  assert.ok(Math.abs(result.actual - 38) < 1e-10);
  assert.ok(Math.abs(cobbDouglas(25, 25).output - 250) < 1e-10);
  assert.equal(cobbDouglas(50, 50).output, 500);
});
test('Rectangular transposition swaps axes and is an involution', () => {
  const a = [[1, 2, 3], [4, 5, 6]];
  assert.deepEqual(transpose(a), [[1, 4], [2, 5], [3, 6]]);
  assert.deepEqual(transpose(transpose(a)), a);
});
test('Every edited theory section has a related card; math renders strictly', () => {
  const topic = studyTopics[0];
  topic.lesson.sections.forEach(section => assert.ok(topic.flashcards.some(card => card.sectionId === section.id), section.id));
  const visit = value => {
    if (typeof value === 'string') {
      for (const match of value.matchAll(/\$\$([\s\S]*?)\$\$|\$([^$\n]+)\$/g)) katex.renderToString(match[1] ?? match[2], { displayMode: match[1] !== undefined, throwOnError: true, trust: false, strict: 'error' });
    } else if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === 'object') Object.values(value).forEach(visit);
  };
  studyTopics.forEach(visit);
  assert.equal(studyTopics.flatMap(item => item.flashcards).some(card => card.id === 'fc-10-4'), false);
});
