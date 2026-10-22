// Extrato de créditos montado do estado salvo: compras, bônus e criações (gerando ainda não debitou).
export function extrato(e) {
  const linhas = [
    ...(e?.compras ?? []).map((c) => ({ descricao: c.descricao, detalhe: 'Compra', creditos: c.creditos, data: c.data })),
    ...(e?.bonus ?? []).map((b) => ({ descricao: b.descricao, detalhe: 'Bônus', creditos: b.creditos, data: b.data })),
    ...(e?.criacoes ?? [])
      .filter((c) => c.status !== 'gerando')
      .map((c) => ({
        descricao: c.titulo,
        detalhe: c.status === 'falhou' ? 'Falhou, devolvido' : c.custo ? 'Criação pronta' : 'Refazer grátis',
        creditos: c.status === 'falhou' ? 0 : -c.custo || 0,
        data: c.criadoEm,
      })),
  ]
  return linhas.sort((a, b) => b.data - a.data)
}
