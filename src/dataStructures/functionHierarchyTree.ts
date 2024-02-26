import { CondensedKibanaLog } from "../types";

interface TreeLog {
  id: string;
  timestamp: string;
  functionName: string;
  logMessage: string;
}

class Node {
  treeLog: TreeLog;
  children: Node[];
  duration: number;
  parent: Node | null;

  constructor(condensedLog: CondensedKibanaLog) {
    this.treeLog = this.condensedLogToTreeLog(condensedLog);
    this.children = [];
    this.duration = -1; // -1 denotes not yet calculated
    this.parent = null;
  }
  condensedLogToTreeLog(condensedLog: CondensedKibanaLog): TreeLog {
    return {
      id: condensedLog.id,
      timestamp: condensedLog.timestamp.split(" ")[0],
      functionName: condensedLog.functionName,
      logMessage: condensedLog.logMessage,
    };
  }

  addChild(node: Node): void {
    this.children.push(node);
    node.parent = this;
  }
}

export default Node;