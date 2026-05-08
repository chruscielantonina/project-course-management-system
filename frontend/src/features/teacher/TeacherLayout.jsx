import { Link, Outlet, useNavigate } from 'react-router-dom';

const TeacherLayout = () => {
    const navigate = useNavigate();
    const currentUserRole = localStorage.getItem('userRole') || 'Nauczyciel';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
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

    const linkStyle = {
        color: '#dfe6e9',
        textDecoration: 'none',
        padding: '12px 15px',
        marginBottom: '10px',
        borderRadius: '5px',
        display: 'block',
        backgroundColor: '#636e72',
        fontWeight: 'bold',
        transition: '0.3s'
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f6fa', margin: 0, padding: 0 }}>
            <div style={sidebarStyle}>
                <h2 style={{ color: '#00b894', marginBottom: '30px', fontSize: '22px', textAlign: 'center' }}>
                    System Zarządzania
                </h2>
                <div style={{ flexGrow: 1 }}>
                    <Link to="/dashboard" style={linkStyle}>Panel Główny</Link>
                    <Link to="/tematy" style={linkStyle}>Tematy Projektów</Link>
                    <Link to="/sekcje" style={linkStyle}>Sekcje Projektowe</Link>
                    <Link to="/projekty" style={linkStyle}>Nadesłane Wersje</Link>
                </div>

                <div style={{ borderTop: '1px solid #636e72', paddingTop: '20px', marginTop: '20px' }}>
                    <p style={{ fontSize: '13px', marginBottom: '15px', color: '#b2bec3' }}>
                        Zalogowano jako:<br/>
                        <strong style={{ color: 'white', fontSize: '15px' }}>{currentUserRole}</strong>
                    </p>
                    <button
                        onClick={handleLogout}
                        style={{ width: '100%', padding: '10px', backgroundColor: '#d63031', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Wyloguj się
                    </button>
                </div>
            </div>

            <div style={{ flexGrow: 1, padding: '30px', overflowY: 'auto', height: '100vh', boxSizing: 'border-box' }}>
                <Outlet />
            </div>

        </div>
    );
};

export default TeacherLayout;