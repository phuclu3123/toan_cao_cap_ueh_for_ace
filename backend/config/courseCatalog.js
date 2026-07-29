const courseCatalog = Object.freeze({
  'tu-hoc-toan-cao-cap': Object.freeze({
    id: 'tu-hoc-toan-cao-cap',
    title: 'Tự học Toán Cao Cấp',
    amount: 349000,
    descriptionCode: 'TCC SELFSTUDY'
  }),
  'lop-tu-hoc-sql': Object.freeze({
    id: 'lop-tu-hoc-sql',
    title: 'Lớp tự học SQL',
    amount: 0,
    descriptionCode: 'TCC SQL'
  }),
  'thuc-chien-k46-k50': Object.freeze({
    id: 'thuc-chien-k46-k50',
    title: 'Thực chiến đề thi K46 - K50',
    amount: 4100000,
    descriptionCode: 'TCC K46K50'
  }),
  'thuc-chien-k51': Object.freeze({
    id: 'thuc-chien-k51',
    title: 'Thực chiến đề thi K51',
    amount: 3900000,
    descriptionCode: 'TCC K51'
  })
});

export const getCourseOffering = (courseId) => courseCatalog[courseId] || null;

export const listCourseOfferings = () => Object.values(courseCatalog);

