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
const errorLogs = [ "Exception", "Error" ];
const ignoreLogs = [ "Info" ];

function sortLogs(unsortedLogs) {
  const sortedLogs = unsortedLogs.sort((a, b) => {
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
        sortedLogs[i]["_source"]["message"].split("|")[0].split(" ")[3]);
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
    id : id,
    timestamp : array[0],
    logMode : array[6],
    logType : array[7],
    functionName : array[8],
    logMessage : array[9],
  };
  return condensedLog;
}

function validateFunctionCalls(sortedLogs) {
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
      const cIndex = startingLogs.indexOf(latestLog.logType.trim());
      if (cIndex === -1) {
        console.log("latestLog", latestLog);
        console.log("currentLog", condensedLog);
        return false;
      }
      const cLogType = endingLogs[cIndex];
      if (cLogType !== condensedLog.logType.trim() ||
          latestLog.functionName !== condensedLog.functionName) {
        console.log("latestLog", latestLog);
        console.log("currentLog", condensedLog);
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

module.exports = {
  startingLogs,
  endingLogs,
  errorLogs,
  ignoreLogs,
  sortLogs,
  validateSortedLogs,
  logToCondensedLog,
  validateFunctionCalls,
  printCondensedLogs
};
