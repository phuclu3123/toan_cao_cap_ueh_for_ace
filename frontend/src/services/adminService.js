/**
 * Owner / administrator recognition for the community area.
 *
 * The site owner is credited with the maximum reputation score and the full
 * badge set everywhere their identity appears (leaderboard, profile, post
 * bylines), so ranking widgets never treat the owner as an ordinary member.
 */

import { SPECIALTY_BADGES } from './reputationService';

export const ADMIN_EMAILS = [
  'luphuc321@gmail.com',
  'luphuc519@gmail.com',
  'luphuc08092006@gmail.com'
];

/** Seed member ids that belong to the owner account. */
export const ADMIN_MEMBER_IDS = [
  'user-phuc',
  'user-phuc-admin',
  'user-phuc-519',
  'user-phuc-0809'
];

export const ADMIN_NAMES = [
  'lữ võ hoàng phúc',
  'hoàng phúc',
  'lu vo hoang phuc',
  'phuc lu',
  'phúc lữ'
];

/** Maximum reputation score — always ranks first. */
export const ADMIN_POINTS = 9999;

export const ADMIN_LABEL = 'Quản trị viên UEH TCC';

const norm = (value) => String(value || '').trim().toLowerCase();

/**
 * True when the given identity (member record, auth user, or post author)
 * belongs to the site owner.
 */
export function isAdminIdentity(identity) {
  if (!identity) return false;

  if (identity.role === 'Admin' || identity.isAdmin === true) return true;

  const id = norm(identity.id || identity.uid);
  if (id && ADMIN_MEMBER_IDS.includes(id)) return true;

  return false;
}

/**
 * Return a copy of the member record with owner privileges applied.
 * Non-owners are returned untouched.
 */
export function applyAdminIdentity(member) {
  if (!member || !isAdminIdentity(member)) return member;

  const savedAvatar = member.avatar === '/images/tccvang.jpg' ? '' : member.avatar;

  return {
    ...member,
    isAdmin: true,
    isInstructor: true,
    avatar: savedAvatar || '',
    points: member.points || ADMIN_POINTS
  };
}

/** Every specialty badge id — the owner holds the complete set. */
export function getAdminBadgeIds() {
  return SPECIALTY_BADGES.map((badge) => badge.id);
}
