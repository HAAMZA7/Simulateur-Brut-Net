import { useMemo, useState } from 'react'
import './index.css'

const TAUX_NON_CADRE = 0.22
const TAUX_CADRE = 0.255

const TRANCHES_IMPOT = [
    { min: 0, max: 11497, taux: 0 },
    { min: 11497, max: 29315, taux: 0.11 },
    { min: 29315, max: 83823, taux: 0.3 },
    { min: 83823, max: 180294, taux: 0.41 },
    { min: 180294, max: Infinity, taux: 0.45 }
]

const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })

function calculerParts(isMarried: boolean, enfants: number) {
    let parts = isMarried ? 2 : 1
    if (enfants >= 1) parts += 0.5
    if (enfants >= 2) parts += 0.5
    if (enfants >= 3) parts += enfants - 2
    return parts
}

function calculerImpot(revenuNetImposable: number, parts: number) {
    const quotient = revenuNetImposable / parts
    let impotParPart = 0
    for (const t of TRANCHES_IMPOT) {
        if (quotient > t.min) {
            impotParPart += (Math.min(quotient, t.max) - t.min) * t.taux
        }
    }
    return impotParPart * parts
}

export default function App() {
    const [montant, setMontant] = useState('3000')
    const [isAnnual, setIsAnnual] = useState(false)
    const [mode, setMode] = useState<'brut' | 'net'>('brut')
    const [isCadre, setIsCadre] = useState(false)
    const [isMarried, setIsMarried] = useState(false)
    const [enfants, setEnfants] = useState(0)
    const [is13thMonth, setIs13thMonth] = useState(false)

    const parts = calculerParts(isMarried, enfants)
    const taux = isCadre ? TAUX_CADRE : TAUX_NON_CADRE
    const annualFactor = is13thMonth ? 13 : 12

    const result = useMemo(() => {
        const input = parseFloat(montant.replace(/\s/g, '').replace(',', '.')) || 0
        const sourceFactor = isAnnual ? annualFactor : 1
        const monthlyIn = input / sourceFactor

        const brut = mode === 'brut' ? monthlyIn : monthlyIn / (1 - taux)
        const cotisations = brut * taux
        const netAvant = brut - cotisations
        const impotAnnuel = calculerImpot(netAvant * annualFactor, parts)
        const impotMensuel = impotAnnuel / annualFactor
        const net = netAvant - impotMensuel
        const coutEmployeur = brut * (isCadre ? 1.45 : 1.42)

        return {
            brut,
            cotisations,
            netAvant,
            impotMensuel,
            net,
            netAnnuel: net * annualFactor,
            coutEmployeur,
            tauxEffectif: brut > 0 ? ((cotisations + impotMensuel) / brut) * 100 : 0,
            pouvoirAchat: brut > 0 ? (net / brut) * 100 : 0
        }
    }, [montant, isAnnual, annualFactor, mode, taux, parts, isCadre])

    const simulations = [100, 300, 500].map((plus) => {
        const brut = result.brut + plus
        const cot = brut * taux
        const netAvant = brut - cot
        const imp = calculerImpot(netAvant * annualFactor, parts) / annualFactor
        const net = netAvant - imp
        return { plus, net, delta: net - result.net }
    })

    return (
        <div className="app">
            <header className="topbar">
                <div className="brand">Brut<span>Net</span></div>
                <div className="meta">🇫🇷 Simulateur France 2025</div>
            </header>

            <main className="layout">
                <section className="hero card">
                    <div className="hero-copy">
                        <h1>Calculez votre salaire net</h1>
                        <p>Simple, fiable, lisible.</p>
                    </div>

                    <div className="hero-controls">
                        <div className="seg">
                            <button type="button" className={!isAnnual ? 'on' : ''} onClick={() => setIsAnnual(false)}>Mensuel</button>
                            <button type="button" className={isAnnual ? 'on' : ''} onClick={() => setIsAnnual(true)}>Annuel</button>
                        </div>

                        <input
                            value={montant}
                            onChange={(e) => setMontant(e.target.value.replace(/[^0-9]/g, ''))}
                            inputMode="numeric"
                            aria-label="Montant"
                        />
                        <p className="subline">€ / {isAnnual ? 'an' : 'mois'} en {mode}</p>

                        <div className="seg">
                            <button type="button" className={mode === 'brut' ? 'on' : ''} onClick={() => setMode('brut')}>Brut</button>
                            <button type="button" className={mode === 'net' ? 'on' : ''} onClick={() => setMode('net')}>Net</button>
                        </div>
                    </div>

                    <div className="hero-result">
                        <small>Net après impôts</small>
                        <strong>{fmt(result.net)} €</strong>
                        <p>{fmt(result.netAnnuel)} € / an</p>
                    </div>
                </section>

                <section className="card">
                    <h2>Configuration</h2>
                    <div className="config-grid">
                        <div>
                            <label>Statut</label>
                            <div className="seg">
                                <button type="button" className={!isCadre ? 'on' : ''} onClick={() => setIsCadre(false)}>Non-cadre</button>
                                <button type="button" className={isCadre ? 'on' : ''} onClick={() => setIsCadre(true)}>Cadre</button>
                            </div>
                        </div>
                        <div>
                            <label>Situation</label>
                            <div className="seg">
                                <button type="button" className={!isMarried ? 'on' : ''} onClick={() => setIsMarried(false)}>Célibataire</button>
                                <button type="button" className={isMarried ? 'on' : ''} onClick={() => setIsMarried(true)}>Marié / Pacsé</button>
                            </div>
                        </div>
                        <div>
                            <label>Enfants</label>
                            <div className="counter">
                                <button type="button" onClick={() => setEnfants(Math.max(0, enfants - 1))}>−</button>
                                <b>{enfants}</b>
                                <button type="button" onClick={() => setEnfants(enfants + 1)}>+</button>
                            </div>
                        </div>
                        <div>
                            <label>Option</label>
                            <label className="checkbox">
                                <input type="checkbox" checked={is13thMonth} onChange={(e) => setIs13thMonth(e.target.checked)} />
                                13ème mois
                            </label>
                        </div>
                    </div>
                </section>

                <section className="stats">
                    <article className="card compact">
                        <span>Taux effectif</span>
                        <strong>{result.tauxEffectif.toFixed(1)}%</strong>
                    </article>
                    <article className="card compact">
                        <span>Pouvoir d’achat</span>
                        <strong className="green">+{result.pouvoirAchat.toFixed(1)}%</strong>
                    </article>
                    <article className="card compact">
                        <span>Coût employeur</span>
                        <strong>{fmt(result.coutEmployeur)} €</strong>
                    </article>
                </section>

                <section className="bottom">
                    <article className="card">
                        <h2>Récapitulatif</h2>
                        <ul className="list">
                            <li><span>Salaire brut</span><b>{fmt(result.brut)} €</b></li>
                            <li><span>Cotisations</span><b>-{fmt(result.cotisations)} €</b></li>
                            <li><span>Impôt mensuel</span><b>-{fmt(result.impotMensuel)} €</b></li>
                            <li className="total"><span>Net après impôts</span><b>{fmt(result.net)} €</b></li>
                        </ul>
                    </article>

                    <article className="card">
                        <h2>Simulation d’augmentation</h2>
                        <div className="sim-grid">
                            {simulations.map((s) => (
                                <div key={s.plus} className="sim">
                                    <small>+ {s.plus} € brut</small>
                                    <strong>{fmt(s.net)} €</strong>
                                    <p>+ {fmt(s.delta)} € net / mois</p>
                                </div>
                            ))}
                        </div>
                    </article>
                </section>
            </main>
        </div>
    )
}
