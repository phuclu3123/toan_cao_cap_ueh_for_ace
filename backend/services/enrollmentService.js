import path from 'path';
import Enrollment from '../models/Enrollment.js';
import { checkMongoDBConnected } from '../config/db.js';
import { dataDir, readJSONFile, writeJSONFile } from '../utils/jsonHelper.js';
import { isOwnerIdentifier } from '../utils/roles.js';
import { assertPersistentStorage } from '../utils/storagePolicy.js';

const enrollmentsFilePath = path.join(dataDir, 'enrollments.json');

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
  assertPersistentStorage();
  const now = new Date();

  if (checkMongoDBConnected()) {
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
  }

  const enrollments = readJSONFile(enrollmentsFilePath, []);
  const index = enrollments.findIndex((item) => (
    item.userId === userId && item.courseId === courseId
  ));
  const nextEnrollment = {
    userId,
    username,
    courseId,
    status: 'ACTIVE',
    source,
    paymentOrderCode,
    grantedAt: now.toISOString(),
    revokedAt: null,
    updatedAt: now.toISOString()
  };

  if (index >= 0) {
    enrollments[index] = { ...enrollments[index], ...nextEnrollment };
  } else {
    enrollments.push({ ...nextEnrollment, createdAt: now.toISOString() });
  }
  writeJSONFile(enrollmentsFilePath, enrollments);
  return normalizeEnrollment(nextEnrollment);
};

export const listActiveEnrollments = async (user) => {
  assertPersistentStorage();
  if (checkMongoDBConnected()) {
    const enrollments = await Enrollment.find({
      userId: user.id,
      status: 'ACTIVE'
    }).sort({ grantedAt: -1 }).lean();
    return enrollments.map(normalizeEnrollment);
  }

  return readJSONFile(enrollmentsFilePath, [])
    .filter((item) => item.userId === user.id && item.status === 'ACTIVE')
    .map(normalizeEnrollment);
};

export const getCourseAccess = async (user, courseId) => {
  if (user.role === 'Admin' && isOwnerIdentifier(user.username)) {
    return { allowed: true, reason: 'OWNER' };
  }

  assertPersistentStorage();
  let enrollment = null;
  if (checkMongoDBConnected()) {
    enrollment = await Enrollment.findOne({
      userId: user.id,
      courseId,
      status: 'ACTIVE'
    }).lean();
  } else {
    enrollment = readJSONFile(enrollmentsFilePath, []).find((item) => (
      item.userId === user.id
      && item.courseId === courseId
      && item.status === 'ACTIVE'
    ));
  }

  return enrollment
    ? { allowed: true, reason: 'ENROLLED', enrollment: normalizeEnrollment(enrollment) }
    : { allowed: false, reason: 'NOT_ENROLLED' };
};
