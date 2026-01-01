import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SalaryChart } from './components/SalaryChart'
import { ComparisonMode } from './components/ComparisonMode'
import { EmployerCost } from './components/EmployerCost'
import './index.css'

// Constants
const TAUX_NON_CADRE = 0.22
const TAUX_CADRE = 0.25

const TRANCHES_IMPOT = [
    { min: 0, max: 11497, taux: 0 },
    { min: 11497, max: 29315, taux: 0.11 },
    { min: 29315, max: 83823, taux: 0.30 },
    { min: 83823, max: 180294, taux: 0.41 },
    { min: 180294, max: Infinity, taux: 0.45 }
]

// Utilities
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

type ViewMode = 'chart' | 'compare' | 'employer'

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
        <div className="app-layout">
            {/* Header Sémantique */}
            <header className="app-header">
                <motion.h1
                    className="app-header__title"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    BrutNet
                </motion.h1>
                <motion.p
                    className="app-header__tagline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    Simulateur de salaire France 2025
                </motion.p>
            </header>

            <main className="app-layout__main">
                {/* Primary Navigation / Mode Switcher */}
                <nav className="control-toggle" aria-label="Mode de calcul">
                    <button
                        className={`control-toggle__button ${mode === 'brut' ? 'control-toggle__button--active' : ''}`}
                        onClick={() => setMode('brut')}
                        aria-pressed={mode === 'brut'}
                    >
                        Brut → Net
                    </button>
                    <button
                        className={`control-toggle__button ${mode === 'net' ? 'control-toggle__button--active' : ''}`}
                        onClick={() => setMode('net')}
                        aria-pressed={mode === 'net'}
                    >
                        Net → Brut
                    </button>
                </nav>

                {/* Input Section */}
                <motion.section
                    className="simulator-card simulator-card--glass"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <header className="simulator-card__header">
                        <label className="simulator-card__title" htmlFor="salary-input">
                            {mode === 'brut' ? 'Salaire brut' : 'Salaire net'} mensuel
                        </label>
                    </header>
                    <div className="salary-input">
                        <input
                            id="salary-input"
                            type="text"
                            inputMode="numeric"
                            value={montant}
                            onChange={(e) => setMontant(e.target.value.replace(/[^0-9]/g, ''))}
                            className="salary-input__field"
                            placeholder="3000"
                            aria-label="Montant du salaire"
                        />
                        <span className="salary-input__unit" aria-hidden="true">€/mois</span>
                    </div>
                </motion.section>

                {/* Configuration Options */}
                <motion.section
                    className="simulator-card simulator-card--glass options-group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    aria-label="Paramètres de simulation"
                >
                    <div className="options-group__row">
                        <span className="options-group__label">Statut</span>
                        <div className="control-toggle control-toggle--inline">
                            <button
                                className={`control-toggle__button ${!isCadre ? 'control-toggle__button--active' : ''}`}
                                onClick={() => setIsCadre(false)}
                            >
                                Non-cadre
                            </button>
                            <button
                                className={`control-toggle__button ${isCadre ? 'control-toggle__button--active' : ''}`}
                                onClick={() => setIsCadre(true)}
                            >
                                Cadre
                            </button>
                        </div>
                    </div>
                    <div className="options-group__row">
                        <span className="options-group__label">Situation</span>
                        <div className="control-toggle control-toggle--inline">
                            <button
                                className={`control-toggle__button ${!isMarried ? 'control-toggle__button--active' : ''}`}
                                onClick={() => setIsMarried(false)}
                            >
                                Seul(e)
                            </button>
                            <button
                                className={`control-toggle__button ${isMarried ? 'control-toggle__button--active' : ''}`}
                                onClick={() => setIsMarried(true)}
                            >
                                Couple
                            </button>
                        </div>
                    </div>
                    <div className="options-group__row">
                        <span className="options-group__label">Enfants</span>
                        <div className="stepper">
                            <button
                                className="stepper__button"
                                onClick={() => setEnfants(Math.max(0, enfants - 1))}
                                disabled={enfants === 0}
                                aria-label="Diminuer le nombre d'enfants"
                            >
                                −
                            </button>
                            <span className="stepper__value">{enfants}</span>
                            <button
                                className="stepper__button"
                                onClick={() => setEnfants(enfants + 1)}
                                aria-label="Augmenter le nombre d'enfants"
                            >
                                +
                            </button>
                        </div>
                    </div>
                    <p className="parts-badge" style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-brand-primary)', fontWeight: 600 }}>
                        {resultat.parts} part{resultat.parts > 1 ? 's' : ''} fiscale{resultat.parts > 1 ? 's' : ''}
                    </p>
                </motion.section>

                {/* Visualization Tabs */}
                <nav className="view-nav" aria-label="Vues détaillées">
                    <button
                        className={`view-nav__item ${viewMode === 'chart' ? 'view-nav__item--active' : ''}`}
                        onClick={() => setViewMode('chart')}
                    >
                        📊 Graphique
                    </button>
                    <button
                        className={`view-nav__item ${viewMode === 'compare' ? 'view-nav__item--active' : ''}`}
                        onClick={() => setViewMode('compare')}
                    >
                        🚀 Augmentation
                    </button>
                    <button
                        className={`view-nav__item ${viewMode === 'employer' ? 'view-nav__item--active' : ''}`}
                        onClick={() => setViewMode('employer')}
                    >
                        🏢 Employeur
                    </button>
                </nav>

                {/* Dashboard Area */}
                <AnimatePresence mode="wait">
                    {viewMode === 'chart' && (
                        <motion.div key="chart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <SalaryChart
                                netApresImpots={resultat.netApresImpots}
                                cotisations={resultat.cotisations}
                                impot={resultat.impotMensuel}
                            />
                        </motion.div>
                    )}
                    {viewMode === 'compare' && (
                        <motion.div key="compare" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                        <motion.div key="employer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <EmployerCost
                                brutMensuel={resultat.brut}
                                isCadre={isCadre}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Summary */}
                <motion.article
                    className="simulator-card simulator-card--glass results-display"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <header className="simulator-card__header">
                        <h3 className="simulator-card__title">📆 Mensuel</h3>
                    </header>

                    <div className="results-display__row">
                        <span className="results-display__label">Brut</span>
                        <span className="results-display__value">{fmt(resultat.brut)} €</span>
                    </div>
                    <div className="results-display__row results-display__row--dim">
                        <span className="results-display__label">Cotisations ({resultat.tauxCotisations.toFixed(0)}%)</span>
                        <span className="results-display__value">−{fmt(resultat.cotisations)} €</span>
                    </div>
                    <div className="results-display__row">
                        <span className="results-display__label">Net avant impôts</span>
                        <span className="results-display__value">{fmt(resultat.netAvantImpots)} €</span>
                    </div>
                    <div className="results-display__row results-display__row--dim">
                        <span className="results-display__label">Impôt ({resultat.tauxImposition.toFixed(1)}%)</span>
                        <span className="results-display__value">−{fmt(resultat.impotMensuel)} €</span>
                    </div>

                    <div className="results-display__highlight">
                        <span className="results-display__highlight-label">💰 Net à payer</span>
                        <output className="results-display__highlight-value">{fmt(resultat.netApresImpots)} €</output>
                    </div>
                </motion.article>

                <motion.article
                    className="simulator-card results-display results-display--annual"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <header className="simulator-card__header">
                        <h3 className="simulator-card__title">📅 Annuel</h3>
                    </header>
                    <div className="results-display__row">
                        <span className="results-display__label">Brut annuel</span>
                        <span className="results-display__value">{fmt(resultat.brutAnnuel)} €</span>
                    </div>
                    <div className="results-display__row">
                        <span className="results-display__label">Net annuel</span>
                        <span className="results-display__value">{fmt(resultat.netAnnuelApresImpots)} €</span>
                    </div>
                </motion.article>
            </main>

            <footer className="app-footer">
                <p className="app-footer__legal">Estimation basée sur les barèmes officiels 2025</p>
                <div className="app-footer__signature">
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                        Made with <span className="heart-emoji">❤️</span> by <strong>Hamza DJOUDI</strong>
                    </p>
                    <a href="https://djoudi.dev" target="_blank" rel="noopener" className="signature-link">djoudi.dev</a>
                </div>
            </footer>
        </div>
    )
}

export default App
