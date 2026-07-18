import { Notice, Plugin, TFile, TFolder } from "obsidian";
import {
  appHasDailyNotesPluginLoaded,
  getDailyNoteSettings,
} from "obsidian-daily-notes-interface";
import {
  ConfirmDeleteModal,
  ConfirmOverwriteModal,
  MonthPickerModal,
} from "./modals";
import {
  concatenateReview,
  DailyFile,
  matchesMonthByFormat,
  matchesMonthByPrefix,
  reviewFileName,
} from "./review";
import {
  DEFAULT_SETTINGS,
  MonthReviewSettings,
  MonthReviewSettingTab,
} from "./settings";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export default class MonthReviewPlugin extends Plugin {
  settings: MonthReviewSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    this.addRibbonIcon("calendar-check", "Create month review", () => {
      this.openMonthPicker();
    });

    this.addCommand({
      id: "create-review",
      name: "Create review",
      callback: () => {
        this.openMonthPicker();
      },
    });

    this.addSettingTab(new MonthReviewSettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private openMonthPicker() {
    new MonthPickerModal(this.app, (yearMonth) => {
      this.runReview(yearMonth).catch((error: unknown) => {
        console.error("Month review failed:", error);
        new Notice(`Month review failed: ${errorMessage(error)}`);
      });
    }).open();
  }

  private async runReview(yearMonth: string) {
    const dailyFiles = await this.gatherDailyFiles(yearMonth);

    if (dailyFiles.length === 0) {
      new Notice(`No daily notes found for ${yearMonth}.`);
      return;
    }

    const template = await this.readTemplate();
    const content = concatenateReview(dailyFiles, template);
    const reviewPath = `${this.settings.captureFolder}/${reviewFileName(yearMonth)}`;

    const existing = this.app.vault.getAbstractFileByPath(reviewPath);
    if (existing instanceof TFile) {
      new ConfirmOverwriteModal(this.app, reviewPath, () => {
        this.writeReviewAndConfirmDelete(
          reviewPath,
          content,
          dailyFiles,
          true,
        ).catch((error: unknown) => {
          console.error("Month review failed:", error);
          new Notice(`Month review failed: ${errorMessage(error)}`);
        });
      }).open();
      return;
    }

    await this.writeReviewAndConfirmDelete(
      reviewPath,
      content,
      dailyFiles,
      false,
    );
  }

  private async writeReviewAndConfirmDelete(
    reviewPath: string,
    content: string,
    dailyFiles: DailyFile[],
    overwrite: boolean,
  ) {
    let reviewFile: TFile;
    if (overwrite) {
      const existing = this.app.vault.getAbstractFileByPath(reviewPath);
      if (existing instanceof TFile) {
        await this.app.vault.modify(existing, content);
        reviewFile = existing;
      } else {
        reviewFile = await this.app.vault.create(reviewPath, content);
      }
    } else {
      reviewFile = await this.app.vault.create(reviewPath, content);
    }

    await this.app.workspace.getLeaf(false).openFile(reviewFile);

    new ConfirmDeleteModal(this.app, dailyFiles, () => {
      this.deleteDailyFiles(dailyFiles).catch((error: unknown) => {
        console.error("Failed to delete daily notes:", error);
        new Notice(`Failed to delete daily notes: ${errorMessage(error)}`);
      });
    }).open();
  }

  private async deleteDailyFiles(dailyFiles: DailyFile[]) {
    for (const dailyFile of dailyFiles) {
      const file = this.app.vault.getAbstractFileByPath(dailyFile.path);
      if (file instanceof TFile) {
        await this.app.fileManager.trashFile(file);
      }
    }
  }

  private async readTemplate(): Promise<string> {
    const templateFile = this.app.vault.getAbstractFileByPath(
      this.settings.dailyTemplatePath,
    );
    if (!(templateFile instanceof TFile)) {
      return "";
    }
    return await this.app.vault.read(templateFile);
  }

  private async gatherDailyFiles(yearMonth: string): Promise<DailyFile[]> {
    const dailyFolder = this.app.vault.getAbstractFileByPath(
      this.settings.dailyFolder,
    );
    if (!(dailyFolder instanceof TFolder)) {
      return [];
    }

    const useDailyNotesPlugin = appHasDailyNotesPluginLoaded();
    const dailyNoteFormat = useDailyNotesPlugin
      ? getDailyNoteSettings().format
      : undefined;

    const results: DailyFile[] = [];
    for (const child of dailyFolder.children) {
      if (!(child instanceof TFile) || child.extension !== "md") {
        continue;
      }

      const matches = dailyNoteFormat
        ? matchesMonthByFormat(child.name, yearMonth, dailyNoteFormat)
        : matchesMonthByPrefix(child.name, yearMonth);

      if (!matches) {
        continue;
      }

      const content = await this.app.vault.read(child);
      results.push({ fileName: child.name, path: child.path, content });
    }

    return results;
  }
}
