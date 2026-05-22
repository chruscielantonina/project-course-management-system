import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginView from './features/auth/LoginView';
import TeacherLayout from './features/teacher/TeacherLayout';
import TeacherDashboard from './features/teacher/TeacherDashboard';
import SubjectsView from './features/teacher/SubjectsView';
import SectionsView from './features/teacher/SectionsView';
import ProjectsView from './features/teacher/ProjectsView';
import AdminLayout from './features/admin/AdminLayout';
import AdminDashboard from './features/admin/AdminDashboard';
import SemestersView from './features/admin/SemestersView';
import StudentLayout from './features/student/StudentLayout';
import StudentDashboard from './features/student/StudentDashboard';
import StudentEnrollment from './features/student/StudentEnrollment';

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<LoginView />} />
          <Route element={<TeacherLayout />}>
            <Route path="/dashboard" element={<TeacherDashboard />} />
            <Route path="/tematy" element={<SubjectsView />} />
            <Route path="/sekcje" element={<SectionsView />} />
            <Route path="/projekty" element={<ProjectsView />} />
          </Route>
            <Route path="/student" element={<StudentLayout />}>
                <Route index element={<StudentDashboard />} /> {/* Domyślny widok: /student */}
                <Route path="zapisy" element={<StudentEnrollment />} /> {/* Widok: /student/zapisy */}
            </Route>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/semestry" element={<SemestersView />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
  );
}

export default App;