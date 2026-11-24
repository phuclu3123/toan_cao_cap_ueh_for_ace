import express from 'express';
import StudyTopic from '../persistence/StudyTopic.js';
import { requireAuth } from '../../identity/index.js';
import { requireFlashcardAccess } from '../../access/index.js';
import { hasOwnerRole } from '../../identity/index.js';
import { requireStudyDatabase, topicMetadata, publicStudyTopic, saveStudyContent } from '../application/studyContent.js';

export function createStudyContentRouter({ authenticate = requireAuth, authorize = requireFlashcardAccess, model = StudyTopic, ensureDatabase = requireStudyDatabase, save = saveStudyContent } = {}) {
  const router = express.Router();
  router.use('/flashcards', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  const handle = fn => async (req, res, next) => { try { await fn(req, res); } catch (error) { next(error); } };
  router.get('/flashcards/topics', authenticate, authorize, handle(async (_req, res) => {
    ensureDatabase();
    const docs = await model.find().select('version content.id content.order content.title content.shortTitle content.category content.lesson.sections.id content.flashcards.id').lean();
    res.json({ success: true, topics: docs.map(topicMetadata).sort((a, b) => a.order - b.order) });
  }));
  router.get('/flashcards/topics/:id', authenticate, authorize, handle(async (req, res) => {
    ensureDatabase();
    const doc = await model.findOne({ id: req.params.id }).select('content version updatedAt').lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Không tìm thấy chương.' });
    res.json({ success: true, ...publicStudyTopic(doc) });
  }));
  router.put('/flashcards/topics/:id', authenticate, handle(async (req, res) => {
    if (!hasOwnerRole(req.authUser)) return res.status(403).json({ success: false, message: 'Chỉ chủ tài khoản quản trị được sửa học liệu.' });
    const result = await save(req.params.id, req.body.version, req.body.topic, req.authUser.username || req.authUser.email);
    res.json({ success: true, ...result });
  }));
  return router;
}
export default createStudyContentRouter();
