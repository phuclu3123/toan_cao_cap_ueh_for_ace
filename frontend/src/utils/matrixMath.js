export function minorMatrix(matrix, row, column) {
  return matrix.filter((_, i) => i !== row).map(values => values.filter((_, j) => j !== column));
}
export function determinant(matrix) {
  if (matrix.length === 0) return 1;
  if (matrix.length === 1) return matrix[0][0];
  if (matrix.some(row => row.length !== matrix.length)) throw new Error('A determinant requires a square matrix');
  return matrix[0].reduce((sum, value, j) => sum + (-1) ** j * value * determinant(minorMatrix(matrix, 0, j)), 0);
}
export function cofactorMatrix(matrix) {
  return matrix.map((row, i) => row.map((_, j) => (-1) ** (i + j) * determinant(minorMatrix(matrix, i, j))));
}
export function adjugate(matrix) {
  const cofactors = cofactorMatrix(matrix);
  return cofactors[0].map((_, j) => cofactors.map(row => row[j]));
}
export function multiplyMatrices(a, b) {
  if (a[0].length !== b.length) throw new Error('Incompatible matrix dimensions');
  return a.map(row => b[0].map((_, j) => row.reduce((sum, value, k) => sum + value * b[k][j], 0)));
}
export const matrixTex = matrix => `\\begin{pmatrix}${matrix.map(row => row.join('&')).join('\\\\')}\\end{pmatrix}`;
