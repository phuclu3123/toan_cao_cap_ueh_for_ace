import { writeFile, mkdir } from 'node:fs/promises';
import { studyTopics } from '../src/data/studyCurriculum.js';
await mkdir(new URL('../../backend/data/', import.meta.url), { recursive: true });
await writeFile(new URL('../../backend/data/flashcard-topics.json', import.meta.url), JSON.stringify(studyTopics, null, 2) + '\n');
const metadata = studyTopics.map(({ id, order, title, shortTitle, category }) => ({ id, order, title, shortTitle, category }));
await writeFile(new URL('../src/data/studyManifest.js', import.meta.url), `// Generated metadata only. Published learning content is loaded from MongoDB.\nexport const studyTopics = ${JSON.stringify(metadata, null, 2)};\nexport const studyTopicIds = studyTopics.map(t => t.id);\n`);
console.log(`Exported ${studyTopics.length} flashcard chapters.`);
