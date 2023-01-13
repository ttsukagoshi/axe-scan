class mockOra {
  constructor() {
    this.text = '';
    this.isSpinning = false;
  }
  start(textMessage) {
    this.text = textMessage;
    this.isSpinning = true;
    console.info(`spinner started. Message: ${this.text}`);
    this.text = '';
  }
  stop() {
    this.isSpinning = false;
    return this;
  }
}

export default function ora() {
  return new mockOra();
}
