import { apiFetch, readApiJson } from '../utils/apiClient.js';
export const loadStudyTopics = async signal => readApiJson(await apiFetch('/api/flashcards/topics', { signal }));
export const loadStudyTopic = async (id, signal) => readApiJson(await apiFetch(`/api/flashcards/topics/${encodeURIComponent(id)}`, { signal }));
export const saveStudyTopic = async (topic, version) => readApiJson(await apiFetch(`/api/flashcards/topics/${encodeURIComponent(topic.id)}`, {
  method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, version }),
}));
