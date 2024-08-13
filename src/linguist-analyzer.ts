import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

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
    let stdout = "";
    let stderr = "";

    if (child.stdout) {
      child.stdout.on("data", (data) => (stdout += data));
    }

    if (child.stderr) {
      child.stderr.on("data", (data) => (stderr += data));
    }

    child.on("close", (code) => {
      console.debug(`exited with code ${code}`);
      return code === 0 ? resolve(stdout) : reject(stderr);
    });
  });

const createDummyText = (count: number): string => {
  return "\n".repeat(count);
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

export const runLinguist = async (files: FileData[]): Promise<ProcessedLanguageStats[]> => {
  try {
    await runCommand("git checkout --orphan temp && git rm -rf . && rm -rf *");

    const processFileData = files.map((file, index) => ({
      ...file,
      path: `${index}${path.extname(file.path)}`,
    }));

    const pathFileMap = processFileData.reduce<Record<string, FileData>>((acc, file) => {
      acc[file.path] = file;
      return acc;
    }, {});

    await Promise.all([
      ...processFileData.map((file) =>
        fs.writeFile(
          file.path,
          createFileContent(file)
        )
      ),
      runCommand(`echo "*.* linguist-detectable" > .gitattributes`),
      runCommand(`git config user.name "dummy" && git config user.email "dummy@github.com"`),
    ]);

    // Add files to git
    await runCommand('git add .');
    await runCommand('git commit -m "dummy commit"');

    // Run github-linguist
    const stdout = await runCommand("github-linguist --breakdown --json");
    const linguistResult = JSON.parse(stdout) as LinguistResult;

    const languageStats = Object.entries(linguistResult)
      .reduce<ProcessedLanguageStats[]>((languageStat, [name, stats]) => {
        languageStat.push({
        name,
          percent: +stats.percentage,
          additions: stats.files.reduce(
            (sum, filePath) => sum + (pathFileMap[filePath]?.additions ?? 0),
          0
        ),
          deletions: stats.files.reduce(
            (sum, filePath) => sum + (pathFileMap[filePath]?.deletions ?? 0),
          0
        ),
          count: stats.files.length,
      });
        return languageStat;
    }, [])
    .sort((a, b) => b.percent - a.percent);

    return languageStats;
  } finally {
    // Clean up
    process.chdir('..');
  }
};
