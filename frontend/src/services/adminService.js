/**
 * Owner / administrator recognition for the community area.
 *
 * The site owner is credited with the maximum reputation score and the full
 * badge set everywhere their identity appears (leaderboard, profile, post
 * bylines), so ranking widgets never treat the owner as an ordinary member.
 */

import { SPECIALTY_BADGES } from './reputationService';

export const ADMIN_EMAILS = ['luphuc321@gmail.com'];

/** Seed member ids that belong to the owner account. */
export const ADMIN_MEMBER_IDS = ['user-phuc'];

export const ADMIN_NAMES = ['lữ võ hoàng phúc'];

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

  const id = norm(identity.id || identity.uid);
  if (id && ADMIN_MEMBER_IDS.includes(id)) return true;

  const email = norm(identity.email);
  if (email && ADMIN_EMAILS.includes(email)) return true;

  const name = norm(identity.name || identity.displayName);
  if (name && ADMIN_NAMES.includes(name)) return true;

  return false;
}

/**
 * Return a copy of the member record with owner privileges applied.
 * Non-owners are returned untouched.
 */
export function applyAdminIdentity(member) {
  if (!member || !isAdminIdentity(member)) return member;

  return {
    ...member,
    isAdmin: true,
    isInstructor: true,
    points: ADMIN_POINTS
  };
}

/** Every specialty badge id — the owner holds the complete set. */
export function getAdminBadgeIds() {
  return SPECIALTY_BADGES.map((badge) => badge.id);
}
