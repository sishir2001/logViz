import { readFile, writeFile, mkdir } from "fs/promises";
import { exec as execCallback } from "child_process";
import { promisify } from "util";

const exec = promisify(execCallback);

export async function readFileAsync(filePath: string): Promise<string | null> {
  try {
    const data = await readFile(filePath, "utf-8");
    return data;
  } catch (error: any) {
    console.error(`Got an error trying to read the file: ${error.message}`);
    return null;
  }
}

export async function writeFileAsync(filePath: string, data: string): Promise<void> {
  try {
    await writeFile(filePath, data);
  } catch (error: any) {
    console.error(`Got an error trying to write the file: ${error.message}`);
  }
}

export async function createDirectory(
  path: string,
  isRecursive: boolean = false
): Promise<void> {
  try {
    mkdir(path, { recursive: isRecursive });
  } catch (err: any) {
    console.error(`Got an error trying to create a directory: ${err.message}`);
  }
}

export async function executeCommand(command: string) {
  try {
    const { stdout, stderr } = await exec(command);
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  } catch (err: any) {
    console.error(`Got an error trying to execute the command: ${err.message}`);
  }
}
