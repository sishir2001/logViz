import Node from "../dataStructures/functionHierarchyTree";
import { KibanaLog } from "../types";
import { createDirectory, executeCommand, writeFileAsync } from "../utils/externalInteractions";
import {
  endingLogs,
  logToCondensedLog,
  startingLogs,
} from "../utils/logProcessing";

function createNodeMermaid(id : string , name : string) : string {
  return `${id}((${name}))`;
}

function createLinkBtwNodesMermaid(node1 : string , node2 : string ) {
  return `      ${node1} --> ${node2}\n`;
}

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


function traverseAndConstructMermaidTree(root : Node, res : string) : string {
  if (root === null) {
    return res;
  }
  const rootNodeMermaid = createNodeMermaid(
    root.treeLog.id,
    root.treeLog.functionName
  );
  for (const child of root.children) {
    const childNodeMermaid = createNodeMermaid(
      child.treeLog.id,
      child.treeLog.functionName
    );
    const linkedMermaid = createLinkBtwNodesMermaid(
      rootNodeMermaid,
      childNodeMermaid
    );
    res += linkedMermaid;
    res = traverseAndConstructMermaidTree(child, res);
  }
  return res;
}


export async function convertTreeToMermaid(root : Node) {
  const iter = "iter0";
  const initMermaid = `flowchart TD\n`;
  const interMermaid = traverseAndConstructMermaidTree(root, initMermaid);
  const resultMermaid = `\`\`\`mermaid\n    %%{init: {'theme':'forest'}}%%\n    ${interMermaid}\`\`\``;
  await createDirectory(`./generated/${iter}`,true);
  await writeFileAsync(`./generated/${iter}/functionTree.md`, resultMermaid);
  console.log("Mermaid file creation started ....");
  try{
    executeCommand(`mmdc -i ./generated/${iter}/functionTree.md -o ./generated/${iter}/functionTree.svg`);
    console.log("Mermaid file creation ended succeded....");
  }
  catch(e){
    console.log(e);
  }
}