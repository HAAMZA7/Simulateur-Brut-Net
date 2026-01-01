import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SalaryChart } from './components/SalaryChart'
import { ComparisonMode } from './components/ComparisonMode'
import { EmployerCost } from './components/EmployerCost'
import './index.css'

// Taux de cotisations France 2025 (moyenne estimée)
const TAUX_NON_CADRE = 0.22
const TAUX_CADRE = 0.25

// Tranches d'imposition 2025 OFFICIELLES
const TRANCHES_IMPOT = [
    { min: 0, max: 11497, taux: 0 },
    { min: 11497, max: 29315, taux: 0.11 },
    { min: 29315, max: 83823, taux: 0.30 },
    { min: 83823, max: 180294, taux: 0.41 },
    { min: 180294, max: Infinity, taux: 0.45 }
]

function calculerParts(isMarried: boolean, enfants: number): number {
    let parts = isMarried ? 2 : 1
    if (enfants >= 1) parts += 0.5
    if (enfants >= 2) parts += 0.5
    if (enfants >= 3) parts += (enfants - 2) * 1
    return parts
}

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

type ViewMode = 'simple' | 'chart' | 'compare' | 'employer'

function App() {
    const [montant, setMontant] = useState('3000')
    const [isCadre, setIsCadre] = useState(false)
    const [mode, setMode] = useState<'brut' | 'net'>('brut')
    const [isMarried, setIsMarried] = useState(false)
    const [enfants, setEnfants] = useState(0)
    const [viewMode, setViewMode] = useState<ViewMode>('chart')

    const taux = isCadre ? TAUX_CADRE : TAUX_NON_CADRE
    const parts = calculerParts(isMarried, enfants)

    const calculerResultat = useCallback((brutInput: number) => {
        const netAvantImpots = brutInput * (1 - taux)
        const cotisations = brutInput - netAvantImpots
        const netAnnuelAvantImpots = netAvantImpots * 12
        const impotAnnuel = calculerImpot(netAnnuelAvantImpots, parts)
        const impotMensuel = impotAnnuel / 12
        const netApresImpots = netAvantImpots - impotMensuel
        return { netApresImpots, cotisations, impotMensuel, netAvantImpots }
    }, [taux, parts])

    const resultat = useMemo(() => {
        const valeur = parseFloat(montant.replace(/\s/g, '')) || 0
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

        const netAnnuelAvantImpots = netAvantImpots * 12
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
            netApresImpots,
            brutAnnuel: brut * 12,
            netAnnuelApresImpots: netApresImpots * 12,
            parts,
            tauxImposition
        }
    }, [montant, taux, mode, parts])

    const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })

    return (
        <div className="app">
            {/* Hero */}
            <header className="hero">
                <motion.h1
                    className="brand"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    BrutNet
                </motion.h1>
                <motion.p
                    className="tagline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    Simulateur de salaire France 2025
                </motion.p>
            </header>

            <main className="calculator">
                {/* Mode Toggle */}
                <div className="toggle-group">
                    <button className={`toggle-btn ${mode === 'brut' ? 'active' : ''}`} onClick={() => setMode('brut')}>
                        Brut → Net
                    </button>
                    <button className={`toggle-btn ${mode === 'net' ? 'active' : ''}`} onClick={() => setMode('net')}>
                        Net → Brut
                    </button>
                </div>

                {/* Input Section */}
                <motion.section
                    className="card glass input-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <label className="label">{mode === 'brut' ? 'Salaire brut' : 'Salaire net'} mensuel</label>
                    <div className="input-row">
                        <input
                            type="text"
                            inputMode="numeric"
                            value={montant}
                            onChange={(e) => setMontant(e.target.value.replace(/[^0-9]/g, ''))}
                            className="big-input"
                            placeholder="3000"
                        />
                        <span className="unit">€/mois</span>
                    </div>
                </motion.section>

                {/* Options */}
                <motion.section
                    className="card glass options-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="option-row">
                        <span className="option-label">Statut</span>
                        <div className="toggle-group small">
                            <button className={`toggle-btn ${!isCadre ? 'active' : ''}`} onClick={() => setIsCadre(false)}>Non-cadre</button>
                            <button className={`toggle-btn ${isCadre ? 'active' : ''}`} onClick={() => setIsCadre(true)}>Cadre</button>
                        </div>
                    </div>
                    <div className="option-row">
                        <span className="option-label">Situation</span>
                        <div className="toggle-group small">
                            <button className={`toggle-btn ${!isMarried ? 'active' : ''}`} onClick={() => setIsMarried(false)}>Seul(e)</button>
                            <button className={`toggle-btn ${isMarried ? 'active' : ''}`} onClick={() => setIsMarried(true)}>Couple</button>
                        </div>
                    </div>
                    <div className="option-row">
                        <span className="option-label">Enfants</span>
                        <div className="counter">
                            <button onClick={() => setEnfants(Math.max(0, enfants - 1))} disabled={enfants === 0}>−</button>
                            <span>{enfants}</span>
                            <button onClick={() => setEnfants(enfants + 1)}>+</button>
                        </div>
                    </div>
                    <p className="parts-badge">{resultat.parts} part{resultat.parts > 1 ? 's' : ''} fiscale{resultat.parts > 1 ? 's' : ''}</p>
                </motion.section>

                {/* View Mode Tabs */}
                <div className="view-tabs">
                    <button
                        className={`view-tab ${viewMode === 'chart' ? 'active' : ''}`}
                        onClick={() => setViewMode('chart')}
                    >
                        📊 Graphique
                    </button>
                    <button
                        className={`view-tab ${viewMode === 'compare' ? 'active' : ''}`}
                        onClick={() => setViewMode('compare')}
                    >
                        🚀 Augmentation
                    </button>
                    <button
                        className={`view-tab ${viewMode === 'employer' ? 'active' : ''}`}
                        onClick={() => setViewMode('employer')}
                    >
                        🏢 Employeur
                    </button>
                </div>

                {/* Dynamic Content */}
                <AnimatePresence mode="wait">
                    {viewMode === 'chart' && (
                        <motion.div
                            key="chart"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <SalaryChart
                                netApresImpots={resultat.netApresImpots}
                                cotisations={resultat.cotisations}
                                impot={resultat.impotMensuel}
                            />
                        </motion.div>
                    )}
                    {viewMode === 'compare' && (
                        <motion.div
                            key="compare"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <ComparisonMode
                                currentBrut={resultat.brut}
                                isCadre={isCadre}
                                isMarried={isMarried}
                                enfants={enfants}
                                calculerResultat={calculerResultat}
                            />
                        </motion.div>
                    )}
                    {viewMode === 'employer' && (
                        <motion.div
                            key="employer"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <EmployerCost
                                brutMensuel={resultat.brut}
                                isCadre={isCadre}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Monthly */}
                <motion.section
                    className="card glass results-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3 className="section-title">📆 Mensuel</h3>

                    <div className="result-line">
                        <span>Brut</span>
                        <span className="value">{fmt(resultat.brut)} €</span>
                    </div>
                    <div className="result-line dim">
                        <span>Cotisations ({resultat.tauxCotisations.toFixed(0)}%)</span>
                        <span className="value">−{fmt(resultat.cotisations)} €</span>
                    </div>
                    <div className="result-line">
                        <span>Net avant impôts</span>
                        <span className="value">{fmt(resultat.netAvantImpots)} €</span>
                    </div>
                    <div className="result-line dim">
                        <span>Impôt ({resultat.tauxImposition.toFixed(1)}%)</span>
                        <span className="value">−{fmt(resultat.impotMensuel)} €</span>
                    </div>

                    <div className="result-highlight">
                        <span>💰 Net à payer</span>
                        <span className="value">{fmt(resultat.netApresImpots)} €</span>
                    </div>
                </motion.section>

                {/* Results Annual */}
                <motion.section
                    className="card glass results-card annual"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h3 className="section-title">📅 Annuel</h3>
                    <div className="result-line">
                        <span>Brut annuel</span>
                        <span className="value">{fmt(resultat.brutAnnuel)} €</span>
                    </div>
                    <div className="result-line">
                        <span>Net annuel</span>
                        <span className="value">{fmt(resultat.netAnnuelApresImpots)} €</span>
                    </div>
                </motion.section>
            </main>

            <footer className="footer">
                <p>Estimation basée sur les barèmes officiels 2025</p>
                <div className="made-by">
                    <p>
                        <span className="made-text">Made with</span>
                        <span className="heart-emoji">❤️</span>
                        <span className="by-text">by <strong>Hamza DJOUDI</strong></span>
                    </p>
                    <a href="https://djoudi.dev" target="_blank" rel="noopener" className="signature-link">djoudi.dev</a>
                </div>
            </footer>
        </div>
    )
}

export default App
