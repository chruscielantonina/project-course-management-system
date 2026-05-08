import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const LoginView = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                email: email,
                password: password
            });
            console.log("Pełna odpowiedź z backendu:", response.data);
            const token = response.data.token;
            const userRole = response.data.role || response.data.accountType || '';

            localStorage.setItem('token', token);
            localStorage.setItem('userRole', userRole);


            if (userRole.toUpperCase().includes('TEACHER')) {
                navigate('/dashboard');
            } else if (userRole.toUpperCase().includes('STUDENT')) {
                navigate('/stundetPlaceHolder');  //dodać ścieżke do ekranu studenta!!
            } else if (userRole.toUpperCase().includes('ADMIN')) {
                navigate('/AdminstundetPlaceHolder');   //dodać ścieżkę do ekranu admina!!
            } else {
                alert(`UWAGA: Nie rozpoznano roli! Otrzymana rola to: ${userRole}`);
                navigate('/dashboard');
            }

        } catch (err) {
            console.error("Błąd logowania:", err);
            setError("Nieprawidłowy email lub hasło. Spróbuj ponownie.");
        }
    };
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f2f6' }}>
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '350px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#2d3436' }}>Logowanie</h2>

                {error && <div style={{ color: 'white', backgroundColor: '#e74c3c', padding: '10px', borderRadius: '4px', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#636e72' }}>Adres e-mail:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9' }}
                            placeholder="np. jankowalski@polsl.pl"
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#636e72' }}>Hasło:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #dfe6e9' }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        style={{ marginTop: '10px', padding: '12px', backgroundColor: '#0984e3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                    >
                        Zaloguj się
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginView;