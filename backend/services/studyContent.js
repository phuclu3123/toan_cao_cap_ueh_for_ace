import { readFile } from 'node:fs/promises';
import mongoose from 'mongoose';
import StudyTopic from '../models/StudyTopic.js';
import { textbookCards } from '../../shared/studyCards.mjs';
import { normalizeStudyMath } from '../../shared/studyMath.mjs';

const fail = message => { throw Object.assign(new Error(message), { status: 422 }); };
const object = value => { if (!value || typeof value !== 'object' || Array.isArray(value)) fail('Nội dung phải là một đối tượng hợp lệ.'); };
const text = (value, name, max = 30000) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max) fail(`Nội dung không hợp lệ: ${name}.`);
  return value;
};
const strings = (value, name, max = 40) => {
  if (!Array.isArray(value) || !value.length || value.length > max) fail(`Danh sách không hợp lệ: ${name}.`);
  return value.map(v => text(v, name));
};
const pickText = (value, fields, name) => { object(value); return Object.fromEntries(fields.map(key => [key, text(value[key], `${name}.${key}`)])); };
const id = value => { if (typeof value !== 'string' || !/^[a-z0-9-]{1,100}$/.test(value)) fail('Mã nội dung không hợp lệ.'); return value; };
const unique = (items, name) => { if (new Set(items).size !== items.length) fail(`Trùng mã ${name}.`); };

// Reconstruct an allowlisted payload. Never store request operators or trust derived cards.
export function validateStudyContent(input, current) {
  if (!input || Buffer.byteLength(JSON.stringify(input)) > 700000) fail('Học liệu tối đa 700 KB mỗi chương.');
  input = normalizeStudyMath(input);
  if (input.id !== current.id) fail('Không được đổi mã chương.');
  const scenes = new Set(current.lesson.sections.map(s => s.scene).filter(Boolean));
  const lesson = input.lesson;
  if (!Array.isArray(lesson?.sections) || !lesson.sections.length || lesson.sections.length > 100) fail('Mỗi chương cần 1–100 mục.');
  const sections = lesson.sections.map(s => {
    object(s);
    const result = { id: id(s.id), ...pickText(s, ['title','conditions','definition','content'], 'section'),
      references: strings(s.references, 'references'),
      recall: pickText(s.recall, ['front','back'], 'recall'),
      trap: pickText(s.trap, ['title','wrong','right','explanation'], 'trap'),
      workedExample: { ...pickText(s.workedExample, ['question','casioTip'], 'workedExample'), steps: strings(s.workedExample?.steps, 'steps') },
    };
    if (s.recalls !== undefined) {
      if (!Array.isArray(s.recalls) || !s.recalls.length || s.recalls.length > 30) fail('Danh sách thẻ gợi nhớ không hợp lệ.');
      result.recalls = s.recalls.map(r => pickText(r, ['front','back'], 'recalls'));
      result.recall = result.recalls[0];
    }
    if (s.group !== undefined) { if (s.group !== 'applications') fail('Nhóm mục không hợp lệ.'); result.group = s.group; }
    if (s.scene) { if (!scenes.has(s.scene)) fail('Minh họa chưa được hỗ trợ trong chương này.'); result.scene = s.scene; }
    return result;
  });
  unique(sections.map(s => s.id), 'mục');
  if (!Array.isArray(input.quiz) || input.quiz.length > 200) fail('Danh sách tự kiểm tra không hợp lệ.');
  const sectionIds = new Set(sections.map(s => s.id));
  const quiz = input.quiz.map(q => {
    object(q);
    if (!sectionIds.has(q.sectionId) || !Array.isArray(q.options) || q.options.length !== 4 || !Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) fail('Câu tự kiểm tra không hợp lệ.');
    const options = strings(q.options, 'options', 4); unique(options, 'lựa chọn');
    return { id: id(q.id), sectionId: q.sectionId, ...pickText(q, ['question','explanation'], 'quiz'), options, correctIndex: q.correctIndex };
  });
  unique(quiz.map(q => q.id), 'câu hỏi');
  return { ...current, ...pickText(input, ['title','shortTitle'], 'topic'),
    references: strings(input.references, 'references'),
    lesson: { summary: text(lesson.summary, 'summary'), objectives: strings(lesson.objectives, 'objectives'), references: strings(input.references, 'references'), sections, traps: sections.map(s => s.trap), workedExample: sections[0].workedExample },
    quiz, flashcards: textbookCards(current.id, sections),
  };
}

export const requireStudyDatabase = () => {
  if (mongoose.connection.readyState !== 1) throw Object.assign(new Error('Kho học liệu tạm thời chưa kết nối. Vui lòng thử lại sau.'), { status: 503 });
};
export const topicMetadata = doc => {
  const { id, order, title, shortTitle, category } = doc.content;
  return { id, order, title, shortTitle, category, version: doc.version, sections: doc.content.lesson.sections.length, cards: doc.content.flashcards.length };
};
export const publicStudyTopic = doc => ({ topic: doc.content, version: doc.version, updatedAt: doc.updatedAt });

export async function seedStudyContent({ model = StudyTopic, ensureDatabase = requireStudyDatabase } = {}) {
  ensureDatabase();
  const topics = JSON.parse(await readFile(new URL('../data/flashcard-topics.json', import.meta.url), 'utf8'));
  // Global buffering is disabled; create indexes only after the connection exists.
  await model.collection.createIndex({ id: 1 }, { unique: true });
  let inserted = 0;
  for (const topic of topics) {
    validateStudyContent(topic, topic);
    const result = await model.updateOne({ id: topic.id }, { $setOnInsert: { id: topic.id, content: topic, version: 1, revisions: [] } }, { upsert: true, timestamps: false });
    inserted += result.upsertedCount;
  }
  console.log(`[Flashcards] Added ${inserted} missing chapters; existing chapters preserved.`);
  return inserted;
}

export async function saveStudyContent(topicId, version, input, actor, { model = StudyTopic, ensureDatabase = requireStudyDatabase } = {}) {
  ensureDatabase();
  const previous = await model.findOne({ id: topicId }).lean();
  if (!previous) throw Object.assign(new Error('Không tìm thấy chương.'), { status: 404 });
  if (!Number.isSafeInteger(version) || version < 1) fail('Thiếu phiên bản học liệu hợp lệ.');
  const content = validateStudyContent(input, previous.content);
  const updated = await model.findOneAndUpdate({ id: topicId, version }, {
    $set: { content, updatedBy: actor }, $inc: { version: 1 },
    $push: { revisions: { $each: [{ version: previous.version, content: previous.content, updatedAt: previous.updatedAt, updatedBy: previous.updatedBy }], $slice: -5 } },
  }, { returnDocument: 'after' }).lean();
  if (!updated) throw Object.assign(new Error('Chương đã được sửa ở nơi khác. Tải lại trước khi lưu tiếp.'), { status: 409 });
  return publicStudyTopic(updated);
}
