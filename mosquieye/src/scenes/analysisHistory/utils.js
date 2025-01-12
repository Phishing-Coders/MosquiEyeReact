export const NUMBER_HOUSES_INSPECTED = 10; // Adjust as needed
export const TOTAL_OVID_TRAPS = 10; // Adjust as needed

export const computeRiskLevel = (bi, moi) => {
  if (bi >= 20 || moi >= 40) return 'High';
  if (bi >= 5 || moi >= 10) return 'Medium';
  return 'Low';
};
