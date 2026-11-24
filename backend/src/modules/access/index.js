// Public capability API. Other modules import this entry, never HTTP controllers.
export { initializeFlashcardAccess } from './application/flashcardAccess.js';
export { initializeCourseAccess } from './application/courseAccessService.js';
export { getCourseAccess, grantEnrollment, listActiveEnrollments, repairMissingPaidEnrollment, countActiveCourseMembers } from './application/enrollmentService.js';
export { requireFlashcardAccess } from './http/requireFlashcardAccess.js';
