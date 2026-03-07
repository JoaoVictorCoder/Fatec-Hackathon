import { buildCreateCredenciamentoOutputPorts } from "../ports/out/createCredenciamentoOutputPorts.js";

export class CreateCredenciamentoUseCase {
  constructor(adapters) {
    this.adapters = buildCreateCredenciamentoOutputPorts(adapters);
  }

  async execute(payload, actor) {
    const created = await this.adapters.createCredenciamento(payload, actor);

    // Background process by design (does not block checkout flow).
    this.adapters.enqueueDescarbonizacaoProcess(created);

    return created;
  }
}
