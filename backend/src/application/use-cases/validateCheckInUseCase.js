export class ValidateCheckInUseCase {
  constructor({ validateAndCheckIn }) {
    this.validateAndCheckIn = validateAndCheckIn;
  }

  async execute(payload, actor) {
    return this.validateAndCheckIn(payload, actor);
  }
}
