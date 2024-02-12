class Node {
  constructor(condensedLog) {
    this.treeLog = this.condensedLogToTreeLog(condensedLog);
    this.children = [];
    this.duration = -1; // -1 denotes not yet calculated
    this.parent = null;
  }

  condensedLogToTreeLog(condensedLog) {
    return {
      id : condensedLog.id,
      timestamp : condensedLog.timestamp.split(" ")[0],
      functionName : condensedLog.functionName,
      logMessage : condensedLog.logMessage,
    };
  }

  addChild(node) {
    this.children.push(node);
    node.parent = this;
  }
}

module.exports = Node;