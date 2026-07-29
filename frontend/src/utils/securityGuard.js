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
  } catch {
    // Invalid local session data is treated as a non-admin account.
  }
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
  } catch {
    // Invalid local session data falls back to the guest watermark.
  }
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
  } catch {
    // Invalid local session data is treated as unlocked here.
  }
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
  } catch {
    // Storage may be unavailable in privacy-restricted browsers.
  }
};

export const unlockAccountByAdmin = (userKey) => {
  if (!userKey) return;
  try {
    localStorage.removeItem(`acc_locked_violation_${userKey}`);
  } catch {
    // Storage may be unavailable in privacy-restricted browsers.
  }
};
