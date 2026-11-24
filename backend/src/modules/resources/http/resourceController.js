import { getResources as list, createResource as create, incrementResourceView as view } from '../application/resourceService.js';
const send = (res, result) => res.status(result.statusCode).json(result.body);
export const getResources = async (_req, res) => send(res, await list());
export const createResource = async (req, res) => send(res, await create({ body: req.body, user: req.authUser }));
export const incrementResourceView = async (req, res) => send(res, await view({ id: req.params.id }));
