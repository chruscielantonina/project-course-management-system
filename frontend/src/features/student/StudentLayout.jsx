import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';

const StudentLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const currentUserRole = localStorage.getItem('userRole') || 'Student';
    const currentUserEmail = localStorage.getItem('email') || 'Brak emaila';

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const sidebarStyle = {
        width: '260px',
        backgroundColor: '#2d3436',
        color: 'white',
        height: '100vh',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
    };

    const getLinkStyle = (path) => ({
        color: '#dfe6e9',
        textDecoration: 'none',
        padding: '12px 15px',
        marginBottom: '10px',
        borderRadius: '5px',
        display: 'block',
        backgroundColor: location.pathname === path ? '#0984e3' : '#636e72',
        fontWeight: 'bold',
        transition: '0.3s'
    });

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f6fa', margin: 0, padding: 0 }}>
            <div style={sidebarStyle}>
                <h2 style={{ color: '#0984e3', marginBottom: '30px', fontSize: '22px', textAlign: 'center' }}>
                    Panel Studenta
                </h2>

                <div style={{ flexGrow: 1 }}>
                    <Link to="/student" style={getLinkStyle('/student')}>Moja Sekcja</Link>
                    <Link to="/student/enrollment" style={getLinkStyle('/student/enrollment')}>Zapisy na projekt</Link>
                </div>

                <div style={{ borderTop: '1px solid #636e72', paddingTop: '20px', marginTop: '20px' }}>
                    <p style={{ fontSize: '13px', marginBottom: '15px', color: '#b2bec3', overflowWrap: 'break-word' }}>
                        Zalogowano jako:<br/>
                        <strong style={{ color: 'white', fontSize: '14px' }}>{currentUserEmail}</strong><br/>
                        <span style={{ fontSize: '12px', color: '#0984e3' }}>{currentUserRole}</span>
                    </p>
                    <button
                        onClick={handleLogout}
                        style={{ width: '100%', padding: '10px', backgroundColor: '#d63031', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Wyloguj się
                    </button>
                </div>
            </div>

            <main style={{ flexGrow: 1, padding: '30px', overflowY: 'auto', height: '100vh', boxSizing: 'border-box' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default StudentLayout;
