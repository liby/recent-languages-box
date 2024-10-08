import { exec } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

export interface FileData {
  additions?: number;
  changes?: number;
  deletions?: number;
  patch?: string;
  path: string;
  status: string;
}

interface LanguageDetails {
  size: number;
  percentage: string;
  files: string[];
}

interface LinguistResult {
  [language: string]: LanguageDetails;
}

export interface ProcessedLanguageStats {
  name: string;
  percent: number;
  additions: number;
  deletions: number;
  count: number;
}

const runCommand = (command: string): Promise<string> =>
  new Promise((resolve, reject) => {
    console.debug(`run > ${command}`);
    const child = exec(command);
    let stdout = '';
    let stderr = '';

    if (child.stdout) {
      child.stdout.on('data', (data) => {
        stdout += data;
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (data) => {
        stderr += data;
      });
    }

    child.on('close', (code) => {
      console.debug(`exited with code ${code}`);
      return code === 0 ? resolve(stdout) : reject(stderr);
    });
  });

const runCommandWithRetry = async (
  command: string,
  retries = 3,
): Promise<string> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await runCommand(command);
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(
        `Command failed, retrying (${i + 1}/${retries}): ${command}`,
      );
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 等待1秒后重试
    }
  }
  throw new Error(`Command failed after ${retries} retries: ${command}`);
};

const createDummyText = (count: number): string => {
  return '\n'.repeat(count);
};

const createFileContent = (fileData: FileData): string => {
  if (fileData.patch) {
    return fileData.patch
      .split('\n')
      .filter((line) => /^[-+]/.test(line))
      .map((line) => line.substring(1))
      .join('\n');
  }
  return fileData.changes ? createDummyText(fileData.changes) : '';
};

export const runLinguist = async (
  files: FileData[],
): Promise<ProcessedLanguageStats[]> => {
  try {
    await runCommand('git checkout --orphan temp && git rm -rf . && rm -rf *');

    const processFileData = files.map((file, index) => ({
      ...file,
      path: `${index}${path.extname(file.path)}`,
    }));

    const pathFileMap = processFileData.reduce<Record<string, FileData>>(
      (acc, file) => {
        acc[file.path] = file;
        return acc;
      },
      {},
    );

    await Promise.all([
      ...processFileData.map((file) =>
        writeFile(file.path, createFileContent(file)),
      ),
      await runCommandWithRetry(
        'echo "*.* linguist-detectable" > .gitattributes',
      ),
      await runCommandWithRetry(
        'git config user.name "dummy" && git config user.email "dummy@github.com"',
      ),
    ]);

    // Add files to git
    await runCommand('git add . && git commit -m "dummy"');

    // Run github-linguist
    const stdout = await runCommand('github-linguist --breakdown --json');
    const linguistResult = JSON.parse(stdout) as LinguistResult;

    // Process the language stats
    const languageStats = Object.entries(linguistResult).map(
      ([name, stats]) => {
        const additions = stats.files.reduce(
          (sum, filePath) => sum + (pathFileMap[filePath]?.additions ?? 0),
          0,
        );
        const deletions = stats.files.reduce(
          (sum, filePath) => sum + (pathFileMap[filePath]?.deletions ?? 0),
          0,
        );
        return {
          name,
          additions,
          deletions,
          count: stats.files.length,
          // Calculate initial percent based on the returned data
          percent: additions + deletions, // placeholder for percent, will be recalculated
        };
      },
    );

    // Calculate total additions and deletions across all languages
    const totalChanges = languageStats.reduce(
      (sum, lang) => sum + lang.additions + lang.deletions,
      0,
    );

    // Update the percent based on the total changes
    for (const lang of languageStats) {
      lang.percent = ((lang.additions + lang.deletions) / totalChanges) * 100;
    }

    // Sort the language stats by the total changes
    return languageStats.sort((a, b) => b.percent - a.percent);
  } finally {
    // Clean up
    process.chdir('..');
  }
};
