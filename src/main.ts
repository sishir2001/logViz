import { KibanaLog, decodeKibanaLog } from "./types";
import { readFileAsync } from "./utils/externalInteractions";
import { decodeArray } from "./type-decoder";
import { validateFunctionCalls } from "./utils/logProcessing";
import { buildFunctionHierarchytree, convertTreeToMermaid } from "./mermaid/flowChart";

async function main() {
  const sortedLogs = await readFileAsync("./src/logsJSON/sortedLogs.json");
  if (sortedLogs !== null) {
    const sortedLogsJSON = JSON.parse(sortedLogs);
    const decodedSortedLogs = decodeArray<KibanaLog>(
      sortedLogsJSON,
      decodeKibanaLog
    );
    if (decodedSortedLogs !== null) {
      if (!validateFunctionCalls(decodedSortedLogs)) {
        console.log("Function calls are not in right order ... Exiting ...");
      }
      console.log(
        "Functions called are in right order , ready to build function hierarchy tree"
      );
      const functionHierarchyTreeRoot = buildFunctionHierarchytree(decodedSortedLogs);
      if(functionHierarchyTreeRoot !== null) {
        console.log("Function hierarchy tree built successfully");
        await convertTreeToMermaid(functionHierarchyTreeRoot);
      }
      else{
        console.log("Error building functionCallHierarchyTree ... Exiting ...");
      }
    }
  } else {
    console.log("Error reading the logsFile ... Exiting ..");
  }
}

main();
