const CONTRIBUTION_RATES = {
  'non-cadre': 0.23,
  'cadre': 0.25,
};

const TAX_BRACKETS = [
  { threshold: 180294, rate: 0.45 },
  { threshold: 83823, rate: 0.41 },
  { threshold: 29315, rate: 0.30 },
  { threshold: 11497, rate: 0.11 },
  { threshold: 0, rate: 0 },
];

export const calculateSalary = (grossSalary, status = 'non-cadre', period = 'monthly') => {
  if (isNaN(grossSalary) || grossSalary <= 0) {
    return {
      gross: 0,
      contributions: 0,
      netBeforeTax: 0,
      tax: 0,
      netAfterTax: 0,
    };
  }

  const annualGross = period === 'monthly' ? grossSalary * 12 : grossSalary;

  const contributionRate = CONTRIBUTION_RATES[status];
  const contributions = annualGross * contributionRate;
  const netBeforeTax = annualGross - contributions;

  let tax = 0;
  let remainingIncome = netBeforeTax;

  // This is a simplified tax calculation for a single person ("célibataire", 1 part fiscale).
  // A more accurate calculation would need to consider the "parts fiscales" and other deductions.
  for (const bracket of TAX_BRACKETS) {
    if (remainingIncome > bracket.threshold) {
      const taxableInBracket = remainingIncome - bracket.threshold;
      tax += taxableInBracket * bracket.rate;
      remainingIncome = bracket.threshold;
    }
  }


  const netAfterTax = netBeforeTax - tax;

  if (period === 'monthly') {
    return {
      gross: grossSalary,
      contributions: contributions / 12,
      netBeforeTax: netBeforeTax / 12,
      tax: tax / 12,
      netAfterTax: netAfterTax / 12,
    };
  }

  return {
    gross: grossSalary,
    contributions,
    netBeforeTax,
    tax,
    netAfterTax,
  };
};
