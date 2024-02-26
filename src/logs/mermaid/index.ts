
import Node from "../node";
function createNodeMermaid(id : string , name : string) : string {
  return `${id}((${name}))`;
}

function createLinkBtwNodesMermaid(node1 : string , node2 : string ) {
  return `      ${node1} --> ${node2}\n`;
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


export function convertTreeToMermaid(root : Node) : string {
  const iter = "iter0";
  const initMermaid = `flowchart TD\n`;
  const interMermaid = traverseAndConstructMermaidTree(root, initMermaid);
  const resultMermaid = `\`\`\`mermaid\n    %%{init: {'theme':'forest'}}%%\n    ${interMermaid}\`\`\``;
  return resultMermaid;
//   await createDirectory(`./generated/${iter}`,true);
//   await writeFileAsync(`./generated/${iter}/functionTree.md`, resultMermaid);
//   console.log("Mermaid file creation started ....");
//   try{
//     executeCommand(`mmdc -i ./generated/${iter}/functionTree.md -o ./generated/${iter}/functionTree.svg`);
//     console.log("Mermaid file creation ended succeded....");
//   }
//   catch(e){
//     console.log(e);
//   }
}