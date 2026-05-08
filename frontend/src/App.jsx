import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginView from './features/auth/LoginView';
import TeacherLayout from './features/teacher/TeacherLayout';
import TeacherDashboard from './features/teacher/TeacherDashboard';
import SubjectsView from './features/teacher/SubjectsView';
import SectionsView from './features/teacher/SectionsView';
import ProjectsView from './features/teacher/ProjectsView';


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
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
  );
}

export default App;