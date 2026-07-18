export interface DailyFile {
  fileName: string;
  path: string;
  content: string;
}

export function matchesMonthByPrefix(
  fileName: string,
  yearMonth: string,
): boolean {
  return fileName.startsWith(`${yearMonth}-`);
}

/**
 * Extracts YYYY, MM, DD token positions from a moment-style date format
 * string and checks whether the filename (with its extension stripped)
 * parses to the given year-month under that format. Supports the common
 * token set: YYYY, MM, DD, and literal separators.
 */
export function matchesMonthByFormat(
  fileName: string,
  yearMonth: string,
  dateFormat: string,
): boolean {
  const basename = fileName.replace(/\.[^./]+$/, "");

  const tokenPattern = /YYYY|MM|DD/g;
  let regexStr = "";
  let lastIndex = 0;
  const tokenOrder: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(dateFormat)) !== null) {
    const literal = dateFormat.slice(lastIndex, match.index);
    regexStr += escapeRegExp(literal);
    const token = match[0];
    tokenOrder.push(token);
    regexStr += token === "YYYY" ? "(\\d{4})" : "(\\d{2})";
    lastIndex = tokenPattern.lastIndex;
  }
  regexStr += escapeRegExp(dateFormat.slice(lastIndex));

  const regex = new RegExp(`^${regexStr}$`);
  const result = regex.exec(basename);
  if (!result) {
    return false;
  }

  let year = "";
  let month = "";
  tokenOrder.forEach((token, i) => {
    const value = result[i + 1] ?? "";
    if (token === "YYYY") year = value;
    if (token === "MM") month = value;
  });

  if (!year || !month) {
    return false;
  }

  return `${year}-${month}` === yearMonth;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function stripTemplate(content: string, template: string): string {
  return content.replace(template, "").trim();
}

export function isEffectivelyEmpty(content: string): boolean {
  return content.trim() === "";
}

export function concatenateReview(
  files: DailyFile[],
  template: string,
): string {
  let content = `---\ntags:\n  - monthly-review\n---\n\n`;

  const sorted = [...files].sort((a, b) =>
    a.fileName.localeCompare(b.fileName),
  );

  for (const file of sorted) {
    const cleaned = stripTemplate(file.content, template);
    if (isEffectivelyEmpty(cleaned)) {
      continue;
    }

    content += [
      `## ${file.fileName.replace(/\.md$/, "")}`,
      cleaned,
      `---`,
      "",
    ].join("\n\n");
  }

  return content.trim();
}

export function reviewFileName(yearMonth: string): string {
  return `${yearMonth} - Review.md`;
}
