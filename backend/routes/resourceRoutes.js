import express from 'express';
import { getResources, createResource, incrementResourceView } from '../controllers/resourceController.js';

const router = express.Router();

router.get('/resources', getResources);
router.post('/resources', createResource);
router.post('/resources/view/:id', incrementResourceView);

export default router;
