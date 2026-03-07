// Output port contracts are represented by injected adapter functions.
// Required adapters for this checkpoint:
// - createCredenciamento(payload, actor)
// - enqueueDescarbonizacaoProcess(credenciado)
export function buildCreateCredenciamentoOutputPorts(adapters) {
  return {
    createCredenciamento: adapters.createCredenciamento,
    enqueueDescarbonizacaoProcess: adapters.enqueueDescarbonizacaoProcess
  };
}
