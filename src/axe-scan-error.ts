export class AxeScanError extends Error {
  constructor(message: string, exitCode = 1) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
    this.name = AxeScanError.name;
    process.exitCode = exitCode;
  }
}
