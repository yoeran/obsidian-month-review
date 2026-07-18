import { describe, expect, it } from "vitest";
import {
  concatenateReview,
  isEffectivelyEmpty,
  matchesMonthByFormat,
  matchesMonthByPrefix,
  reviewFileName,
  stripTemplate,
  type DailyFile,
} from "./review";

describe("matchesMonthByPrefix", () => {
  it("matches files with the YYYY-MM- prefix", () => {
    expect(matchesMonthByPrefix("2026-07-15.md", "2026-07")).toBe(true);
  });

  it("rejects files from a different month", () => {
    expect(matchesMonthByPrefix("2026-08-01.md", "2026-07")).toBe(false);
  });

  it("rejects non-matching filenames", () => {
    expect(matchesMonthByPrefix("notes.md", "2026-07")).toBe(false);
  });
});

describe("matchesMonthByFormat", () => {
  it("matches using a YYYY-MM-DD format", () => {
    expect(matchesMonthByFormat("2026-07-15.md", "2026-07", "YYYY-MM-DD")).toBe(
      true,
    );
  });

  it("matches using a DD-MM-YYYY format", () => {
    expect(matchesMonthByFormat("15-07-2026.md", "2026-07", "DD-MM-YYYY")).toBe(
      true,
    );
  });

  it("rejects a different month with a YYYY-MM-DD format", () => {
    expect(matchesMonthByFormat("2026-08-15.md", "2026-07", "YYYY-MM-DD")).toBe(
      false,
    );
  });

  it("returns false when the filename cannot be parsed with the format", () => {
    expect(matchesMonthByFormat("not-a-date.md", "2026-07", "YYYY-MM-DD")).toBe(
      false,
    );
  });
});

describe("stripTemplate", () => {
  it("removes the template content and trims the result", () => {
    const template = "# Daily\n\n## Tasks\n";
    const content = "# Daily\n\n## Tasks\n\nBought groceries.";
    expect(stripTemplate(content, template)).toBe("Bought groceries.");
  });

  it("returns an empty string when content is only the template", () => {
    const template = "# Daily\n\n## Tasks\n";
    expect(stripTemplate(template, template)).toBe("");
  });
});

describe("isEffectivelyEmpty", () => {
  it("is true for an empty string", () => {
    expect(isEffectivelyEmpty("")).toBe(true);
  });

  it("is true for whitespace-only content", () => {
    expect(isEffectivelyEmpty("   \n\n  ")).toBe(true);
  });

  it("is false for real content", () => {
    expect(isEffectivelyEmpty("Bought groceries.")).toBe(false);
  });
});

describe("concatenateReview", () => {
  const template = "# Daily\n";

  it("builds frontmatter and sections for non-empty files, skipping empty ones", () => {
    const files: DailyFile[] = [
      {
        fileName: "2026-07-01.md",
        path: "Daily/2026-07-01.md",
        content: "# Daily\nWoke up early.",
      },
      {
        fileName: "2026-07-02.md",
        path: "Daily/2026-07-02.md",
        content: "# Daily\n",
      },
    ];

    const result = concatenateReview(files, template);

    expect(result).toBe(
      [
        "---",
        "tags:",
        "  - monthly-review",
        "---",
        "",
        "## 2026-07-01",
        "",
        "Woke up early.",
        "",
        "---",
      ].join("\n"),
    );
  });

  it("returns only frontmatter when all files are empty after stripping", () => {
    const files: DailyFile[] = [
      {
        fileName: "2026-07-01.md",
        path: "Daily/2026-07-01.md",
        content: "# Daily\n",
      },
    ];

    const result = concatenateReview(files, template);

    expect(result).toBe(
      ["---", "tags:", "  - monthly-review", "---"].join("\n"),
    );
  });
});

describe("reviewFileName", () => {
  it("builds the review filename from a year-month string", () => {
    expect(reviewFileName("2026-07")).toBe("2026-07 - Review.md");
  });
});
