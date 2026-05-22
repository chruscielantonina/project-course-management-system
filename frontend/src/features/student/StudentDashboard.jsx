const StudentDashboard = () => {
    return (
        <div style={{ color: '#2d3436' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Moja Sekcja Projektowa</h2>

            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: '4px solid #0984e3' }}>
                {/* W przyszłości tu będzie warunek: jeśli student ma sekcję to pokazujemy dane, jeśli nie, pokazujemy komunikat */}

                <h3 style={{ marginTop: 0, color: '#0984e3', borderBottom: '1px solid #f1f2f6', paddingBottom: '10px' }}>
                    Twój obecny projekt
                </h3>

                <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '5px', border: '1px dashed #b2bec3', textAlign: 'center', color: '#636e72' }}>
                    <p>Obecnie pobieramy informacje o Twojej sekcji...</p>
                    <p style={{ fontSize: '14px' }}>Wkrótce pojawią się tu szczegóły prowadzącego, temat oraz opcja wgrywania plików.</p>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;