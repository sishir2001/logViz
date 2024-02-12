const { readFileAsync } = require("./utils/externalInteractions");
const { validateFunctionCalls } = require("./utils/logProcessing");
const {
  buildFunctionHierarchyTree,
  convertTreeToMermaid,
} = require("./mermaid/flowchart");

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
  const sortedLogs = await readFileAsync("./src/logsJSON/sortedLogs.json"); // TODO : read file path from command
  // line
  const sortedLogsJson = JSON.parse(sortedLogs);
  if (!validateFunctionCalls(sortedLogsJson)) {
    console.log("Functions called are not in right order");
  }
  console.log(
    "Functions called are in right order , ready to build function hierarchy tree",
  );
  // const root = buildFunctionHierarchyTree(sortedLogs);
  const root = buildFunctionHierarchyTree(sortedLogsJson);
  await convertTreeToMermaid(root);
}

main();
