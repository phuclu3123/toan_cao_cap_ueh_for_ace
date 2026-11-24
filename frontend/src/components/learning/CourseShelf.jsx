import { Link } from 'react-router-dom';

export default function CourseShelf({ courses }) {
  return <div className="course-shelf" aria-label="Xem các khóa học">
    <div className="course-shelf-axis" aria-hidden="true" />
    {courses.slice(0, 4).map((course, index) => <Link to={`/course/${course.id}`} key={course.id} className="course-shelf-note" style={{ '--note-index': index }}>
      <img src={course.image} alt="" /><span>{course.title}<span aria-hidden="true">↗</span></span>
    </Link>)}
  </div>;
}
