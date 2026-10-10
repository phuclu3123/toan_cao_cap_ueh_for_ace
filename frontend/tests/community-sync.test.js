import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(
  new URL('../src/services/communityService.js', import.meta.url),
  'utf8'
);
const contextSource = await readFile(
  new URL('../src/contexts/CommunityContext.jsx', import.meta.url),
  'utf8'
);
const createPostSource = await readFile(
  new URL('../src/components/community/CreatePostModal.jsx', import.meta.url),
  'utf8'
);
const sidebarSource = await readFile(
  new URL('../src/components/community/CommunitySidebar.jsx', import.meta.url),
  'utf8'
);
const profileSource = await readFile(
  new URL('../src/pages/CommunityProfilePage.jsx', import.meta.url),
  'utf8'
);
const answerCardSource = await readFile(
  new URL('../src/components/community/AnswerCard.jsx', import.meta.url),
  'utf8'
);
const detailPageSource = await readFile(
  new URL('../src/pages/CommunityDetailPage.jsx', import.meta.url),
  'utf8'
);
const leaderboardSource = await readFile(
  new URL('../src/components/community/LeaderboardModal.jsx', import.meta.url),
  'utf8'
);
const filterBarSource = await readFile(
  new URL('../src/components/community/PostFilterBar.jsx', import.meta.url),
  'utf8'
);

test('community writes use authenticated backend endpoints', () => {
  assert.match(source, /async createPost\(postData\)/);
  assert.match(source, /apiFetch\('\/api\/community\/posts'/);
  assert.match(source, /\/answers\/\$\{answerId\}\/vote/);
  assert.match(source, /\/answers\/\$\{answerId\}\/accept/);
  assert.match(source, /async votePost\(postId/);
  assert.match(source, /toggleAcceptAnswer\(postId/);
  assert.match(source, /\/api\/community\/posts\/\$\{postId\}\/save/);
  assert.match(source, /apiFetch\('\/api\/community\/reports'/);
  assert.match(source, /apiFetch\('\/api\/community\/saved'/);
});

test('answer deletion has one backend-backed implementation', () => {
  assert.equal((source.match(/async deleteAnswer\(/g) || []).length, 1);
  assert.equal((source.match(/\n\s*deleteAnswer\(/g) || []).length, 0);
  assert.match(source, /apiFetch\(`\/api\/community\/posts\/\$\{postId\}\/answers\/\$\{answerId\}`/);
});

test('production community reads do not silently replace backend data with fixtures', () => {
  assert.match(source, /VITE_ENABLE_COMMUNITY_LOCAL_FALLBACK/);
  assert.match(source, /if \(ENABLE_LOCAL_COMMUNITY_FALLBACK\)/);
  assert.doesNotMatch(source, /console\.warn\('Không thể tải diễn đàn từ backend, dùng bộ nhớ cục bộ/);
});

test('community identity and image payloads use server-compatible values', () => {
  assert.match(contextSource, /currentUser\?\.id \|\| currentUser\?\.uid/);
  assert.doesNotMatch(contextSource, /currentUser\?\.uid \|\| currentUser\?\.id/);
  assert.match(createPostSource, /maxImages=\{1\}/);
  assert.match(createPostSource, /maxFileBytes=\{1024 \* 1024\}/);
  assert.doesNotMatch(createPostSource, /let finalContent = content\.trim\(\)/);
});

test('community sidebar renders hot questions supplied by the backend feed', () => {
  assert.match(sidebarSource, /hotQuestions\.map/);
  assert.doesNotMatch(sidebarSource, /const HOT_QUESTIONS/);
});

test('community profiles and saved posts are loaded from authenticated backend data', () => {
  assert.match(source, /\/api\/community\/users\/\$\{encodeURIComponent\(userId\)\}/);
  assert.match(source, /apiFetch\('\/api\/community\/saved'/);
  assert.match(profileSource, /communityService\.fetchUserProfile\(targetId\)/);
  assert.match(profileSource, /status: 'saved'/);
  assert.doesNotMatch(profileSource, /signedInId \|\| 'user-phuc'/);
  assert.match(profileSource, /<ErrorState/);
});

test('answer actions do not expose placeholder reactions and keep detail state in sync', () => {
  assert.doesNotMatch(answerCardSource, /reactionCounts/);
  assert.match(answerCardSource, /onReport\(answer\)/);
  assert.match(detailPageSource, /const result = await communityService\.deleteAnswer/);
  assert.match(detailPageSource, /if \(result\.post\) setPost\(result\.post\)/);
});

test('community metadata comes from the backend without non-functional controls', () => {
  assert.match(contextSource, /statsResult\.value\.trendingTags/);
  assert.doesNotMatch(contextSource, /getTrendingTags\(/);
  assert.doesNotMatch(leaderboardSource, /const PERIODS/);
  assert.doesNotMatch(leaderboardSource, /setPeriod\(/);
});

test('community search is debounced before updating backend filters', () => {
  assert.match(filterBarSource, /setTimeout\(\(\) => onSearchChange\?\.\(localSearch\), 350\)/);
  assert.doesNotMatch(filterBarSource, /setLocalSearch\(e\.target\.value\);\s*onSearchChange/);
});
