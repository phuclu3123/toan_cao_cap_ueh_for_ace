const nativeVideo = (url, preview = false) => Object.freeze({
  type: 'video',
  preview,
  media: Object.freeze({
    provider: 'native',
    url
  })
});

const youtubeVideo = (videoId, preview = false) => Object.freeze({
  type: 'video',
  preview,
  media: Object.freeze({
    provider: 'youtube',
    videoId
  })
});

const textLesson = (content, preview = false) => Object.freeze({
  type: 'text',
  preview,
  content
});

// Playback sources belong exclusively to the backend. The browser receives a
// source only after this catalog and, for non-preview lessons, Enrollment have
// both been checked.
const courseContentCatalog = Object.freeze({
  'tu-hoc-toan-cao-cap': Object.freeze({
    'les-1-1': nativeVideo(
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      true
    ),
    'les-1-2': nativeVideo(
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      true
    ),
    'les-1-3': textLesson(
      'Bộ tài liệu đính kèm gồm: Sổ tay công thức Toán Cao Cấp, File PDF 100 Câu hỏi trắc nghiệm tự luyện, Slide tóm tắt bài giảng.'
    ),
    'les-2-1': nativeVideo(
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      true
    ),
    'les-2-2': nativeVideo(
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4',
      true
    ),
    'les-3-1': nativeVideo(
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
    ),
    'les-3-2': nativeVideo(
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
    ),
    'les-3-3': nativeVideo(
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnTheLoose.mp4'
    ),
    'les-3-4': nativeVideo(
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    ),
    'les-4-1': nativeVideo(
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      true
    ),
    'les-4-2': nativeVideo(
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4'
    ),
    'les-4-3': nativeVideo(
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    )
  }),
  'lop-tu-hoc-sql': Object.freeze({
    // The first SQL lesson remains a public sample. Activating the free course
    // creates Enrollment before the rest of the curriculum can be requested.
    'sql-1-1': nativeVideo(
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      true
    ),
    'sql-1-2': nativeVideo(
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
    ),
    'sql-1-3': nativeVideo(
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
    )
  }),
  'thuc-chien-k46-k50': Object.freeze({
    'k46-1-1': nativeVideo(
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4',
      true
    ),
    'k46-1-2': youtubeVideo('78djtj2N9QI'),
    'k50-1-1': youtubeVideo('WDSHTnrv8JI', true)
  }),
  'thuc-chien-k51': Object.freeze({
    'k51-1-1': nativeVideo(
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      true
    ),
    'k51-1-2': nativeVideo(
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnTheLoose.mp4'
    )
  })
});

export const findCourseLessonContent = (courseId, lessonId) => (
  courseContentCatalog[courseId]?.[lessonId] || null
);

