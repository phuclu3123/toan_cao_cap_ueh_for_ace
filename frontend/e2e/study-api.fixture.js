import { studyTopics } from '../src/data/studyCurriculum.js';
export async function mockStudyContent(surface) {
  await surface.route('**/api/flashcards/topics', route => route.fulfill({ json: { success: true, topics: studyTopics.map(({ id, order, shortTitle, title, category }) => ({ id, order, shortTitle, title, category, version: 1 })) } }));
  await surface.route('**/api/flashcards/topics/*', route => {
    const topic = studyTopics.find(t => t.id === new URL(route.request().url()).pathname.split('/').at(-1));
    return route.fulfill({ status: topic ? 200 : 404, json: { success: Boolean(topic), topic, version: 1 } });
  });
}
