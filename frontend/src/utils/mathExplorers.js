import { adjugate, determinant as det } from './matrixMath.js';
export function solveLeontief(a, demand) {
  if (!a.length || a.length !== demand.length || a.some(row => row.length !== a.length)) throw new Error('Invalid Leontief dimensions');
  const balance = a.map((row, i) => row.map((value, j) => (i === j ? 1 : 0) - value));
  const determinant = det(balance);
  if (Math.abs(determinant) < 1e-10) return null;
  const inverseNumerator = adjugate(balance);
  const output = inverseNumerator.map(row => row.reduce((sum, value, j) => sum + value * demand[j], 0) / determinant);
  return { output, transactions: a.map(row => row.map((coefficient, column) => coefficient * output[column])), determinant };
}
export function marginalCost(quantity, change) {
  const cost = value => 20 + 2 * value + 0.02 * value ** 2;
  const marginal = 2 + 0.04 * quantity;
  return { cost: cost(quantity), marginal, approximate: marginal * change, actual: cost(quantity + change) - cost(quantity) };
}
export function cobbDouglas(capital, labor) {
  const output = 10 * Math.sqrt(capital * labor);
  return { output, capitalMarginal: output / (2 * capital), laborMarginal: output / (2 * labor) };
}
export const transpose = matrix => matrix[0].map((_, column) => matrix.map(row => row[column]));
