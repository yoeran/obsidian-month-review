import fs from "fs/promises";
import { CAPTURE_DIRECTORY, DAILIES_DIRECTORY, getDailyTemplate } from "./_lib";

interface FileObject {
  filePath: string;
  fileName: string;
  content: string;
}

async function main() {
  const dateStr = process.argv[2];
  if (!dateStr) {
    console.error("Please provide the date in YYYY-MM format");
    return;
  }

  try {
    const files = await getMarkdownFiles(dateStr);
    const concatenatedContent = await concatenateFiles(files);
    const reviewFilePath = `${CAPTURE_DIRECTORY}/${dateStr} - Review.md`;
    await saveReviewFile(reviewFilePath, concatenatedContent);

    const response = await askForConfirmation(files);

    if (response) {
      await deleteSelectedDailyMarkdownFiles(files);
    }
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
}

async function getMarkdownFiles(dateStr: string) {
  const files: FileObject[] = [];
  const list = await fs.readdir(DAILIES_DIRECTORY);

  for (const file of list) {
    if (!file.endsWith(".md")) {
      continue;
    }

    const filePath = `${DAILIES_DIRECTORY}/${file}`;
    const yearMonth = file.slice(0, 8);

    if (yearMonth === dateStr + "-") {
      const content = await fs.readFile(filePath, "utf8");
      files.push({
        filePath,
        fileName: file,
        content,
      });
    }
  }

  return files.sort((a, b) => a.fileName.localeCompare(b.fileName));
}

async function concatenateFiles(files: FileObject[]) {
  const DAILY_TEMPLATE = await getDailyTemplate();

  let content = `---
tags:
  - monthly-review
---

`;
  for (const file of files) {
    const cleanContents = file.content.replace(DAILY_TEMPLATE, "").trim();

    if (cleanContents === "") {
      continue;
    }

    content += [
      `## ${file.fileName.replace(".md", "")}`,
      cleanContents,
      `---`,
      "",
    ].join("\n\n");
  }

  return content.trim() || "";
}

async function saveReviewFile(
  reviewFilePath: string,
  concatenatedContent: string
) {
  try {
    await fs.writeFile(reviewFilePath, concatenatedContent);
  } catch (error) {
    console.error("An error occurred while saving the review file:", error);
    process.exit(1);
  }
}

function askForConfirmation(files: FileObject[]) {
  return new Promise(async (resolve) => {
    let confirmationMessage = `Are you sure you want to delete the following files (y/n):\n\n`;
    for (const file of files) {
      confirmationMessage += `- ${file.fileName}\n`;
    }
    console.log(confirmationMessage);
    for await (const line of console) {
      if (line.toLowerCase().includes("y")) {
        return resolve(true);
      } else {
        return resolve(false);
      }
    }
  });
}

async function deleteSelectedDailyMarkdownFiles(files: FileObject[]) {
  try {
    for (const file of files) {
      // console.log("Fake delete ", file.filePath);

      await fs.unlink(file.filePath);
    }
  } catch (error) {
    console.error(
      "An error occurred while deleting the selected daily markdown files:",
      error
    );
    process.exit(1);
  }
}

main();
