import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { coursesData } from '../src/data/coursesData.js';

const root = fileURLToPath(new URL('../src/', import.meta.url));
const readSource = (path) => readFileSync(join(root, path), 'utf8');

const listSourceFiles = (directory = root) => {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory()
      ? listSourceFiles(path)
      : [path];
  });
};

test('course access is not granted from localStorage', () => {
  const source = listSourceFiles()
    .filter((path) => /\.(?:js|jsx)$/.test(path))
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');

  assert.doesNotMatch(source, /ueh_tcc_enrolled_courses/);
});

test('checkout uses a server-priced idempotent PayOS order', () => {
  const checkout = readSource('components/modals/CourseEnrollmentModal.jsx');

  assert.match(checkout, /apiFetch\('\/api\/orders'/);
  assert.match(checkout, /'Idempotency-Key': idempotencyKeyRef\.current/);
  assert.match(checkout, /courseId: course\.id/);
  assert.doesNotMatch(checkout, /orderCode:\s*(?:newOrderCode|Math\.)/);
  assert.doesNotMatch(checkout, /amount:\s*(?:finalPrice|listedPrice)/);
  assert.match(checkout, /payment\.entitlement\?\.allowed/);
});

test('authenticated API calls always include the session cookie', () => {
  const apiClient = readSource('utils/apiClient.js');
  const config = readSource('config.js');

  assert.match(apiClient, /credentials:\s*'include'/);
  assert.match(config, /window\.location\.hostname === 'toancaocapueh\.id\.vn'/);
  assert.match(config, /API_BASE_URL = isCanonicalProductionHost \? '' : configuredApiBaseUrl/);
});

test('premium playback sources and paid text are redacted from the frontend catalog', () => {
  const catalog = readSource('data/coursesData.js');
  const courseDetail = readSource('pages/CourseDetail.jsx');
  const globalPlayer = readSource('components/GlobalPlayer.jsx');
  const playerContext = readSource('contexts/GlobalPlayerContext.jsx');

  assert.doesNotMatch(catalog, /videoUrl|commondatastorage|youtu\.be|78djtj2N9QI|WDSHTnrv8JI/);
  assert.doesNotMatch(catalog, /Bộ tài liệu đính kèm gồm/);
  assert.match(courseDetail, /\/api\/courses\/\$\{encodeURIComponent\(course\.id\)\}\/lessons\//);
  assert.match(globalPlayer, /activeLesson\.media\?\.provider === 'youtube'/);
  assert.doesNotMatch(globalPlayer, /activeLesson\.videoUrl/);
  assert.doesNotMatch(playerContext, /nextLesson\.videoUrl/);
});

test('free SQL enrollment is required after the public sample lesson', () => {
  const sqlCourse = coursesData.find((course) => course.id === 'lop-tu-hoc-sql');
  const lessons = sqlCourse.chapters.flatMap((chapter) => chapter.lessons);

  assert.equal(lessons.find((lesson) => lesson.id === 'sql-1-1').isLocked, false);
  assert.equal(lessons.find((lesson) => lesson.id === 'sql-1-2').isLocked, true);
  assert.equal(lessons.find((lesson) => lesson.id === 'sql-1-3').isLocked, true);
});

test('Firebase sync sends a verified ID token and has no fabricated users', () => {
  const app = readSource('App.jsx');
  const navbar = readSource('components/Navbar.jsx');
  const authService = readSource('services/authService.js');
  const authModal = readSource('components/modals/AuthModal.jsx');
  const oauthService = readSource('services/oauthService.js');
  const firebase = readSource('firebase.js');

  assert.match(navbar, /syncFirebaseUserWithBackend/);
  assert.match(navbar, /onIdTokenChanged/);
  assert.match(navbar, /signInWithRedirect\(auth, googleProvider\)/);
  assert.match(navbar, /await ensureGoogleOAuthAvailable\(\)/);
  assert.ok(
    navbar.indexOf('await ensureGoogleOAuthAvailable()')
      < navbar.indexOf('await signInWithRedirect(auth, googleProvider)')
  );
  assert.match(navbar, /pendingRedirectProvider/);
  assert.match(navbar, /sessionStorage\.removeItem\(FIREBASE_REDIRECT_PROVIDER_KEY\)/);
  assert.match(navbar, /setAuthError\(`Lỗi đăng nhập \$\{entry\.provider\}/);
  assert.match(navbar, /beginGithubOAuth/);
  assert.match(app, /GoogleOAuthProvider clientId=\{googleOneTapClientId\}/);
  assert.match(app, /import\.meta\.env\.VITE_GOOGLE_CLIENT_ID/);
  assert.doesNotMatch(app, /\.apps\.googleusercontent\.com/);
  assert.match(navbar, /useGoogleOneTapLogin/);
  assert.match(navbar, /GoogleAuthProvider\.credential\(response\.credential\)/);
  assert.match(navbar, /signInWithCredential\(auth, credential\)/);
  assert.match(navbar, /completeFirebaseSession\(userCredential\.user/);
  assert.doesNotMatch(navbar, /signInWithPopup|response_type=token/);
  assert.doesNotMatch(navbar, /if \(sessionReady && isFirebaseConfigured/);
  assert.doesNotMatch(authModal, /signInWithPopup|githubProvider/);
  assert.doesNotMatch(authModal, /response\.json\(/);
  assert.match(authModal, /await ensureGoogleOAuthAvailable\(\)/);
  assert.ok(
    authModal.indexOf('await ensureGoogleOAuthAvailable()')
      < authModal.indexOf('await signInWithRedirect(auth, googleProvider)')
  );
  assert.match(authModal, /otpCode: forgotOtp\.trim\(\)/);
  assert.doesNotMatch(authModal, /\botp:\s*forgotOtp/);
  assert.match(authModal, /disabled=\{providerLoading\}/);
  assert.match(navbar, /isAuthenticating=\{isAuthenticating\}/);
  assert.match(oauthService, /apiFetch\('\/api\/auth\/providers', \{ signal \}\)/);
  assert.match(oauthService, /AbortSignal\.timeout\(60_000\)/);
  assert.match(oauthService, /providers\.google\?\.enabled/);
  assert.match(firebase, /window\.location\.hostname === ["']toancaocapueh\.id\.vn["']/);
  assert.match(firebase, /\? ["']toancaocapueh\.id\.vn["']\s*:\s*viteEnv\.VITE_FIREBASE_AUTH_DOMAIN/);
  assert.match(oauthService, /sessionStorage\.setItem\(GITHUB_OAUTH_STATE_KEY, state\)/);
  assert.match(oauthService, /url\.searchParams\.set\('prompt', 'select_account'\)/);
  assert.match(oauthService, /window\.open\(/);
  assert.match(oauthService, /popup\.location\.replace\(url\.toString\(\)\)/);
  assert.match(navbar, /GITHUB_OAUTH_RESULT_MESSAGE/);
  assert.match(navbar, /window\.opener\.postMessage\(/);
  assert.match(navbar, /githubPopupPollTimerRef/);
  assert.match(authService, /firebaseUser\.getIdToken\(\)/);
  assert.match(authService, /JSON\.stringify\(\{ idToken \}\)/);
  assert.doesNotMatch(navbar, /google-user-|github-user-|mockFirebaseUser/);
  assert.doesNotMatch(authService, /google-user-|github-user-|mockFirebaseUser/);
});

test('PayOS raw VietQR payloads are rendered locally and polling refreshes the order', () => {
  const checkout = readSource('components/modals/CourseEnrollmentModal.jsx');

  assert.match(checkout, /QRCode\.toDataURL\(rawQrPayload/);
  assert.match(checkout, /setOrder\(\(current\) => \(\{ \.\.\.\(current \|\| \{\}\), \.\.\.payment \}\)\)/);
  assert.doesNotMatch(checkout, /api\.qrserver\.com/);
});

test('premium player content is cleared whenever the authenticated session changes', () => {
  const playerContext = readSource('contexts/GlobalPlayerContext.jsx');

  assert.match(playerContext, /ueh-tcc-session-changed/);
  assert.match(playerContext, /activeLesson:\s*null/);
  assert.match(playerContext, /nextLessonRequestIdRef\.current \+= 1/);
});
