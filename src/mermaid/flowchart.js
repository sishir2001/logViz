const {startingLogs, endingLogs, logToCondensedLog} =
    require("../utils/logProcessing");
const {writeFileAsync, createDirectory, executeCommand} =
    require("../utils/externalInteractions");
const Node = require("../data-structures/functionHierarchyTree");

function createNodeMermaid(id, name) { return `${id}((${name}))`; }

function createLinkBtwNodesMermaid(node1, node2) {
  return `      ${node1} --> ${node2}\n`;
}

function buildFunctionHierarchyTree(logs) {
  let root = null, currNode = null;
  for (const log of logs) {
    const condensedLog = logToCondensedLog(log);
    if (startingLogs.includes(condensedLog.logType.trim())) {
      if (root === null) {
        root = new Node(condensedLog);
        currNode = root;
      } else {
        const newNode = new Node(condensedLog);
        currNode.addChild(newNode);
        currNode = newNode;
      }
    } else if (endingLogs.includes(condensedLog.logType.trim())) {
      const eTimestamp = new Date(condensedLog.timestamp.split(" ")[0]);
      const sTimestamp = new Date(currNode.treeLog.timestamp);
      const duration = eTimestamp - sTimestamp;
      currNode.duration = duration;
      currNode = currNode.parent;
    }
  }
  return root;
}

function traverseAndConstructMermaidTree(root, res) {
  if (root === null) {
    return res;
  }
  const rootNodeMermaid =
      createNodeMermaid(root.treeLog.id, root.treeLog.functionName);
  for (const child of root.children) {
    const childNodeMermaid =
        createNodeMermaid(child.treeLog.id, child.treeLog.functionName);
    const linkedMermaid =
        createLinkBtwNodesMermaid(rootNodeMermaid, childNodeMermaid);
    res += linkedMermaid;
    res = traverseAndConstructMermaidTree(child, res);
  }
  return res;
}

async function convertTreeToMermaid(root) {
  const iter = "iter0";
  const initMermaid = `flowchart TD\n`;
  const interMermaid = traverseAndConstructMermaidTree(root, initMermaid);
  const resultMermaid =
      `\`\`\`mermaid\n    %%{init: {'theme':'forest'}}%%\n    ${
          interMermaid}\`\`\``;
  await createDirectory(`./generated/${iter}`, true);
  await writeFileAsync(`./generated/${iter}/functionTree.md`, resultMermaid);
  console.log("Mermaid file creation started ....");
  try {
    executeCommand(`mmdc -i ./generated/${
        iter}/functionTree.md -o ./generated/${iter}/functionTree.svg`);
    console.log("Mermaid file creation ended succeded....");
  } catch (e) {
    console.log(e);
  }
}

module.exports = {
  convertTreeToMermaid,
  buildFunctionHierarchyTree
};