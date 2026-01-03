import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
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

type Theme = 'dark' | 'light'

function App() {
    const [theme, setTheme] = useState<Theme>('dark')
    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')

    useMemo(() => {
        document.documentElement.setAttribute('data-theme', theme)
    }, [theme])

    const [montant, setMontant] = useState('3000')
    const [isCadre, setIsCadre] = useState(false)
    const [mode, setMode] = useState<'brut' | 'net'>('brut')
    const [isMarried, setIsMarried] = useState(false)
    const [enfants, setEnfants] = useState(0)

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
            cotisations = brut - netAvantImpots
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
            tauxImposition
        }
    }, [montant, taux, mode, parts])

    const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })

    const animProps: any = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.8, ease: "easeOut" }
    }

    return (
        <div className="app-container">
            <header className="apple-header">
                <span className="apple-header__logo">BrutNet</span>
                <button onClick={toggleTheme} className="apple-toggle__btn" style={{ fontSize: '20px' }}>
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </header>

            <main>
                {/* Hero: Focal Entry */}
                <section className="hero-section">
                    <motion.h1
                        className="hero-title"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Calculez votre salaire net
                    </motion.h1>
                    <span className="hero-label">Simulateur intelligent • France 2025</span>
                    <div className="apple-input-group">
                        <input
                            type="text"
                            value={montant}
                            onChange={(e) => setMontant(e.target.value.replace(/[^0-9]/g, ''))}
                            className="apple-input"
                            autoFocus
                        />
                        <span className="apple-input-unit">€ / mois en {mode}</span>
                    </div>

                    <div className="apple-toggle mt-40">
                        <button className={`apple-toggle__btn ${mode === 'brut' ? 'apple-toggle__btn--active' : ''}`} onClick={() => setMode('brut')}>Brut</button>
                        <button className={`apple-toggle__btn ${mode === 'net' ? 'apple-toggle__btn--active' : ''}`} onClick={() => setMode('net')}>Net</button>
                    </div>
                </section>

                <div className="section-divider" />

                {/* Configuration: Compact & Centered */}
                <motion.section className="apple-card" {...animProps}>
                    <h2 className="apple-card__title">Configuration</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        <div>
                            <span className="hero-label" style={{ fontSize: '12px' }}>VOTRE STATUT</span>
                            <div className="apple-toggle">
                                <button className={`apple-toggle__btn ${!isCadre ? 'apple-toggle__btn--active' : ''}`} onClick={() => setIsCadre(false)}>Non-cadre</button>
                                <button className={`apple-toggle__btn ${isCadre ? 'apple-toggle__btn--active' : ''}`} onClick={() => setIsCadre(true)}>Cadre</button>
                            </div>
                        </div>
                        <div>
                            <span className="hero-label" style={{ fontSize: '12px' }}>VOTRE FAMILLE</span>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <button className={`apple-toggle__btn ${isMarried ? 'apple-toggle__btn--active' : ''}`} style={{ background: 'var(--color-bg-secondary)' }} onClick={() => setIsMarried(!isMarried)}>{isMarried ? 'Couple' : 'Seul'}</button>
                                <div className="apple-toggle" style={{ gap: '12px', padding: '4px 12px' }}>
                                    <button onClick={() => setEnfants(Math.max(0, enfants - 1))} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>-</button>
                                    <span style={{ fontWeight: 600 }}>{enfants}</span>
                                    <button onClick={() => setEnfants(enfants + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>+</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Main Results */}
                <motion.section className="apple-card" {...animProps}>
                    <h2 className="apple-card__title">Récapitulatif</h2>
                    <div className="apple-list-row">
                        <span className="apple-list-label">Salaire Brut</span>
                        <span className="apple-list-value">{fmt(resultat.brut)} €</span>
                    </div>
                    <div className="apple-list-row">
                        <span className="apple-list-label">Cotisations ({resultat.tauxCotisations}%)</span>
                        <span className="apple-list-value">-{fmt(resultat.cotisations)} €</span>
                    </div>
                    <div className="apple-list-row">
                        <span className="apple-list-label">Impôt sur le revenu (Prélèvement à la source)</span>
                        <span className="apple-list-value">-{fmt(resultat.impotMensuel)} €</span>
                    </div>
                    <div className="apple-list-row apple-list-row--total">
                        <span className="apple-list-label" style={{ fontSize: '20px', fontWeight: 600 }}>Net après impôts</span>
                        <span className="apple-list-value">{fmt(resultat.netApresImpots)} €/mois</span>
                    </div>
                </motion.section>

                {/* Analysis */}
                <motion.section className="apple-card" {...animProps}>
                    <h2 className="apple-card__title">Répartition Visuelle</h2>
                    <div style={{ height: '300px' }}>
                        <SalaryChart
                            netApresImpots={resultat.netApresImpots}
                            cotisations={resultat.cotisations}
                            impot={resultat.impotMensuel}
                        />
                    </div>
                </motion.section>

                <div className="section-divider" />

                {/* Advanced Tools */}
                <motion.section {...animProps}>
                    <ComparisonMode
                        currentBrut={resultat.brut}
                        isCadre={isCadre}
                        isMarried={isMarried}
                        enfants={enfants}
                        calculerResultat={calculerResultat}
                    />
                </motion.section>

                <motion.section {...animProps} className="mt-40">
                    <EmployerCost
                        brutMensuel={resultat.brut}
                        isCadre={isCadre}
                    />
                </motion.section>
            </main>

            <footer className="text-center mt-40" style={{ color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
                <p>Simulateur basé sur les lois de finances 2025. Précision indicative.</p>
                <p style={{ marginTop: '16px' }}>
                    Développé par{' '}
                    <a
                        href="https://djoudi.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="signature-link"
                    >
                        Hamza DJOUDI
                    </a>
                </p>
            </footer>
        </div>
    )
}

export default App
