import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import { FolderSuggest, MarkdownFileSuggest } from "./suggest";

export interface MonthReviewSettings {
  dailyFolder: string;
  captureFolder: string;
  dailyTemplatePath: string;
}

export const DEFAULT_SETTINGS: MonthReviewSettings = {
  dailyFolder: "Daily",
  captureFolder: "Capture",
  dailyTemplatePath: "Templates/Daily Note.md",
};

export type MonthReviewPluginLike = Plugin & {
  settings: MonthReviewSettings;
  saveSettings(): Promise<void>;
};

export class MonthReviewSettingTab extends PluginSettingTab {
  plugin: MonthReviewPluginLike;

  constructor(app: App, plugin: MonthReviewPluginLike) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Daily notes folder")
      .setDesc("Folder containing your daily notes.")
      .addText((text) => {
        text
          .setPlaceholder("Daily")
          .setValue(this.plugin.settings.dailyFolder)
          .onChange(async (value) => {
            this.plugin.settings.dailyFolder = value;
            await this.plugin.saveSettings();
          });
        new FolderSuggest(this.app, text.inputEl);
      });

    new Setting(containerEl)
      .setName("Capture folder")
      .setDesc("Folder where the generated review file will be saved.")
      .addText((text) => {
        text
          .setPlaceholder("Capture")
          .setValue(this.plugin.settings.captureFolder)
          .onChange(async (value) => {
            this.plugin.settings.captureFolder = value;
            await this.plugin.saveSettings();
          });
        new FolderSuggest(this.app, text.inputEl);
      });

    new Setting(containerEl)
      .setName("Daily note template path")
      .setDesc(
        "Path to the daily note template. Its content is stripped from each daily note before the note is included in the review.",
      )
      .addText((text) => {
        text
          .setPlaceholder("Templates/Daily Note.md")
          .setValue(this.plugin.settings.dailyTemplatePath)
          .onChange(async (value) => {
            this.plugin.settings.dailyTemplatePath = value;
            await this.plugin.saveSettings();
          });
        new MarkdownFileSuggest(this.app, text.inputEl);
      });
  }
}
