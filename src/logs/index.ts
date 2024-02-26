import type { CondensedKibanaLog, KibanaLog } from "./types";

export const startingLogs = [
  "ExternalAPICallRequest",
  "InternalAPICallRequest",
  "RequestReceived",
  "DBQueryRequest",
  "FunctionCalled",
];

export const endingLogs = [
  "ExternalAPICallResponse",
  "InternalAPICallResponse",
  "ResponseReturned",
  "DBQueryResult",
  "FunctionCallResult",
];

export const errorLogs = ["Exception", "Error"];
export const ignoreLogs = ["Info"];

export function logToCondensedLog(log: KibanaLog): CondensedKibanaLog {
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

export function sortLogs(unsortedLogs: KibanaLog[]): KibanaLog[] {
  const sortedLogs = unsortedLogs.sort((a, b) => {
    const aCounter = parseInt(
      a["_source"]["message"].split("|")[0].split(" ")[3]
    );
    const bCounter = parseInt(
      b["_source"]["message"].split("|")[0].split(" ")[3]
    );
    return aCounter - bCounter;
  });
  return sortedLogs;
}

export function validateSortedLogs(sortedLogs: KibanaLog[]) {
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

export function validateFunctionCalls(sortedLogs : KibanaLog[]) : boolean {
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
        return false;
      }
      const latestLog = stack[index];
      const cIndex = startingLogs.indexOf(latestLog.logType.trim());
      if (cIndex === -1) {
        return false;
      }
      const cLogType = endingLogs[cIndex];
      if (
        cLogType !== condensedLog.logType.trim() ||
        latestLog.functionName !== condensedLog.functionName
      ) {
        return false;
      }
      stack.pop();
      index -= 1;
    }
  }
  return index === -1;
}

