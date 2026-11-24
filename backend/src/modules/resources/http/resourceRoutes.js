import express from 'express';
import { getResources, createResource, incrementResourceView } from './resourceController.js';
import { requireAuth } from '../../identity/index.js';

const router = express.Router();

router.get('/resources', getResources);
router.post('/resources', requireAuth, createResource);
router.post('/resources/view/:id', incrementResourceView);

export default router;
