import Enrollment from '../models/Enrollment.js';
import { isOwnerIdentifier } from '../utils/roles.js';
import { listCourseOfferings } from '../config/courseCatalog.js';

const normalizeEnrollment = (enrollment) => ({
  courseId: enrollment.courseId,
  status: enrollment.status,
  source: enrollment.source,
  paymentOrderCode: enrollment.paymentOrderCode || null,
  grantedAt: enrollment.grantedAt,
  updatedAt: enrollment.updatedAt
});

export const grantEnrollment = async ({
  userId,
  username,
  courseId,
  source,
  paymentOrderCode = null,
  mongoSession = null
}) => {
  const now = new Date();

  const query = Enrollment.findOneAndUpdate(
    { userId, courseId },
    {
      $set: {
        username,
        status: 'ACTIVE',
        source,
        paymentOrderCode,
        grantedAt: now,
        revokedAt: null
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  if (mongoSession) query.session(mongoSession);
  const enrollment = await query.lean();
  return normalizeEnrollment(enrollment);
};

export const listActiveEnrollments = async (user) => {
  if (user.role === 'Admin' && isOwnerIdentifier(user.username)) {
    const allCourses = listCourseOfferings();
    return allCourses.map(course => ({
      courseId: course.id,
      status: 'ACTIVE',
      source: 'ADMIN',
      paymentOrderCode: null,
      grantedAt: new Date(),
      updatedAt: new Date()
    }));
  }

  const enrollments = await Enrollment.find({
    userId: user.id,
    status: 'ACTIVE'
  }).sort({ grantedAt: -1 }).lean();
  return enrollments.map(normalizeEnrollment);
};

export const getCourseAccess = async (user, courseId) => {
  if (user.role === 'Admin' && isOwnerIdentifier(user.username)) {
    return { allowed: true, reason: 'OWNER' };
  }

  const enrollment = await Enrollment.findOne({
    userId: user.id,
    courseId,
    status: 'ACTIVE'
  }).lean();

  return enrollment
    ? { allowed: true, reason: 'ENROLLED', enrollment: normalizeEnrollment(enrollment) }
    : { allowed: false, reason: 'NOT_ENROLLED' };
};
