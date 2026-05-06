import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import SubjectsView from './features/teacher/SubjectsView';
// Zaimportuj resztę swoich widoków:
// import SectionsView from './features/teacher/SectionsView';
// import AttendanceView from './features/teacher/AttendanceView';
// import GradesView from './features/teacher/GradesView';
// import ProjectsView from './features/teacher/ProjectsView';

function App() {
  return (
      <Router>
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>

          {/* Pasek boczny */}
          <nav style={{ width: '260px', backgroundColor: '#1e272e', color: 'white', padding: '20px' }}>
            <h2 style={{ color: '#00d8d6', borderBottom: '1px solid #485460', paddingBottom: '20px', marginBottom: '20px' }}>
              Panel Prowadzącego
            </h2>
            <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <li><Link to="/teacher/tematy" style={{ color: '#d2dae2', textDecoration: 'none' }}>Tematy Projektów</Link></li>
              <li><Link to="/teacher/sekcje" style={{ color: '#d2dae2', textDecoration: 'none' }}>Sekcje projektowe</Link></li>
              <li><Link to="/teacher/obecnosc" style={{ color: '#d2dae2', textDecoration: 'none' }}>Obecność</Link></li>
              <li><Link to="/teacher/oceny" style={{ color: '#d2dae2', textDecoration: 'none' }}>Oceny</Link></li>
              <li><Link to="/teacher/projekty" style={{ color: '#d2dae2', textDecoration: 'none' }}>Projekty</Link></li>
            </ul>
          </nav>

          {/* Dynamiczna treść */}
          <main style={{ flex: 1, padding: '40px', backgroundColor: '#f1f2f6', color: '#2f3640' }}>
            <Routes>
              {/* Odpowiada ścieżkom z Link to="..." */}
              <Route path="/teacher/tematy" element={<SubjectsView />} />
              {/* <Route path="/teacher/sekcje" element={<SectionsView />} /> */}
              {/* <Route path="/teacher/obecnosc" element={<AttendanceView />} /> */}
              {/* <Route path="/teacher/oceny" element={<GradesView />} /> */}
              {/* <Route path="/teacher/projekty" element={<ProjectsView />} /> */}

              <Route path="*" element={<Navigate to="/teacher/tematy" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
  );
}

export default App;