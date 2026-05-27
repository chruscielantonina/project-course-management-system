import { useState, useEffect } from 'react';
import { getSections, getMySection, signUpForSection, signOutFromSection, changeSection } from '../../api/studentApi';

const StudentEnrollment = () => {
    const [sections, setSections] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentStudentSectionId, setCurrentStudentSectionId] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch all available sections for enrollment
            const sectionsRes = await getSections();
            setSections(sectionsRes.data);

            // Separately, check if the student is already in a section
            try {
                const mySectionRes = await getMySection();
                if (mySectionRes.data) {
                    setCurrentStudentSectionId(mySectionRes.data.sectionId);
                } else {
                    setCurrentStudentSectionId(null);
                }
            } catch (err) {
                // A 404 error is expected if not enrolled, so we can safely ignore it
                if (err.response && err.response.status === 404) {
                    setCurrentStudentSectionId(null);
                } else {
                    throw err; // Re-throw other errors
                }
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
                fetchData();
            } catch (err) {
                alert(`Błąd podczas zapisu do sekcji. Sprawdź konsolę, aby uzyskać więcej informacji.`);
                console.error(err);
            }
        }
    };

    const handleSignOut = async (sectionId) => {
        if (window.confirm('Czy na pewno chcesz wypisać się z tej sekcji?')) {
            try {
                await signOutFromSection(sectionId);
                alert('Wypisano z sekcji.');
                fetchData();
            } catch (err) {
                alert(`Błąd podczas wypisywania z sekcji. Sprawdź konsolę, aby uzyskać więcej informacji.`);
                console.error(err);
            }
        }
    };

    const handleChangeSection = async (newSectionId) => {
        if (window.confirm('Czy na pewno chcesz przenieść się do tej sekcji?')) {
            try {
                await changeSection(currentStudentSectionId, newSectionId);
                alert('Przeniesiono do nowej sekcji!');
                fetchData();
            } catch (err) {
                alert(`Błąd podczas zmiany sekcji. Sprawdź konsolę, aby uzyskać więcej informacji.`);
                console.error(err);
            }
        }
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

    const renderActionButtons = (section) => {
        const isEnrolled = currentStudentSectionId === section.sectionId;
        const isFull = section.currentOccupancy >= section.maxCapacity;
        const isEnrolledInAnySection = currentStudentSectionId !== null;

        if (isEnrolled) {
            return <button onClick={() => handleSignOut(section.sectionId)} style={buttonStyle('red')}>Wypisz się</button>;
        } else if (isFull) {
            return <button style={buttonStyle('disabled')} disabled>Pełna</button>;
        } else if (isEnrolledInAnySection) {
            return <button onClick={() => handleChangeSection(section.sectionId)} style={buttonStyle('orange')}>Przenieś się</button>;
        } else {
            return <button onClick={() => handleSignUp(section.sectionId)} style={buttonStyle('green')}>Zapisz się</button>;
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
