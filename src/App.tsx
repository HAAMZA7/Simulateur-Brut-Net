import { useState, useMemo } from 'react'
import './App.css'

// Taux de cotisations France 2025 (moyenne estimée)
// Réalité : 22-30% selon revenus et conventions collectives
const TAUX_NON_CADRE = 0.22 // ~22% (CSG/CRDS + retraite + complémentaire)
const TAUX_CADRE = 0.25     // ~25% (cotisations supplémentaires APEC, prévoyance)

// Tranches d'imposition 2025 OFFICIELLES (revenus 2024)
// Source: impots.gouv.fr / service-public.fr
const TRANCHES_IMPOT = [
    { min: 0, max: 11497, taux: 0 },
    { min: 11497, max: 29315, taux: 0.11 },
    { min: 29315, max: 83823, taux: 0.30 },
    { min: 83823, max: 180294, taux: 0.41 },
    { min: 180294, max: Infinity, taux: 0.45 }
]

// Calcul des parts fiscales
function calculerParts(isMarried: boolean, enfants: number): number {
    let parts = isMarried ? 2 : 1
    // 2 premiers enfants = 0.5 part chacun
    // À partir du 3ème = 1 part chacun
    if (enfants >= 1) parts += 0.5
    if (enfants >= 2) parts += 0.5
    if (enfants >= 3) parts += (enfants - 2) * 1
    return parts
}

// Calcul de l'impôt sur le revenu
function calculerImpot(revenuNetImposable: number, parts: number): number {
    const quotient = revenuNetImposable / parts
    let impotParPart = 0

    for (const tranche of TRANCHES_IMPOT) {
        if (quotient > tranche.min) {
            const montantDansTranche = Math.min(quotient, tranche.max) - tranche.min
            impotParPart += montantDansTranche * tranche.taux
        }
    }

    return impotParPart * parts
}

function App() {
    const [montant, setMontant] = useState('3000')
    const [isCadre, setIsCadre] = useState(false)
    const [mode, setMode] = useState<'brut' | 'net'>('brut')
    const [isMarried, setIsMarried] = useState(false)
    const [enfants, setEnfants] = useState(0)

    const resultat = useMemo(() => {
        const valeur = parseFloat(montant.replace(/\s/g, '')) || 0
        const taux = isCadre ? TAUX_CADRE : TAUX_NON_CADRE

        let brut: number, netAvantImpots: number, cotisations: number

        if (mode === 'brut') {
            brut = valeur
            netAvantImpots = valeur * (1 - taux)
            cotisations = valeur - netAvantImpots
        } else {
            netAvantImpots = valeur
            brut = valeur / (1 - taux)
            cotisations = brut - netAvantImpots
        }

        // Calcul impôt sur le revenu annuel
        const netAnnuelAvantImpots = netAvantImpots * 12
        const parts = calculerParts(isMarried, enfants)
        const impotAnnuel = calculerImpot(netAnnuelAvantImpots, parts)
        const impotMensuel = impotAnnuel / 12
        const netApresImpots = netAvantImpots - impotMensuel
        const tauxImposition = netAnnuelAvantImpots > 0 ? (impotAnnuel / netAnnuelAvantImpots) * 100 : 0

        return {
            brut,
            netAvantImpots,
            cotisations,
            tauxCotisations: taux * 100,
            impotMensuel,
            impotAnnuel,
            netApresImpots,
            netAnnuelApresImpots: netApresImpots * 12,
            parts,
            tauxImposition
        }
    }, [montant, isCadre, mode, isMarried, enfants])

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
                    <p className="subtitle">Calculateur de salaire complet</p>
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

                {/* Situation Familiale */}
                <div className="family-section">
                    <div className="family-row">
                        <span className="family-label">Situation</span>
                        <div className="status-toggle">
                            <button
                                className={`status-btn ${!isMarried ? 'active' : ''}`}
                                onClick={() => setIsMarried(false)}
                            >
                                Seul(e)
                            </button>
                            <button
                                className={`status-btn ${isMarried ? 'active' : ''}`}
                                onClick={() => setIsMarried(true)}
                            >
                                Couple
                            </button>
                        </div>
                    </div>
                    <div className="family-row">
                        <span className="family-label">Enfants</span>
                        <div className="children-control">
                            <button
                                className="children-btn"
                                onClick={() => setEnfants(Math.max(0, enfants - 1))}
                                disabled={enfants === 0}
                            >
                                −
                            </button>
                            <span className="children-count">{enfants}</span>
                            <button
                                className="children-btn"
                                onClick={() => setEnfants(Math.min(10, enfants + 1))}
                            >
                                +
                            </button>
                        </div>
                    </div>
                    <div className="parts-info">
                        {resultat.parts} part{resultat.parts > 1 ? 's' : ''} fiscale{resultat.parts > 1 ? 's' : ''}
                    </div>
                </div>

                {/* Results */}
                <div className="results">
                    <div className="result-row">
                        <span className="result-label">Salaire brut</span>
                        <span className="result-value">{formatMontant(resultat.brut)} €</span>
                    </div>

                    <div className="result-row muted">
                        <span className="result-label">Cotisations (~{resultat.tauxCotisations.toFixed(0)}%)</span>
                        <span className="result-value">−{formatMontant(resultat.cotisations)} €</span>
                    </div>

                    <div className="result-row">
                        <span className="result-label">Net avant impôts</span>
                        <span className="result-value">{formatMontant(resultat.netAvantImpots)} €</span>
                    </div>

                    <div className="result-row muted">
                        <span className="result-label">Impôt estimé (~{resultat.tauxImposition.toFixed(1)}%)</span>
                        <span className="result-value">−{formatMontant(resultat.impotMensuel)} €</span>
                    </div>

                    <div className="divider" />

                    <div className="result-row highlight">
                        <span className="result-label">💰 Net à payer</span>
                        <span className="result-value big">{formatMontant(resultat.netApresImpots)} €</span>
                    </div>

                    <div className="result-row annual">
                        <span className="result-label">Net annuel après impôts</span>
                        <span className="result-value">{formatMontant(resultat.netAnnuelApresImpots)} €</span>
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
                <p>Estimation basée sur les barèmes France 2025</p>
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
