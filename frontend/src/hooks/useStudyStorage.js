import { useEffect, useState } from 'react';
import { CONSENT_EVENT, readConsent, STUDY_STORAGE_KEY } from '../utils/cookieConsent.js';
import { EMPTY_STUDY, parseStudy } from '../utils/studyModel.js';
import { studyTopicIds } from '../data/studyManifest.js';
let sessionStudy = null;
const loadStudy = () => {
  if (sessionStudy) return sessionStudy;
  if (readConsent()?.preferences) {
    try { return parseStudy(JSON.parse(localStorage.getItem(STUDY_STORAGE_KEY)), studyTopicIds); } catch { /* Empty session when storage is unavailable. */ }
  }
  return { ...EMPTY_STUDY };
};
export default function useStudyStorage() {
  const [study, setStudy] = useState(loadStudy);
  const [allowStorage, setAllowStorage] = useState(() => Boolean(readConsent()?.preferences));
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    const handleConsent = event => setAllowStorage(Boolean(event.detail.preferences));
    window.addEventListener(CONSENT_EVENT, handleConsent);
    return () => window.removeEventListener(CONSENT_EVENT, handleConsent);
  }, []);
  useEffect(() => {
    sessionStudy = study;
    if (!allowStorage) return;
    try { localStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(study)); }
    catch {
      // This state reports a failure in the external storage API, not derived UI state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStorageError(true);
    }
  }, [study, allowStorage]);
  return { study, setStudy, savedOnDevice: allowStorage && !storageError, storageError };
}
