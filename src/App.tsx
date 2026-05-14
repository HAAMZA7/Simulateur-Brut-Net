import { useMemo, useState } from 'react'
import './index.css'

const TAUX_NON_CADRE = 0.22
const TAUX_CADRE = 0.255

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
    if (enfants >= 3) parts += enfants - 2
    return parts
}

function calculerImpot(revenuNetImposable: number, parts: number): number {
    const quotient = revenuNetImposable / parts
    let impotParPart = 0
    for (const tranche of TRANCHES_IMPOT) {
        if (quotient > tranche.min) {
            impotParPart += (Math.min(quotient, tranche.max) - tranche.min) * tranche.taux
        }
    }
    return impotParPart * parts
}

const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })

export default function App() {
    const [montant, setMontant] = useState('3000')
    const [isCadre, setIsCadre] = useState(false)
    const [isAnnual, setIsAnnual] = useState(false)
    const [mode, setMode] = useState<'brut' | 'net'>('brut')
    const [isMarried, setIsMarried] = useState(false)
    const [enfants, setEnfants] = useState(0)
    const [is13thMonth, setIs13thMonth] = useState(false)

    const parts = calculerParts(isMarried, enfants)
    const taux = isCadre ? TAUX_CADRE : TAUX_NON_CADRE
    const annualFactor = is13thMonth ? 13 : 12

    const r = useMemo(() => {
        const raw = parseFloat(montant.replace(/\s/g, '').replace(',', '.')) || 0
        const inputFactor = isAnnual ? annualFactor : 1
        const monthlyInput = raw / inputFactor

        const brut = mode === 'brut' ? monthlyInput : monthlyInput / (1 - taux)
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
            net,
            netAnnuel: net * annualFactor,
            impotMensuel,
            impotAnnuel,
            coutEmployeur,
            tauxPrelevement: brut > 0 ? ((cotisations + impotMensuel) / brut) * 100 : 0,
            pouvoirAchat: brut > 0 ? (net / brut) * 100 : 0
        }
    }, [montant, isAnnual, annualFactor, mode, taux, parts, isCadre])

    const inc = [100, 300, 500].map(v => {
        const b = r.brut + v
        const cot = b * taux
        const netAvant = b - cot
        const imp = calculerImpot(netAvant * annualFactor, parts) / annualFactor
        const net = netAvant - imp
        return { brutPlus: v, net, delta: net - r.net }
    })

    const cotPct = r.brut > 0 ? (r.cotisations / r.brut) * 100 : 0
    const netPct = r.brut > 0 ? (r.net / r.brut) * 100 : 0

    return (
        <div className="shell">
            <header className="topbar">
                <div className="logo">Brut<span>Net</span></div>
                <div className="chip">🇫🇷 Simulateur salaire France</div>
                <nav className="nav">À propos &nbsp; Méthodologie &nbsp; Ressources</nav>
            </header>

            <main className="page">
                <section className="hero">
                    <div className="left">
                        <h1>Calculez votre<br />salaire net</h1>
                        <p>Simulateur intelligent • France 2025</p>
                    </div>
                    <div className="center">
                        <div className="seg">
                            <button className={!isAnnual ? 'on' : ''} onClick={() => setIsAnnual(false)}>Mensuel</button>
                            <button className={isAnnual ? 'on' : ''} onClick={() => setIsAnnual(true)}>Annuel</button>
                        </div>
                        <input value={montant} onChange={e => setMontant(e.target.value.replace(/[^0-9]/g, ''))} />
                        <div className="unit">/ {isAnnual ? 'an' : 'mois'} en {mode}</div>
                        <div className="seg">
                            <button className={mode === 'brut' ? 'on' : ''} onClick={() => setMode('brut')}>Brut</button>
                            <button className={mode === 'net' ? 'on' : ''} onClick={() => setMode('net')}>Net</button>
                        </div>
                    </div>
                    <div className="kpi card">
                        <h3>Votre salaire net après impôts</h3>
                        <div className="v">{fmt(r.net)} € <small>/ mois</small></div>
                        <div className="sub">{fmt(r.netAnnuel)} € / an</div>
                        <div className="kpi-row">
                            <div><span>Taux de prélèvement</span><strong>{r.tauxPrelevement.toFixed(1)} %</strong></div>
                            <div><span>Pouvoir d’achat</span><strong className="green">+{r.pouvoirAchat.toFixed(1)} %</strong></div>
                            <div><span>Coût employeur</span><strong>{fmt(r.coutEmployeur)} €</strong></div>
                        </div>
                    </div>
                </section>

                <section className="config card">
                    <h2>Configuration</h2>
                    <div className="grid4">
                        <div><label>Statut professionnel</label><div className="seg"><button className={!isCadre ? 'on' : ''} onClick={() => setIsCadre(false)}>Non-cadre</button><button className={isCadre ? 'on' : ''} onClick={() => setIsCadre(true)}>Cadre</button></div></div>
                        <div><label>Situation familiale</label><div className="seg"><button className={!isMarried ? 'on' : ''} onClick={() => setIsMarried(false)}>Célibataire</button><button className={isMarried ? 'on' : ''} onClick={() => setIsMarried(true)}>Marié / Pacsé</button></div></div>
                        <div><label>Enfants à charge</label><div className="counter"><button onClick={() => setEnfants(Math.max(0, enfants - 1))}>−</button><b>{enfants}</b><button onClick={() => setEnfants(enfants + 1)}>+</button></div></div>
                        <div><label>Options</label><label className="check"><input type="checkbox" checked={is13thMonth} onChange={e => setIs13thMonth(e.target.checked)} />13ème mois</label></div>
                    </div>
                </section>

                <section className="triple">
                    <div className="card">
                        <h2>Répartition du salaire brut</h2>
                        <div className="donut" style={{ ['--p' as any]: `${netPct}%` }}><span>{fmt(r.brut)} €<small>Brut</small></span></div>
                        <ul className="list">
                            <li><span>Salaire net après impôts</span><b>{fmt(r.net)} €</b><em>{netPct.toFixed(1)} %</em></li>
                            <li><span>Cotisations sociales</span><b>{fmt(r.cotisations)} €</b><em>{cotPct.toFixed(1)} %</em></li>
                            <li><span>Impôt sur le revenu</span><b>{fmt(r.impotMensuel)} €</b><em>{(100 - netPct - cotPct).toFixed(1)} %</em></li>
                        </ul>
                    </div>
                    <div className="card">
                        <h2>Récapitulatif</h2>
                        <ul className="list">
                            <li><span>Salaire brut</span><b>{fmt(r.brut)} €</b></li>
                            <li><span>Cotisations sociales</span><b>-{fmt(r.cotisations)} €</b></li>
                            <li><span>Impôt sur le revenu</span><b>-{fmt(r.impotMensuel)} €</b></li>
                        </ul>
                        <div className="total">Net après impôts <b>{fmt(r.net)} € <small>/ mois</small></b><small>{fmt(r.netAnnuel)} € / an</small></div>
                    </div>
                    <div className="card">
                        <h2>Et si vous gagniez plus ?</h2>
                        <div className="inc-grid">
                            {inc.map((x, i) => <article key={x.brutPlus} className={i === 1 ? 'focus' : ''}><h4>+ {x.brutPlus} € / mois</h4><strong>{fmt(x.net)} €</strong><span>net après impôts</span><p>+ {fmt(x.delta)} € / mois</p></article>)}
                        </div>
                    </div>
                </section>

                <section className="employer card">
                    <h2>Coût pour l’employeur</h2>
                    <div className="row">
                        <div><span>Salaire brut</span><b>{fmt(r.brut)} €</b></div>
                        <div><span>Charges patronales</span><b>{fmt(r.coutEmployeur - r.brut)} €</b></div>
                        <div><span>Coût total employeur</span><b>{fmt(r.coutEmployeur)} € / mois</b></div>
                    </div>
                </section>
            </main>
        </div>
    )
}
