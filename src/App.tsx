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
    const [isAnnual, setIsAnnual] = useState(false)
    const [is13thMonth, setIs13thMonth] = useState(false)

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
        let brutMensuel: number, netAvantImpots: number, cotisations: number

        // Convertir en mensuel si annuel
        const diviseur = is13thMonth ? 13 : 12
        const valeurMensuelle = isAnnual ? valeur / diviseur : valeur

        if (mode === 'brut') {
            brutMensuel = valeurMensuelle
            netAvantImpots = valeurMensuelle * (1 - taux)
            cotisations = brutMensuel - netAvantImpots
        } else {
            netAvantImpots = valeurMensuelle
            brutMensuel = valeurMensuelle / (1 - taux)
            cotisations = brutMensuel - netAvantImpots
        }

        const netAnnuelAvantImpots = netAvantImpots * 12
        const impotAnnuel = calculerImpot(netAnnuelAvantImpots, parts)
        const impotMensuel = impotAnnuel / 12
        const netApresImpots = netAvantImpots - impotMensuel
        const tauxImposition = netAnnuelAvantImpots > 0 ? (impotAnnuel / netAnnuelAvantImpots) * 100 : 0

        // Calculer annuel
        const brutAnnuel = brutMensuel * (is13thMonth ? 13 : 12)
        const netApresImpotsAnnuel = netApresImpots * 12

        return {
            brut: brutMensuel,
            brutAnnuel,
            netAvantImpots,
            cotisations,
            tauxCotisations: taux * 100,
            impotMensuel,
            netApresImpots,
            netApresImpotsAnnuel,
            tauxImposition
        }
    }, [montant, taux, mode, parts, isAnnual, is13thMonth])

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

                    {/* Toggle Mensuel/Annuel */}
                    <div className="apple-toggle" style={{ marginBottom: '24px' }}>
                        <button className={`apple-toggle__btn ${!isAnnual ? 'apple-toggle__btn--active' : ''}`} onClick={() => setIsAnnual(false)}>Mensuel</button>
                        <button className={`apple-toggle__btn ${isAnnual ? 'apple-toggle__btn--active' : ''}`} onClick={() => setIsAnnual(true)}>Annuel</button>
                    </div>

                    <div className="apple-input-group">
                        <input
                            type="text"
                            value={montant}
                            onChange={(e) => setMontant(e.target.value.replace(/[^0-9]/g, ''))}
                            className="apple-input"
                            autoFocus
                        />
                        <span className="apple-input-unit">€ / {isAnnual ? 'an' : 'mois'} en {mode}</span>
                    </div>

                    <div className="apple-toggle mt-40">
                        <button className={`apple-toggle__btn ${mode === 'brut' ? 'apple-toggle__btn--active' : ''}`} onClick={() => setMode('brut')}>Brut</button>
                        <button className={`apple-toggle__btn ${mode === 'net' ? 'apple-toggle__btn--active' : ''}`} onClick={() => setMode('net')}>Net</button>
                    </div>

                    {/* Résultat Principal - Toujours visible */}
                    <motion.div
                        className="result-highlight"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <span className="result-highlight__label">Net après impôts</span>
                        <span className="result-highlight__value">{fmt(resultat.netApresImpots)} €<span className="result-highlight__suffix">/mois</span></span>
                        <span className="result-highlight__annual">{fmt(resultat.netApresImpotsAnnuel)} €/an</span>
                    </motion.div>
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
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <button className={`apple-toggle__btn ${isMarried ? 'apple-toggle__btn--active' : ''}`} style={{ background: 'var(--color-bg-secondary)' }} onClick={() => setIsMarried(!isMarried)}>{isMarried ? 'Couple' : 'Seul'}</button>
                                <div className="apple-toggle" style={{ gap: '12px', padding: '4px 12px' }}>
                                    <button onClick={() => setEnfants(Math.max(0, enfants - 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-primary)' }}>-</button>
                                    <span style={{ fontWeight: 600 }}>{enfants} enfant{enfants > 1 ? 's' : ''}</span>
                                    <button onClick={() => setEnfants(enfants + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-primary)' }}>+</button>
                                </div>
                            </div>
                            {/* Option 13ème mois */}
                            <div style={{ marginTop: '16px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={is13thMonth} onChange={(e) => setIs13thMonth(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--color-brand)' }} />
                                    <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>13ème mois</span>
                                </label>
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

            <footer className="signature-container">
                <p style={{ color: 'var(--color-text-tertiary)', fontSize: '13px', marginBottom: '16px' }}>
                    Simulateur basé sur les lois de finances 2025. Précision indicative.
                </p>
                <div className="signature-content">
                    <span className="made-text">Made with</span>
                    <span className="heart">❤️</span>
                    <span className="by-text">by <strong>Hamza DJOUDI</strong></span>
                </div>
                <a
                    href="https://djoudi.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="signature-link"
                >
                    djoudi.dev
                </a>
            </footer>
        </div>
    )
}

export default App
