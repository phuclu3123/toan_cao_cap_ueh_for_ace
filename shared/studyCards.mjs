export function textbookCards(topicId, sections) {
  return sections.flatMap(section => [
    ...(section.recalls || []).slice(1).map((recall, i) => ({ id: `${topicId}-${section.id}-recall-extra-${i + 1}`, sectionId: section.id, type: 'concept', ...recall, conditions: section.conditions })),
    { id: `${topicId}-${section.id}-recall`, sectionId: section.id, type: section.definition.includes('$$') ? 'formula' : 'concept', ...section.recall, conditions: section.conditions, keyTakeaway: section.trap.right },
    { id: `${topicId}-${section.id}-error`, sectionId: section.id, type: 'trap', front: `Phân tích lập luận sau: ${section.trap.wrong}`, back: `${section.trap.right}\n\n${section.trap.explanation}`, keyTakeaway: section.recall.back },
    { id: `${topicId}-${section.id}-application`, sectionId: section.id, type: 'quick-calc', front: section.workedExample.question, back: section.workedExample.steps.map((step, i) => `${i + 1}. ${step}`).join('\n\n'), conditions: section.conditions, keyTakeaway: section.workedExample.casioTip },
  ]);
}
