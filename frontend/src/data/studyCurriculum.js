import { flashcardTopics } from './flashcardsData.js';
import { algebraFoundations } from './foundationAlgebra.js';
import { calculusFoundations } from './foundationCalculus.js';
import { optimizationFoundations } from './foundationOptimization.js';
import { completeAlgebraFoundation } from './foundationAlgebraComplements.js';

import { buildTextbook, textbookCards } from './studyTextbook.js';
import { studyQuestions } from './studyQuestions.js';
import { reviewedAlgebra } from './reviewedAlgebra.js';
import { reviewedSystems } from './reviewedSystems.js';
import { reviewedInputOutput } from './reviewedInputOutput.js';
import { reviewedDifferentialEquations } from './reviewedDifferentialEquations.js';
import { reviewCalculus } from './reviewedCalculus.js';
import { completeCurriculum } from './curriculumCompletion.js';
import { normalizeStudyMath } from '../../../shared/studyMath.mjs';

const titles = { 6: 'Đại lượng biên & Co giãn', 7: 'Hàm nhiều biến & Vi phân', 8: 'Cực trị một và hai biến' };
const rewritten = { 'chuyen-de-2': reviewedAlgebra, 'chuyen-de-3': reviewedSystems, 'chuyen-de-4': reviewedInputOutput, 'chuyen-de-10': reviewedDifferentialEquations };
export const studyTopics = flashcardTopics.map(topic => {
  const base = algebraFoundations[topic.id] || calculusFoundations[topic.id] || optimizationFoundations[topic.id];
  const chapter = Number(topic.id.split('-').at(-1));
  const authored = rewritten[topic.id] || reviewCalculus(chapter, buildTextbook(topic.id, completeAlgebraFoundation(topic.id, base)));
  const foundation = { ...authored, sections: authored.sections.map(section => ({ ...section, references: section.references || authored.references })) };
  const completed = normalizeStudyMath(completeCurriculum({
    ...topic,
    title: titles[chapter] || topic.shortTitle,
    shortTitle: titles[chapter] || topic.shortTitle,
    draft: false,
    references: foundation.references,
    lesson: { ...foundation, traps: foundation.sections.map(section => section.trap), workedExample: foundation.sections[0].workedExample },
    flashcards: textbookCards(topic.id, foundation.sections),
    quiz: studyQuestions[chapter].map((question, index) => ({ ...question, id: `${topic.id}-check-${index + 1}` })),
  }));
  return { ...completed, flashcards: textbookCards(topic.id, completed.lesson.sections), lesson: { ...completed.lesson, traps: completed.lesson.sections.map(s => s.trap), workedExample: completed.lesson.sections[0].workedExample } };
});
export const studyTopicIds = studyTopics.map(topic => topic.id);
