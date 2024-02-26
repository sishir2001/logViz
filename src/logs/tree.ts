import { endingLogs, logToCondensedLog, startingLogs } from ".";
import Node from "./node";
import type { KibanaLog } from "./types";

export function buildFunctionHierarchytree(logs: KibanaLog[]): Node | null {
  let root: Node | null = null;
  let currNode: Node | null = root;
  for (const log of logs) {
    const condensedLog = logToCondensedLog(log);
    if (startingLogs.includes(condensedLog.logType.trim())) {
      if (root === null) {
        root = new Node(condensedLog);
        currNode = root;
      } else {
        const newNode = new Node(condensedLog);
        if (currNode !== null) {
          currNode.addChild(newNode);
          currNode = newNode;
        } else {
          console.log("Error in building function hierarchy tree");
          return null;
        }
      }
    } else if (endingLogs.includes(condensedLog.logType.trim())) {
      const eTimestamp = new Date(condensedLog.timestamp.split(" ")[0]);
      if (currNode !== null) {
        const sTimestamp = new Date(currNode.treeLog.timestamp);
        const duration = eTimestamp.getTime() - sTimestamp.getTime();
        currNode.treeLog.endLog = condensedLog.logMessage;
        currNode.duration = duration;
        currNode = currNode.parent;
      } else {
        console.log("Error in building function hierarchy tree");
        return null;
      }
    }
  }
  return root;
}
