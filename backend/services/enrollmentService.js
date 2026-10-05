import mongoose from 'mongoose';
import Enrollment from '../models/Enrollment.js';
import { isOwnerIdentifier } from '../utils/roles.js';
import { getCourseOffering, listCourseOfferings } from '../config/courseCatalog.js';

const ENROLLMENT_SOURCES = new Set(['PAYOS', 'FREE', 'ADMIN']);

const enrollmentStorageError = (cause = null) => {
  const error = new Error('Enrollment storage is unavailable');
  error.statusCode = 503;
  error.code = 'ENROLLMENT_STORE_UNAVAILABLE';
  if (cause) error.cause = cause;
  return error;
};

const requireEnrollmentDatabase = () => {
  if (mongoose.connection.readyState !== 1) throw enrollmentStorageError();
};

const isDatabaseAvailabilityError = (error) => (
  mongoose.connection.readyState !== 1
  || /^(?:MongoNetwork|MongoServerSelection|MongoTopologyClosed|MongooseServerSelection)/.test(error?.name || '')
);

const runEnrollmentQuery = async (work) => {
  requireEnrollmentDatabase();
  try {
    return await work();
  } catch (error) {
    if (isDatabaseAvailabilityError(error)) throw enrollmentStorageError(error);
    throw error;
  }
};

const normalizeEnrollment = (enrollment) => ({
  courseId: enrollment.courseId,
  status: enrollment.status,
  source: enrollment.source,
  paymentOrderCode: enrollment.paymentOrderCode || null,
  grantedAt: enrollment.grantedAt,
  updatedAt: enrollment.updatedAt
});

export const getPaidEnrollmentRepairAction = (enrollment) => {
  if (!enrollment) return 'CREATE';
  return enrollment.status === 'ACTIVE' ? 'KEEP_ACTIVE' : 'KEEP_REVOKED';
};

const findEnrollment = async ({ userId, courseId, mongoSession = null }) => {
  let query = Enrollment.findOne({ userId, courseId });
  if (mongoSession) query = query.session(mongoSession);
  return query.lean();
};

export const grantEnrollment = async ({
  userId,
  username,
  courseId,
  source,
  paymentOrderCode = null,
  mongoSession = null
}) => {
  if (!userId || !username) {
    throw new TypeError('A stable user identity is required to grant course access');
  }
  if (!getCourseOffering(courseId)) {
    throw new TypeError('Cannot grant access to an unknown course');
  }
  if (!ENROLLMENT_SOURCES.has(source)) {
    throw new TypeError('Invalid enrollment source');
  }
  if (source === 'PAYOS' && !Number.isSafeInteger(paymentOrderCode)) {
    throw new TypeError('A valid payment order code is required for paid enrollment');
  }

  const now = new Date();

  return runEnrollmentQuery(async () => {
    const query = Enrollment.findOneAndUpdate(
      { userId, courseId },
      {
        $set: {
          username: username.trim().toLowerCase(),
          status: 'ACTIVE',
          source,
          paymentOrderCode,
          revokedAt: null
        },
        $setOnInsert: { grantedAt: now }
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    if (mongoSession) query.session(mongoSession);
    const enrollment = await query.lean();
    return normalizeEnrollment(enrollment);
  });
};

// Repairs only genuinely missing enrollment rows. A deliberate REVOKED row is
// an authorization decision and must never be changed by a read/status call or
// by a duplicate webhook for an already-paid order.
export const repairMissingPaidEnrollment = async ({
  userId,
  username,
  courseId,
  paymentOrderCode,
  mongoSession = null
}) => runEnrollmentQuery(async () => {
  const existing = await findEnrollment({ userId, courseId, mongoSession });
  const action = getPaidEnrollmentRepairAction(existing);
  if (action === 'KEEP_REVOKED') return null;
  if (action === 'KEEP_ACTIVE') return normalizeEnrollment(existing);

  try {
    return await grantEnrollment({
      userId,
      username,
      courseId,
      source: 'PAYOS',
      paymentOrderCode,
      mongoSession
    });
  } catch (error) {
    if (error?.code !== 11000) throw error;
    const racedEnrollment = await findEnrollment({ userId, courseId, mongoSession });
    return racedEnrollment?.status === 'ACTIVE'
      ? normalizeEnrollment(racedEnrollment)
      : null;
  }
});

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

  return runEnrollmentQuery(async () => {
    const enrollments = await Enrollment.find({
      userId: user.id,
      status: 'ACTIVE'
    }).sort({ grantedAt: -1 }).lean();
    return enrollments.map(normalizeEnrollment);
  });
};

export const getCourseAccess = async (user, courseId) => {
  if (user.role === 'Admin' && isOwnerIdentifier(user.username)) {
    return { allowed: true, reason: 'OWNER' };
  }

  return runEnrollmentQuery(async () => {
    const enrollment = await Enrollment.findOne({
      userId: user.id,
      courseId,
      status: 'ACTIVE'
    }).lean();

    return enrollment
      ? { allowed: true, reason: 'ENROLLED', enrollment: normalizeEnrollment(enrollment) }
      : { allowed: false, reason: 'NOT_ENROLLED' };
  });
};
