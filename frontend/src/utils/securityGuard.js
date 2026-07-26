// Anti-Piracy Security Guard Utility for UEH TCC

export const isAdminAccount = () => {
  try {
    const savedUserStr = localStorage.getItem('ueh_tcc_user');
    if (savedUserStr) {
      const user = JSON.parse(savedUserStr);
      if (
        user &&
        ((user.username && user.username.toLowerCase() === 'luphuc321@gmail.com') ||
          (user.email && user.email.toLowerCase() === 'luphuc321@gmail.com'))
      ) {
        return true;
      }
    }
  } catch (e) {}
  return false;
};

export const getStudentIdentifier = () => {
  try {
    const savedUserStr = localStorage.getItem('ueh_tcc_user');
    if (savedUserStr) {
      const user = JSON.parse(savedUserStr);
      if (user) {
        const idStr = user.email || user.username || user.phone || 'Sinh viên UEH';
        return `${idStr} • UEH TCC`;
      }
    }
  } catch (e) {}
  return 'Guest • UEH TCC';
};

// Check if account is locked due to security violation
export const isAccountLocked = () => {
  if (isAdminAccount()) return false;
  try {
    const savedUserStr = localStorage.getItem('ueh_tcc_user');
    if (savedUserStr) {
      const user = JSON.parse(savedUserStr);
      const userKey = user.email || user.username || user.id;
      if (userKey) {
        return localStorage.getItem(`acc_locked_violation_${userKey}`) === 'true';
      }
    }
  } catch (e) {}
  return false;
};

export const lockAccountDueToViolation = () => {
  if (isAdminAccount()) return;
  try {
    const savedUserStr = localStorage.getItem('ueh_tcc_user');
    if (savedUserStr) {
      const user = JSON.parse(savedUserStr);
      const userKey = user.email || user.username || user.id;
      if (userKey) {
        localStorage.setItem(`acc_locked_violation_${userKey}`, 'true');
      }
    }
  } catch (e) {}
};

export const unlockAccountByAdmin = (userKey) => {
  if (!userKey) return;
  try {
    localStorage.removeItem(`acc_locked_violation_${userKey}`);
  } catch (e) {}
};
