import { useState, useEffect } from 'react';
import { getSections, getMyAttendance, signUpForSection, signOutFromSection, changeSection } from '../../api/studentApi';

const StudentEnrollment = () => {
    const [sections, setSections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentStudentSectionId, setCurrentStudentSectionId] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch all sections
            const sectionsRes = await getSections();
            setSections(sectionsRes.data);

            // Reset current section and try to find it again
            setCurrentStudentSectionId(null);
            try {
                const attendanceRes = await getMyAttendance();
                // Check if student has any attendance, which implies being in a section
                if (attendanceRes.data.length > 0 && attendanceRes.data[0].section) {
                    setCurrentStudentSectionId(attendanceRes.data[0].section.id);
                }
            } catch (err) {
                // It's normal for this to fail (e.g., 404) if the student isn't in any section yet.
                console.warn("Could not fetch attendance, assuming student is not in a section.", err);
            }

        } catch (err) {
            setError('Nie udało się załadować danych. Spróbuj ponownie później.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSignUp = async (sectionId) => {
        if (window.confirm('Czy na pewno chcesz zapisać się do tej sekcji?')) {
            try {
                await signUpForSection(sectionId);
                alert('Zapisano do sekcji!');
                fetchData(); // Refresh data to show the new state
            } catch (err) {
                alert(`Błąd podczas zapisu do sekcji: ${err.response?.data?.message || err.message}`);
                console.error(err);
            }
        }
    };

    const handleSignOut = async (sectionId) => {
        if (window.confirm('Czy na pewno chcesz wypisać się z tej sekcji?')) {
            try {
                await signOutFromSection(sectionId);
                alert('Wypisano z sekcji.');
                fetchData(); // Refresh data
            } catch (err) {
                alert(`Błąd podczas wypisywania z sekcji: ${err.response?.data?.message || err.message}`);
                console.error(err);
            }
        }
    };

    const handleChangeSection = async (newSectionId) => {
        if (window.confirm('Czy na pewno chcesz przenieść się do tej sekcji?')) {
            try {
                await changeSection(currentStudentSectionId, newSectionId);
                alert('Przeniesiono do nowej sekcji!');
                fetchData(); // Refresh data
            } catch (err) {
                alert(`Błąd podczas zmiany sekcji: ${err.response?.data?.message || err.message}`);
                console.error(err);
            }
        }
    };

    const renderActionButtons = (section) => {
        const isEnrolled = currentStudentSectionId === section.sectionId;
        const isFull = section.currentOccupancy >= section.maxCapacity;

        if (isEnrolled) {
            return <button onClick={() => handleSignOut(section.sectionId)} style={buttonStyle('red')}>Wypisz się</button>;
        }

        // If student is enrolled in ANY section, the option should be to change
        if (currentStudentSectionId && !isFull) {
            return <button onClick={() => handleChangeSection(section.sectionId)} style={buttonStyle('orange')}>Przenieś się</button>;
        }

        if (isFull) {
            return <button style={buttonStyle('disabled')} disabled>Pełna</button>;
        }

        // Default action: sign up
        return <button onClick={() => handleSignUp(section.sectionId)} style={buttonStyle('green')}>Zapisz się</button>;
    };

    const buttonStyle = (variant) => {
        const base = {
            padding: '6px 12px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'white',
            fontWeight: '500',
        };
        switch (variant) {
            case 'red': return { ...base, backgroundColor: '#d63031' };
            case 'orange': return { ...base, backgroundColor: '#e17055' };
            case 'green': return { ...base, backgroundColor: '#00b894' };
            case 'disabled': return { ...base, backgroundColor: '#b2bec3', cursor: 'not-allowed' };
            default: return base;
        }
    };


    return (
        <div style={{ color: '#2d3436' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Zapisy na projekty</h2>

            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <p style={{ color: '#636e72', marginBottom: '20px' }}>
                    Poniżej znajdziesz listę dostępnych sekcji projektowych. Wybierz jedną z nich, aby dołączyć do grupy.
                </p>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                    <tr style={{ borderBottom: '2px solid #dfe6e9', color: '#2d3436' }}>
                        <th style={{ padding: '12px 8px' }}>Temat Projektu</th>
                        <th style={{ padding: '12px 8px' }}>Prowadzący</th>
                        <th style={{ padding: '12px 8px' }}>Zajęte miejsca</th>
                        <th style={{ padding: '12px 8px', textAlign: 'center' }}>Akcja</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan="4" style={{ padding: '12px 8px', fontWeight: '500' }}>Ładowanie tematów...</td>
                        </tr>
                    ) : (
                        sections.map((section) => (
                            <tr key={section.sectionId} style={{ borderBottom: '1px solid #dfe6e9' }}>
                                <td style={{ padding: '12px 8px', fontWeight: '500' }}>{section.topic}</td>
                                <td style={{ padding: '12px 8px', color: '#636e72' }}>{section.teacherFullName}</td>
                                <td style={{ padding: '12px 8px' }}>{`${section.currentOccupancy} / ${section.maxCapacity}`}</td>
                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                    {renderActionButtons(section)}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentEnrollment;
