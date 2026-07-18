import fs from "fs/promises";
import path from "path";

export const DAILIES_DIRECTORY = path.resolve(
  path.join(__dirname, "../", "Daily")
);

export const CAPTURE_DIRECTORY = path.resolve(
  path.join(__dirname, "../", "Capture")
);

export const DAILY_TEMPLATE_PATH = path.resolve(
  path.join(__dirname, "../Templates/Daily Note.md")
);

export const getDailyTemplate = async () => {
  return await fs.readFile(DAILY_TEMPLATE_PATH, "utf8");
};
