import { useState, useMemo } from 'react'
import './App.css'

// Taux de cotisations France 2025
const TAUX_NON_CADRE = 0.23
const TAUX_CADRE = 0.25

function App() {
    const [montant, setMontant] = useState('3000')
    const [isCadre, setIsCadre] = useState(false)
    const [mode, setMode] = useState<'brut' | 'net'>('brut')

    const resultat = useMemo(() => {
        const valeur = parseFloat(montant.replace(/\s/g, '')) || 0
        const taux = isCadre ? TAUX_CADRE : TAUX_NON_CADRE

        if (mode === 'brut') {
            // Brut -> Net
            const net = valeur * (1 - taux)
            return {
                brut: valeur,
                net: net,
                cotisations: valeur - net,
                tauxEffectif: taux * 100
            }
        } else {
            // Net -> Brut
            const brut = valeur / (1 - taux)
            return {
                brut: brut,
                net: valeur,
                cotisations: brut - valeur,
                tauxEffectif: taux * 100
            }
        }
    }, [montant, isCadre, mode])

    const formatMontant = (n: number) => {
        return n.toLocaleString('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })
    }

    return (
        <div className="app">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="brand">BrutNet</h1>
                    <p className="subtitle">Calculateur de salaire instantané</p>
                </div>
            </section>

            {/* Calculator */}
            <main className="calculator">
                {/* Mode Toggle */}
                <div className="mode-toggle">
                    <button
                        className={`mode-btn ${mode === 'brut' ? 'active' : ''}`}
                        onClick={() => setMode('brut')}
                    >
                        Brut → Net
                    </button>
                    <button
                        className={`mode-btn ${mode === 'net' ? 'active' : ''}`}
                        onClick={() => setMode('net')}
                    >
                        Net → Brut
                    </button>
                </div>

                {/* Input */}
                <div className="input-section">
                    <label className="input-label">
                        {mode === 'brut' ? 'Salaire brut mensuel' : 'Salaire net mensuel'}
                    </label>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            inputMode="numeric"
                            value={montant}
                            onChange={(e) => setMontant(e.target.value.replace(/[^0-9]/g, ''))}
                            className="salary-input"
                            placeholder="3000"
                        />
                        <span className="currency">€</span>
                    </div>
                </div>

                {/* Status Toggle */}
                <div className="status-section">
                    <span className="status-label">Statut</span>
                    <div className="status-toggle">
                        <button
                            className={`status-btn ${!isCadre ? 'active' : ''}`}
                            onClick={() => setIsCadre(false)}
                        >
                            Non-cadre
                        </button>
                        <button
                            className={`status-btn ${isCadre ? 'active' : ''}`}
                            onClick={() => setIsCadre(true)}
                        >
                            Cadre
                        </button>
                    </div>
                </div>

                {/* Results */}
                <div className="results">
                    <div className="result-row">
                        <span className="result-label">Salaire brut</span>
                        <span className="result-value">{formatMontant(resultat.brut)} €</span>
                    </div>

                    <div className="result-row highlight">
                        <span className="result-label">
                            {mode === 'brut' ? '👉 Salaire net' : '👉 Salaire brut nécessaire'}
                        </span>
                        <span className="result-value big">
                            {formatMontant(mode === 'brut' ? resultat.net : resultat.brut)} €
                        </span>
                    </div>

                    <div className="result-row muted">
                        <span className="result-label">Cotisations (~{resultat.tauxEffectif.toFixed(0)}%)</span>
                        <span className="result-value">-{formatMontant(resultat.cotisations)} €</span>
                    </div>

                    <div className="divider" />

                    <div className="result-row annual">
                        <span className="result-label">Net annuel</span>
                        <span className="result-value">{formatMontant(resultat.net * 12)} €</span>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-amounts">
                    {[1500, 2000, 2500, 3000, 3500, 4000, 5000].map(amount => (
                        <button
                            key={amount}
                            className={`quick-btn ${montant === String(amount) ? 'active' : ''}`}
                            onClick={() => setMontant(String(amount))}
                        >
                            {amount}€
                        </button>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="footer">
                <p>Estimation basée sur les taux moyens France 2025</p>
                <p className="copyright">© BrutNet</p>
                <div className="signature">
                    <p className="signature-content">
                        <span>Made with</span>
                        <span className="heart">❤️</span>
                        <span>by <strong>Hamza DJOUDI</strong></span>
                    </p>
                    <a href="https://djoudi.dev" target="_blank" rel="noopener" className="signature-link">
                        djoudi.dev
                    </a>
                </div>
            </footer>
        </div>
    )
}

export default App
