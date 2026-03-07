export const categoryColors = Object.freeze({
  VISITANTE: "#1E5BD8",
  CAFEICULTOR: "#1D8A4D",
  EXPOSITOR: "#E07A10",
  IMPRENSA: "#7A3DB8",
  COMISSAO_ORGANIZADORA: "#C1272D",
  COLABORADOR_TERCEIRIZADO: "#6B7280"
});

export function getCategoryColor(categoria) {
  return categoryColors[categoria] || "#1F2937";
}
