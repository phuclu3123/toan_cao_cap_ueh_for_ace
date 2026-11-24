import { expect, test } from '@playwright/test';
import { Buffer } from 'node:buffer';

const student = { id: 'qa-ui-student', username: 'qa-ui@example.test', name: 'Người học Toán', role: 'Student' };
const second = { id: 'qa-ui-solver', name: 'Người chia sẻ', role: 'Student' };
const sample = (id, overrides = {}) => ({
  id, title: 'Tìm định thức của ma trận $A$ bằng biến đổi sơ cấp',
  content: '<p>Cho ma trận vuông A cấp ba. Mình đã thử biến đổi hàng nhưng chưa tìm được định thức.</p>',
  subject: 'algebra', subjectLabel: 'Đại số tuyến tính', difficulty: 'standard', tags: ['MaTran'],
  author: student, upvotes: 0, views: 2, upvotedBy: [], downvotedBy: [], answers: [],
  answersCount: 0, canManage: true, status: 'unanswered', createdAt: '2026-11-23T01:00:00Z', ...overrides
});
async function fixture(context, options = {}) {
  const state = { user: student, saved: [], posts: [sample('question-a'), sample('question-b', { title: 'Tìm cực trị hàm hai biến bằng Lagrange', tags: ['Lagrange'], content: '<p>Find the extrema using the Lagrange method.</p>', subject: 'calc2', canManage: false, author: second })], failFeed: false, failVote: false, writes: [], ...options };
  await context.addInitScript(() => localStorage.setItem('ueh_tcc_consent_v1', JSON.stringify({ version: 1, necessary: true, preferences: false })));
  await context.route('https://accounts.google.com/**', route => route.abort());
  await context.route('https://challenges.cloudflare.com/**', route => route.abort());
  await context.route('**/api/**', async route => {
    const request = route.request(), url = new URL(request.url()), path = url.pathname, method = request.method();
    const json = (data, status = 200) => route.fulfill({ status, json: { success: status < 400, ...data } });
    if (path === '/api/auth/me') return state.user ? json({ user: state.user }) : json({ message: 'Vui lòng đăng nhập.' }, 401);
    if (path === '/api/auth/providers') return json({ providers: { google: { enabled: false }, github: { enabled: false } } });
    if (path === '/api/community/stats') return json({ stats: { totalPosts: state.posts.length, openCount: state.posts.filter(p => !p.isAccepted).length, solvedCount: state.posts.filter(p => p.isAccepted).length, trendingTags: [{ tag: 'MaTran', count: 1 }, { tag: 'Lagrange', count: 1 }] } });
    if (path === '/api/community/leaderboard') return json({ leaderboard: [{ ...second, points: 10, postsCount: 1, answersCount: 1 }] });
    if (path === '/api/community/tags') {
      const tags = [{ tag: 'MaTran', count: 1 }, { tag: 'Lagrange', count: 1 }].filter(item => item.tag.toLowerCase().includes((url.searchParams.get('search') || '').toLowerCase()));
      return json({ tags, total: tags.length, totalPages: 1 });
    }
    if (path === '/api/community/saved') return json({ savedPostIds: state.saved });
    if (path === '/api/community/posts' && method === 'GET') {
      if (state.failFeed) return json({ message: 'Chưa tải được câu hỏi. Thử lại.' }, 503);
      let posts = state.posts;
      const q = url.searchParams.get('search');
      if (q) posts = posts.filter(p => (p.title + p.content).toLowerCase().includes(q.toLowerCase()));
      if (url.searchParams.get('tag')) posts = posts.filter(p => p.tags.includes(url.searchParams.get('tag')));
      if (url.searchParams.get('status') === 'saved') posts = posts.filter(p => state.saved.includes(p.id));
      if (url.searchParams.get('status') === 'solved') posts = posts.filter(p => p.isAccepted);
      if (url.searchParams.get('status') === 'unsolved') posts = posts.filter(p => !p.isAccepted);
      if (url.searchParams.get('subject') && url.searchParams.get('subject') !== 'all') posts = posts.filter(p => p.subject === url.searchParams.get('subject'));
      return json({ posts: posts.map(p => ({ ...p, content: p.content.slice(0, 900), answersCount: p.answers.length, canManage: p.author.id === state.user?.id })), total: posts.length, totalPages: 1, currentPage: 1 });
    }
    if (path === '/api/community/posts' && method === 'POST') {
      const body = request.postDataJSON(); state.writes.push(body);
      const post = sample('created-question', body); state.posts.unshift(post);
      return json({ post, persisted: true }, 201);
    }
    const match = path.match(/^\/api\/community\/posts\/([^/]+)(.*)$/);
    if (match) {
      const post = state.posts.find(p => p.id === match[1]), rest = match[2];
      if (!post) return json({ message: 'Không tìm thấy bài toán.' }, 404);
      if (!rest && method === 'GET') return json({ post: { ...post, canManage: post.author.id === state.user?.id } });
      if (!state.user) return json({ message: 'Phiên đăng nhập đã hết hạn.' }, 401);
      if (!rest && method === 'DELETE') { state.posts = state.posts.filter(p => p !== post); return json({}); }
      if (!rest && method === 'PUT') { Object.assign(post, request.postDataJSON()); return json({ post }); }
      if (rest === '/upvote') {
        if (state.failVote) return json({ message: 'Không thể bình chọn. Vui lòng thử lại.' }, 503);
        const voted = post.upvotedBy.length; post.upvotedBy = voted ? [] : [state.user.id]; post.upvotes = voted ? 0 : 1;
        return json({ ...post, post });
      }
      if (rest === '/save') { state.saved = state.saved.includes(post.id) ? state.saved.filter(id => id !== post.id) : [...state.saved, post.id]; return json({ isSaved: state.saved.includes(post.id), savedPostIds: state.saved }); }
      if (rest === '/answers') {
        const body = request.postDataJSON(); state.writes.push(body);
        const answer = { id: post.answers.length ? 'answer-' + (post.answers.length + 1) : 'answer-one', ...body, author: state.user, upvotes: 0, canManage: true, comments: [], createdAt: new Date().toISOString() };
        post.answers.push(answer); return json({ post, answer }, 201);
      }
      const answer = post.answers[0];
      if (rest.endsWith('/accept')) { answer.isAccepted = !answer.isAccepted; post.isAccepted = answer.isAccepted; return json({ post }); }
      if (rest.endsWith('/comments')) { const comment = { id: 'comment-one', content: request.postDataJSON().content, author: state.user }; answer.comments.push(comment); return json({ post, comment }, 201); }
      if (rest.endsWith('/answer-one') && method === 'PUT') { answer.content = request.postDataJSON().content; return json({ post, answer }); }
      if (rest.endsWith('/answer-one') && method === 'DELETE') { post.answers = []; return json({ post }); }
      if (rest.endsWith('/vote')) return json({ upvotes: 1, upvotedBy: [state.user.id], downvotedBy: [] });
    }
    if (path === '/api/community/reports') return json({ report: { id: 'report-one' } }, 201);
    if (path.startsWith('/api/community/users/')) return state.profileNotFound ? json({ message: 'Không tìm thấy thành viên cộng đồng.' }, 404) : json({ profile: { ...second, postsCount: 1, answersCount: 0, points: 5 }, posts: state.posts.filter(p => p.author.id === second.id) });
    return json({ data: [], posts: [], notifications: [], resources: [] });
  });
  return state;
}
async function open(page, path = '/community') {
  await page.goto(path); await expect(page.locator('#app-boot')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Hỏi đáp toán học', exact: true })).toBeVisible();
  await expect(page.locator('.se-question-item').first()).toBeVisible();
}

test('filters, real tag directory, search and URL state work together', async ({ page, context }) => {
  await fixture(context); await open(page);
  await page.getByRole('button', { name: 'Bộ lọc', exact: true }).click();
  await page.getByLabel('Chuyên mục', { exact: true }).selectOption('algebra');
  await expect(page.locator('.se-question-item')).toHaveCount(1);
  await page.getByRole('button', { name: 'Xóa bộ lọc', exact: true }).click();
  await page.getByRole('button', { name: 'Tất cả chủ đề', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Khám phá chủ đề' });
  await dialog.getByLabel('Tìm chủ đề').fill('Lagrange');
  await dialog.getByRole('button', { name: /Lagrange/ }).click();
  await expect(dialog).not.toBeVisible(); await expect(page).toHaveURL(/tag=Lagrange/);
  await expect(page.locator('.se-question-item')).toHaveCount(1);
  await page.reload(); await expect(page.locator('.se-question-item')).toHaveCount(1);
  await page.getByRole('button', { name: 'Xóa bộ lọc', exact: true }).click();
  await page.getByLabel('Tìm kiếm câu hỏi').fill('định thức');
  await expect(page.locator('.se-question-item')).toHaveCount(1);
  await page.getByLabel('Tìm kiếm câu hỏi').fill('không có kết quả xyz');
  await expect(page.locator('.se-question-item')).toHaveCount(0);
});

test('saved feed, hide/restore, and failed votes show real outcomes', async ({ page, context }) => {
  const state = await fixture(context); await open(page);
  const first = page.locator('#post-question-a');
  await first.getByRole('button', { name: 'Lưu câu hỏi', exact: true }).click();
  await expect(first.getByRole('button', { name: 'Bỏ lưu câu hỏi', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.qa-status-tabs').getByRole('button', { name: 'Đã lưu', exact: true }).click();
  await expect(page.locator('.se-question-item')).toHaveCount(1);
  await first.getByRole('button', { name: 'Bỏ lưu câu hỏi', exact: true }).click();
  await expect(page.locator('.se-question-item')).toHaveCount(0);
  await page.locator('.qa-status-tabs').getByRole('button', { name: /^Tất cả/ }).click();
  state.failVote = true;
  await first.getByRole('button', { name: 'Bình chọn câu hỏi', exact: true }).click();
  await expect(first.getByRole('alert')).toContainText('Không thể bình chọn');
  state.failVote = false;
  await first.getByRole('button', { name: 'Bình chọn câu hỏi', exact: true }).click();
  await expect(first.getByRole('button', { name: 'Bỏ bình chọn', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await first.getByRole('button', { name: 'Mở menu tùy chọn' }).click();
  await page.getByRole('menuitem', { name: 'Ẩn khỏi giao diện của tôi' }).click();
  await expect(first).toHaveCount(0);
  await page.getByRole('button', { name: 'Hiện lại', exact: true }).click();
  await expect(first).toBeVisible();
});

test('create, edit and delete question persist via API and ask for confirmation', async ({ page, context }) => {
  const state = await fixture(context); await open(page);
  await page.getByRole('button', { name: 'Đặt câu hỏi', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Soạn câu hỏi học thuật' });
  await dialog.locator('#post-title-input').fill('Tìm giới hạn của hàm phân thức');
  await dialog.locator('.docs-wysiwyg-content').fill('Mình đã thử phân tích tử số thành nhân tử nhưng chưa tìm được giới hạn.');
  await dialog.getByRole('button', { name: /Đăng|Xuất bản|Gửi câu hỏi/ }).last().click();
  await expect(page.locator('#post-created-question')).toBeVisible();
  expect(state.writes[0].title).toBe('Tìm giới hạn của hàm phân thức');
  const item = page.locator('#post-created-question');
  await item.getByRole('button', { name: 'Mở menu tùy chọn' }).click();
  await page.getByRole('menuitem', { name: 'Chỉnh sửa nội dung' }).click();
  const edit = page.getByRole('dialog', { name: 'Chỉnh sửa bài viết' });
  await edit.locator('#post-title-input').fill('Tìm giới hạn của hàm phân thức đã sửa');
  await edit.getByRole('button', { name: /Lưu|Cập nhật/ }).last().click();
  await expect(item).toContainText('đã sửa');
  await item.getByRole('button', { name: 'Mở menu tùy chọn' }).click();
  await page.getByRole('menuitem', { name: 'Xóa bài viết', exact: true }).click();
  const confirm = page.getByRole('dialog', { name: 'Xóa câu hỏi?' });
  await expect(item).toBeVisible();
  await confirm.getByRole('button', { name: 'Xóa câu hỏi', exact: true }).click();
  await expect(item).toHaveCount(0);
});

test('editing a feed excerpt loads the complete article and preserves its image', async ({ page, context }) => {
  const original = '<p>' + 'Nội dung đầy đủ của đề bài. '.repeat(65) + 'PHẦN KẾT ĐƯỢC GIỮ LẠI.</p>';
  const state = await fixture(context, { posts: [sample('long-question', { content: original, image: 'https://example.test/question.png' })] });
  await open(page);
  await page.locator('#post-long-question').getByRole('button', { name: 'Mở menu tùy chọn' }).click();
  await page.getByRole('menuitem', { name: 'Chỉnh sửa nội dung' }).click();
  const dialog = page.getByRole('dialog', { name: 'Chỉnh sửa bài viết' });
  await expect(dialog.locator('.docs-wysiwyg-content')).toContainText('PHẦN KẾT ĐƯỢC GIỮ LẠI');
  await dialog.locator('#post-title-input').fill('Đề bài dài vẫn giữ đầy đủ nội dung');
  await dialog.getByRole('button', { name: /Lưu|Cập nhật/ }).last().click();
  await expect(dialog).toHaveCount(0);
  expect(state.posts[0].content).toContain('PHẦN KẾT ĐƯỢC GIỮ LẠI');
  expect(state.posts[0].image).toBe('https://example.test/question.png');
});

test('legacy profile links resolve to the canonical member and missing profiles have a relevant error', async ({ page, context }) => {
  const state = await fixture(context);
  await page.goto('/community/user/user-phuc');
  await expect(page).toHaveURL(new RegExp('/community/user/' + second.id));
  state.profileNotFound = true;
  await page.goto('/community/user/nonexistent-member');
  await expect(page.getByRole('heading', { name: 'Không tìm thấy hồ sơ thành viên' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bài toán hoặc nội dung không tồn tại' })).toHaveCount(0);
});

test('new answer, attachment and comment use API; accepted answer updates the thread', async ({ page, context }) => {
  const state = await fixture(context); await open(page);
  await page.locator('#post-question-a .se-question-title a').click();
  const composer = page.locator('#answer-composer-section');
  await composer.locator('.docs-wysiwyg-content').fill('Ta biến đổi hàng để ma trận thành tam giác rồi lấy tích trên đường chéo.');
  await composer.locator('input[type=file]').first().setInputFiles({ name: 'solution.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aDDsAAAAASUVORK5CYII=', 'base64') });
  await composer.getByRole('button', { name: /Gửi lời giải|Đăng câu trả lời|Gửi câu trả lời/ }).click();
  await expect(page.locator('#answer-one')).toBeVisible();
  expect(state.writes[0].image).toMatch(/^data:image\/png/);
  expect(state.writes[0].content).not.toContain('data:image');
  await expect(page.locator('#answer-one .qa-answer-attachment img')).toBeVisible();
  const answer = page.locator('#answer-one');
  await answer.locator('.qa-comment-composer textarea').fill('Mình đã hiểu cách biến đổi, cảm ơn bạn.');
  await answer.locator('.qa-comment-composer button[type="submit"]').click();
  await expect(answer).toContainText('Mình đã hiểu cách biến đổi, cảm ơn bạn.');
  await answer.getByRole('button', { name: 'Chấp nhận lời giải', exact: true }).click();
  await page.getByRole('dialog', { name: 'Chấp nhận lời giải này?' }).getByRole('button', { name: /Chấp nhận/, exact: false }).click();
  await expect(answer.getByRole('button', { name: /Đã ghim chấp nhận/ })).toBeVisible();
  await answer.getByRole('button', { name: 'Trích dẫn', exact: true }).click();
  await composer.locator('.docs-wysiwyg-content').fill('Mình bổ sung cách kiểm tra kết quả bằng tính chất định thức.');
  await composer.getByRole('button', { name: /Gửi lời giải|Gửi câu trả lời/ }).click();
  expect(state.writes[1].content).toContain('<blockquote>');
});

test('answer text draft survives reload and is isolated by account', async ({ page, context }) => {
  const state = await fixture(context); await open(page);
  await page.locator('#post-question-a .se-question-title a').click();
  const editor = page.locator('#answer-composer-section .docs-wysiwyg-content');
  await editor.fill('Bản nháp lời giải cần được giữ lại trước khi gửi.');
  await page.reload(); await expect(editor).toContainText('Bản nháp lời giải cần được giữ lại');
  state.user = second;
  await page.evaluate(() => window.dispatchEvent(new Event('ueh-tcc-session-changed')));
  await expect(editor).toBeEmpty();
  state.user = student;
  await page.evaluate(() => window.dispatchEvent(new Event('ueh-tcc-session-changed')));
  await expect(editor).toContainText('Bản nháp lời giải cần được giữ lại');
});

test('changing accounts refreshes bookmarks and owner controls without trusting browser cache', async ({ page, context }) => {
  const state = await fixture(context, { saved: ['question-a'] }); await open(page);
  state.user = second; state.saved = [];
  await page.evaluate(() => window.dispatchEvent(new Event('ueh-tcc-session-changed')));
  await expect(page.locator('#post-question-a').getByRole('button', { name: 'Lưu câu hỏi', exact: true })).toBeVisible();
  await page.locator('#post-question-a').getByRole('button', { name: 'Mở menu tùy chọn' }).click();
  await expect(page.getByRole('menuitem', { name: 'Chỉnh sửa nội dung' })).toHaveCount(0);
  await expect(page.getByRole('menuitem', { name: 'Xóa bài viết', exact: true })).toHaveCount(0);
});

test('reports wait for the API and the tag dialog closes with Escape', async ({ page, context }) => {
  await fixture(context); await open(page);
  await page.getByRole('button', { name: 'Tất cả chủ đề', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Khám phá chủ đề' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Khám phá chủ đề' })).not.toBeVisible();
  await page.locator('#post-question-b').getByRole('button', { name: 'Mở menu tùy chọn' }).click();
  await page.getByRole('menuitem', { name: 'Báo cáo nội dung' }).click();
  const dialog = page.getByRole('dialog', { name: 'Báo cáo vi phạm' });
  await dialog.getByRole('button', { name: 'Gửi báo cáo', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Cảm ơn bạn đã gửi báo cáo!' })).toBeVisible();
});

test('expired session does not keep private saved data or pretend a write succeeded', async ({ page, context }) => {
  const state = await fixture(context, { saved: ['question-a'] }); await open(page);
  state.user = null;
  await page.locator('#post-question-a').getByRole('button', { name: 'Bình chọn câu hỏi', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'hết hạn' }).first()).toBeVisible();
  await expect(page.locator('.qa-status-tabs').getByRole('button', { name: 'Đã lưu', exact: true })).toBeVisible();
  await page.locator('.qa-status-tabs').getByRole('button', { name: 'Đã lưu', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('API failures provide retry rather than replacing posts with client fixtures', async ({ page, context }) => {
  const state = await fixture(context, { failFeed: true });
  await page.goto('/community'); await expect(page.locator('#app-boot')).toHaveCount(0);
  await expect(page.locator('.se-question-item')).toHaveCount(0);
  await expect(page.getByText('Chưa tải được câu hỏi. Thử lại.', { exact: true })).toBeVisible();
  state.failFeed = false; await page.getByRole('button', { name: /Thử lại/ }).first().click();
  await expect(page.locator('.se-question-item')).toHaveCount(2);
});

for (const width of [1440, 768, 390]) test(`responsive community at ${width}px`, async ({ page, context }, testInfo) => {
  await page.setViewportSize({ width, height: 960 }); await fixture(context); await open(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('community.png'), fullPage: true });
  await page.evaluate(() => document.documentElement.dataset.theme = 'dark');
  await page.screenshot({ path: testInfo.outputPath('community-dark.png'), fullPage: true });
});
