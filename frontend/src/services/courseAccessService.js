import { apiFetch, readApiJson } from '../utils/apiClient';
export const COURSE_ACCESS_EVENT = 'ueh-tcc-course-access-changed';
const request = async (path, body, signal) => readApiJson(await apiFetch(`/api/course-access${path}`, {
  signal, ...(body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
}));
export const redeemCourseKey = (courseId, key) => request(`/${encodeURIComponent(courseId)}/redeem`, { key });
export const listCourseAdmin = (courseId, kind, page, search, signal) => request(`/admin/${encodeURIComponent(courseId)}?kind=${kind}&page=${page}&search=${encodeURIComponent(search)}`, undefined, signal);
export const createCourseKeys = (courseId, body) => request(`/admin/${encodeURIComponent(courseId)}/keys`, body);
export const grantCourseEmail = (courseId, body) => request(`/admin/${encodeURIComponent(courseId)}/grants`, body);
export const revokeCourseMember = (courseId, userId, reason='') => request(`/admin/${encodeURIComponent(courseId)}/members/${encodeURIComponent(userId)}/revoke`, {reason});
export const disableCourseKey = (courseId, id) => request(`/admin/${encodeURIComponent(courseId)}/keys/${encodeURIComponent(id)}/disable`, {});
export const notifyCourseAccessChanged = (courseId) => window.dispatchEvent(new CustomEvent(COURSE_ACCESS_EVENT, { detail: { courseId } }));
