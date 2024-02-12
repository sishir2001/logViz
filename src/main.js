const fs = require("fs").promises;
const { exec } = require("child_process");

// ** Tree structure
class Node {
  constructor(condensedLog) {
    this.treeLog = this.condensedLogToTreeLog(condensedLog);
    this.children = [];
    this.duration = -1; // -1 denotes not yet calculated
    this.parent = null;
  }

  condensedLogToTreeLog(condensedLog) {
    return {
      id: condensedLog.id,
      timestamp: condensedLog.timestamp.split(" ")[0],
      functionName: condensedLog.functionName,
      logMessage: condensedLog.logMessage,
    };
  }

  addChild(node) {
    this.children.push(node);
    node.parent = this;
  }
}

// ** constants for log types
const startingLogs = [
  "ExternalAPICallRequest",
  "InternalAPICallRequest",
  "RequestReceived",
  "DBQueryRequest",
  "FunctionCalled",
];
const endingLogs = [
  "ExternalAPICallResponse",
  "InternalAPICallResponse",
  "ResponseReturned",
  "DBQueryResult",
  "FunctionCallResult",
];
const errorLogs = ["Exception", "Error"];
const ignoreLogs = ["Info"];

async function readFileAsync(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return data;
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}

async function writeFileAsync(filePath, data) {
  try {
    await fs.writeFile(filePath, data);
  } catch (error) {
    console.error(`Got an error trying to write to a file: ${error.message}`);
  }
}

async function createDirectory(path,isRecursive = false) {
  try {
    await fs.mkdir(path,{recursive: isRecursive});
  } catch (error) {
    console.error(
      `Got an error trying to create a directory: ${error.message}`
    );
  }
}

function executeCommand(command){
  exec(command,(error,stdout,stderr)=>{
    if(error){
      console.error(`error: ${error.message}`);
      return;
    }
    if(stderr){
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  })
}

function sortLogs(unsortedLogs) {
  const sortedLogs = unsortedLogs.sort((a, b) => {
    // TODO : need to sort according to the counter used in the logs
    const aCounter = a["_source"]["message"].split("|")[0].split(" ")[3];
    const bCounter = b["_source"]["message"].split("|")[0].split(" ")[3];
    return aCounter - bCounter;
  });
  return sortedLogs;
}

function validateSortedLogs(sortedLogs) {
  let prevCounter = -1;
  for (let i = 0; i < sortedLogs.length; i++) {
    const currentCounter = parseInt(
      sortedLogs[i]["_source"]["message"].split("|")[0].split(" ")[3]
    );
    if (currentCounter <= prevCounter) {
      return false;
    }
    prevCounter = currentCounter;
  }
  return true;
}

function logToCondensedLog(log) {
  const array = log["_source"]["message"].split("|");
  const id = log["_id"];
  // 0 - counter , 1 - sessionId , 2 - requestId , 3 - shopUrl
  // 4 - deployed pod name , 5 - service name , 6 - log mode , 7 - log type
  // 8 - function name , 9 - log message
  const condensedLog = {
    id: id,
    timestamp: array[0],
    logMode: array[6],
    logType: array[7],
    functionName: array[8],
    logMessage: array[9],
  };
  return condensedLog;
}

// ** Start mermaid functions
function createNodeMermaid(id, name) {
  return `${id}((${name}))`;
}

function createLinkBtwNodesMermaid(node1, node2) {
  return `      ${node1} --> ${node2}\n`;
}

// ** End mermaid functions

// ** Start Tree functions
function buildFunctionHierarchyTree(logs) {
  let root = null,
    currNode = null;
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
      // TODO : calculate the duration of the function
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

async function convertTreeToMermaid(root) {
  const iter = "iter0";
  const initMermaid = `flowchart TD\n`;
  const interMermaid = traverseAndConstructMermaidTree(root, initMermaid);
  const resultMermaid = `\`\`\`mermaid\n    ${interMermaid}\`\`\``;
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

// ** End Tree functions

function validateFunctionCalls(sortedLogs) {
  // TODO : use stack to push and pop function calls and validate the function calls
  // TODO : only store starting logs of the function in stack and pop them ending logs are encountered
  let stack = [];
  let index = -1;
  for (const log of sortedLogs) {
    const condensedLog = logToCondensedLog(log);

    if (startingLogs.includes(condensedLog["logType"].trim())) {
      // push into the stack
      stack.push(condensedLog);
      index += 1;
    } else if (endingLogs.includes(condensedLog["logType"].trim())) {
      // check the latest element and
      if (index == -1) {
        console.log("latestLog", latestLog);
        console.log("currentLog", condensedLog);
        return false;
      }
      const latestLog = stack[index];
      // TODO : need to check whether latestLog and the currentLog are complimentary ?
      const cIndex = startingLogs.indexOf(latestLog.logType.trim());
      if (cIndex === -1) {
        console.log("latestLog", latestLog);
        console.log("currentLog", condensedLog);
        return false;
      }
      const cLogType = endingLogs[cIndex];
      if (
        cLogType !== condensedLog.logType.trim() ||
        latestLog.functionName !== condensedLog.functionName
      ) {
        console.log("latestLog", latestLog);
        console.log("currentLog", condensedLog);
        // console.log(`cLogType : ${cLogType},condensedLog.logType : ${condensedLog.logType},index : ${index},cIndex : ${cIndex}`);
        return false;
      }
      stack.pop();
      index -= 1;
    }
  }
  return index === -1;
}

function printCondensedLogs(logs) {
  // let res = [];
  for (const log of logs) {
    // const log = logs[i];
    let array = log["_source"]["message"].split("|");
    array.pop();
    array.splice(0, 6);
    console.log(array);
    // const response = array.join("|");
    // console.log(array.join("|"));
    // res.push(response);
  }
  // return res;
}

async function main() {
    // const requestIdLogs = await readFileAsync("./src/logs/requestIdLogs.json");
    // const requestIdLogsJson = JSON.parse(requestIdLogs);
    // const hits = requestIdLogsJson["rawResponse"]["hits"]["hits"];
    // const sortedLogs = sortLogs(hits);
    // if (!validateSortedLogs(sortedLogs)) {
    //   console.log("Logs are not sorted properly");
    //   console.exit(1);
    // }
  //   // TODO : save the sortedLogs
  //   await writeFileAsync("./sortedLogs.json",JSON.stringify(sortedLogs));
  // TODO : read from sortedLogs.json

  const sortedLogs = await readFileAsync("./src/logs/sortedLogs.json");
  const sortedLogsJson = JSON.parse(sortedLogs);
  if (!validateFunctionCalls(sortedLogsJson)) {
    console.log("Functions called are not in right order");
  }
  console.log(
    "Functions called are in right order , ready to build function hierarchy tree"
  );
  // const root = buildFunctionHierarchyTree(sortedLogs);
  const root = buildFunctionHierarchyTree(sortedLogsJson);
  await convertTreeToMermaid(root);
}

main();
