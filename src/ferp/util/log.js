class Log {
  constructor(parent = console) {
    this.setParent(parent);
  }

  setParent(parent = console) {
    this.parent = parent;
  }

  stdwarn(...params) {
    this.parent.warn(...params);
  }

  stdout(...params) {
    this.parent.log(...params);
  }

  stderr(...params) {
    this.parent.error(...params);
  }
}

export const log = new Log();
