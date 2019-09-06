/** Helper class for processing a mark stream (which is what the rawParser returns).
 * 
 * @private
 */
class MarkProcessor {
  constructor(visitor, string, marks) {
    this.visitor = visitor;
    this.string = string;
    this.marks = marks;
    this.index = 0;
  }

  hasMark(pos = 0) {
    return this.index + pos < this.marks.length;
  }

  getMark(pos = 0) {
    return this.marks[this.index + pos];
  }

  shift() {
    this.index += 1;
  }

  process() {
    let mark = this.marks[this.index];
    this.shift();
    let func = this.visitor[mark.name];
    if (!func) throw new Error("Unknown handler: " + mark.name);
    return func.call(this.visitor, this, mark);
  }

  processString() {
    this.shift();
    return this.processStringEnd();
  }

  processStringEnd() {
    let prev = this.marks[this.index - 1];
    let curr = this.marks[this.index];
    this.shift();
    return this.string.slice(prev.position, curr.position);
  }
}

module.exports = MarkProcessor;
