export const DAY = 86_400_000;
export const EMPTY_STUDY = { cards: [], reviews: {}, starred: [], quizzes: [] };

// Fisher–Yates keeps every permutation possible without changing source order.
export function shuffleCards(cards, random = Math.random) {
  const copy = [...cards];
  for (let index = copy.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

// A transparent interval schedule for this UI prototype, not a claim of mastery.
export function scheduleReview(previous, rating, now = Date.now()) {
  if (!['again', 'hard', 'good'].includes(rating)) throw new Error('Invalid review rating');
  const interval = rating === 'again' ? 60_000 : rating === 'hard' ? 10 * 60_000 : Math.min(30 * DAY, Math.max(DAY, (previous?.interval || 0) * 2));
  return { rating, interval, dueAt: now + interval, reviewedAt: now, count: (previous?.count || 0) + 1 };
}
export function isDue(review, now = Date.now()) { return !review || review.dueAt <= now; }
export function scoreQuiz(questions, answers) {
  const answered = questions.filter(question => Number.isInteger(answers[question.id]));
  const correct = answered.filter(question => answers[question.id] === question.correctIndex).length;
  return { total: questions.length, answered: answered.length, correct, incorrect: answered.length - correct };
}
export function validatePersonalCard(card, topicIds) {
  if (!card || typeof card !== 'object' || !topicIds.includes(card.topicId)) return null;
  const fields = ['front', 'back', 'conditions', 'source'];
  if (fields.some(key => card[key] !== undefined && typeof card[key] !== 'string')) return null;
  if (!card.front?.trim() || !card.back?.trim() || card.front.length > 2000 || card.back.length > 6000 || (card.conditions?.length || 0) > 2000 || (card.source?.length || 0) > 500) return null;
  return { id: typeof card.id === 'string' && /^personal-[a-zA-Z0-9-]{1,80}$/.test(card.id) ? card.id : `personal-${crypto.randomUUID()}`, topicId: card.topicId, type: ['concept', 'formula', 'trap', 'quick-calc'].includes(card.type) ? card.type : 'concept', front: card.front.trim(), back: card.back.trim(), conditions: card.conditions?.trim() || '', source: card.source?.trim() || '', personal: true };
}
export function parseStudy(value, topicIds) {
  if (!value || typeof value !== 'object') return { ...EMPTY_STUDY };
  const reviews = {};
  if (value.reviews && typeof value.reviews === 'object') Object.entries(value.reviews).slice(0, 5000).forEach(([id, review]) => {
    if (id !== '__proto__' && ['again', 'hard', 'good'].includes(review?.rating) && Number.isFinite(review.dueAt) && Number.isFinite(review.interval) && Number.isFinite(review.reviewedAt) && Number.isInteger(review.count) && review.count > 0) reviews[id] = review;
  });
  const unique = new Map();
  (Array.isArray(value.cards) ? value.cards : []).slice(0, 500).forEach(card => {
    const valid = validatePersonalCard(card, topicIds);
    if (valid) unique.set(valid.id, valid);
  });
  return { cards: [...unique.values()], reviews, starred: Array.isArray(value.starred) ? [...new Set(value.starred.filter(id => typeof id === 'string'))].slice(0, 5000) : [], quizzes: Array.isArray(value.quizzes) ? value.quizzes.filter(item => topicIds.includes(item?.topicId) && Number.isInteger(item.total) && item.total > 0 && Number.isInteger(item.correct) && item.correct >= 0 && item.correct <= item.total && Number.isFinite(item.at)).slice(-50) : [] };
}
