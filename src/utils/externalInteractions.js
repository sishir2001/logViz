const fs = require("fs").promises;
const { exec } = require("child_process");

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

async function createDirectory(path, isRecursive = false) {
  try {
    await fs.mkdir(path, { recursive: isRecursive });
  } catch (error) {
    console.error(
      `Got an error trying to create a directory: ${error.message}`,
    );
  }
}

function executeCommand(command) {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}

module.exports = {
  readFileAsync,
  writeFileAsync,
  createDirectory,
  executeCommand,
};
