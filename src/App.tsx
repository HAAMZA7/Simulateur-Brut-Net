import { useMemo, useState } from 'react'
import './index.css'

type InputMode = 'brut' | 'net'

const RATES = {
    nonCadre: 0.22,
    cadre: 0.255,
    employerNonCadre: 0.42,
    employerCadre: 0.45
} as const

const TAX_BRACKETS = [
    { min: 0, max: 11497, rate: 0 },
    { min: 11497, max: 29315, rate: 0.11 },
    { min: 29315, max: 83823, rate: 0.3 },
    { min: 83823, max: 180294, rate: 0.41 },
    { min: 180294, max: Infinity, rate: 0.45 }
] as const

const eur = (n: number) =>
    n.toLocaleString('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })

function familyParts(isMarried: boolean, children: number) {
    let parts = isMarried ? 2 : 1
    if (children >= 1) parts += 0.5
    if (children >= 2) parts += 0.5
    if (children >= 3) parts += children - 2
    return parts
}

function annualTax(netTaxableAnnual: number, parts: number) {
    const quotient = netTaxableAnnual / parts
    let taxPerPart = 0

    for (const bracket of TAX_BRACKETS) {
        if (quotient > bracket.min) {
            const slice = Math.min(quotient, bracket.max) - bracket.min
            taxPerPart += slice * bracket.rate
        }
    }

    return taxPerPart * parts
}

export default function App() {
    const [amount, setAmount] = useState('3000')
    const [isAnnualInput, setIsAnnualInput] = useState(false)
    const [inputMode, setInputMode] = useState<InputMode>('brut')
    const [isCadre, setIsCadre] = useState(false)
    const [isMarried, setIsMarried] = useState(false)
    const [children, setChildren] = useState(0)
    const [month13, setMonth13] = useState(false)

    const calculation = useMemo(() => {
        const clean = Number.parseFloat(amount.replace(/\s/g, '').replace(',', '.')) || 0
        const activeMonths = month13 ? 13 : 12
        const sourceFactor = isAnnualInput ? activeMonths : 1
        const monthlyIn = clean / sourceFactor

        const employeeRate = isCadre ? RATES.cadre : RATES.nonCadre
        const employerRate = isCadre ? RATES.employerCadre : RATES.employerNonCadre

        const grossMonthly = inputMode === 'brut' ? monthlyIn : monthlyIn / (1 - employeeRate)
        const socialContrib = grossMonthly * employeeRate
        const netBeforeTax = grossMonthly - socialContrib

        const parts = familyParts(isMarried, children)
        const taxAnnual = annualTax(netBeforeTax * activeMonths, parts)
        const taxMonthly = taxAnnual / activeMonths
        const netAfterTax = netBeforeTax - taxMonthly

        const employerCost = grossMonthly * (1 + employerRate)
        const netShare = grossMonthly > 0 ? (netAfterTax / grossMonthly) * 100 : 0
        const socialShare = grossMonthly > 0 ? (socialContrib / grossMonthly) * 100 : 0
        const taxShare = grossMonthly > 0 ? (taxMonthly / grossMonthly) * 100 : 0

        return {
            activeMonths,
            grossMonthly,
            grossAnnual: grossMonthly * activeMonths,
            socialContrib,
            netBeforeTax,
            taxMonthly,
            taxAnnual,
            netAfterTax,
            netAfterTaxAnnual: netAfterTax * activeMonths,
            employerCost,
            effectiveRate: socialShare + taxShare,
            netShare,
            socialShare,
            taxShare
        }
    }, [amount, isAnnualInput, inputMode, isCadre, isMarried, children, month13])

    const raises = useMemo(() => {
        const plusValues = [100, 300, 500]
        return plusValues.map((plus) => {
            const gross = calculation.grossMonthly + plus
            const employeeRate = isCadre ? RATES.cadre : RATES.nonCadre
            const netBeforeTax = gross * (1 - employeeRate)
            const parts = familyParts(isMarried, children)
            const tax = annualTax(netBeforeTax * calculation.activeMonths, parts) / calculation.activeMonths
            const net = netBeforeTax - tax
            return {
                plus,
                net,
                delta: net - calculation.netAfterTax
            }
        })
    }, [calculation.activeMonths, calculation.grossMonthly, calculation.netAfterTax, isCadre, isMarried, children])

    return (
        <div className="app-shell">
            <header className="top-header">
                <h1>Brut<span>Net</span></h1>
                <p>Webapp de simulation salaire • France 2025</p>
            </header>

            <main className="grid">
                <section className="card hero">
                    <div>
                        <h2>Calculez votre salaire net</h2>
                        <p>Une vraie webapp : claire, rapide, et exploitable au quotidien.</p>
                    </div>

                    <div className="segmented">
                        <button type="button" className={!isAnnualInput ? 'on' : ''} onClick={() => setIsAnnualInput(false)}>Mensuel</button>
                        <button type="button" className={isAnnualInput ? 'on' : ''} onClick={() => setIsAnnualInput(true)}>Annuel</button>
                    </div>

                    <input
                        value={amount}
                        onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                        inputMode="numeric"
                        aria-label="Montant"
                        className="amount"
                    />
                    <p className="sub">€ / {isAnnualInput ? 'an' : 'mois'} en {inputMode}</p>

                    <div className="segmented">
                        <button type="button" className={inputMode === 'brut' ? 'on' : ''} onClick={() => setInputMode('brut')}>Brut</button>
                        <button type="button" className={inputMode === 'net' ? 'on' : ''} onClick={() => setInputMode('net')}>Net</button>
                    </div>
                </section>

                <section className="card kpi">
                    <span>Net après impôts</span>
                    <strong>{eur(calculation.netAfterTax)} €</strong>
                    <small>{eur(calculation.netAfterTaxAnnual)} € / an</small>
                    <div className="mini-kpi">
                        <div><span>Taux effectif</span><b>{calculation.effectiveRate.toFixed(1)}%</b></div>
                        <div><span>Pouvoir d’achat</span><b className="ok">{calculation.netShare.toFixed(1)}%</b></div>
                        <div><span>Coût employeur</span><b>{eur(calculation.employerCost)} €</b></div>
                    </div>
                </section>

                <section className="card full">
                    <h3>Configuration</h3>
                    <div className="controls">
                        <div>
                            <label>Statut</label>
                            <div className="segmented">
                                <button type="button" className={!isCadre ? 'on' : ''} onClick={() => setIsCadre(false)}>Non-cadre</button>
                                <button type="button" className={isCadre ? 'on' : ''} onClick={() => setIsCadre(true)}>Cadre</button>
                            </div>
                        </div>

                        <div>
                            <label>Situation</label>
                            <div className="segmented">
                                <button type="button" className={!isMarried ? 'on' : ''} onClick={() => setIsMarried(false)}>Célibataire</button>
                                <button type="button" className={isMarried ? 'on' : ''} onClick={() => setIsMarried(true)}>Marié / Pacsé</button>
                            </div>
                        </div>

                        <div>
                            <label>Enfants</label>
                            <div className="counter">
                                <button type="button" onClick={() => setChildren((v) => Math.max(0, v - 1))}>−</button>
                                <b>{children}</b>
                                <button type="button" onClick={() => setChildren((v) => v + 1)}>+</button>
                            </div>
                        </div>

                        <div>
                            <label>Option</label>
                            <label className="checkbox">
                                <input type="checkbox" checked={month13} onChange={(e) => setMonth13(e.target.checked)} />
                                13ème mois
                            </label>
                        </div>
                    </div>
                </section>

                <section className="card">
                    <h3>Récapitulatif</h3>
                    <ul className="rows">
                        <li><span>Brut mensuel</span><b>{eur(calculation.grossMonthly)} €</b></li>
                        <li><span>Cotisations</span><b>-{eur(calculation.socialContrib)} €</b></li>
                        <li><span>Impôt mensuel</span><b>-{eur(calculation.taxMonthly)} €</b></li>
                        <li className="total"><span>Net après impôts</span><b>{eur(calculation.netAfterTax)} €</b></li>
                    </ul>
                </section>

                <section className="card">
                    <h3>Répartition</h3>
                    <div className="split" style={{ ['--net' as string]: `${calculation.netShare}%`, ['--social' as string]: `${calculation.socialShare}%` }}>
                        <div className="hole">
                            <b>{eur(calculation.grossMonthly)} €</b>
                            <small>Brut</small>
                        </div>
                    </div>
                    <ul className="legend">
                        <li><span className="dot net" />Net: {calculation.netShare.toFixed(1)}%</li>
                        <li><span className="dot social" />Cotisations: {calculation.socialShare.toFixed(1)}%</li>
                        <li><span className="dot tax" />Impôt: {calculation.taxShare.toFixed(1)}%</li>
                    </ul>
                </section>

                <section className="card full">
                    <h3>Simulation d’augmentation</h3>
                    <div className="raise-grid">
                        {raises.map((raise) => (
                            <article key={raise.plus} className="raise">
                                <small>+ {raise.plus} € brut / mois</small>
                                <strong>{eur(raise.net)} €</strong>
                                <p>+ {eur(raise.delta)} € net / mois</p>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}
