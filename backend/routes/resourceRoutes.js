import express from 'express';
import { getResources, createResource } from '../controllers/resourceController.js';

const router = express.Router();

router.get('/resources', getResources);
router.post('/resources', createResource);

export default router;
