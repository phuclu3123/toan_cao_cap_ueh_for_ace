// Presentation only. Authorization is always evaluated by the backend.
// Firebase placeholders can also come from phone sign-in; this is not proof of a Google identity.
export const needsGoogleEmail = user => /^firebase-[a-f0-9]{24}@users\.invalid$/i.test(user?.username || user?.email || '');
