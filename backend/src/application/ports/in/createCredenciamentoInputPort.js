// Entry port: orchestrates public identity creation for event credentialing.
// Expected flow: validate payload -> create identity/credential -> trigger side effects.
export class CreateCredenciamentoInputPort {
  // eslint-disable-next-line no-unused-vars
  async execute(payload, actor) {
    throw new Error("CreateCredenciamentoInputPort.execute nao implementado");
  }
}
