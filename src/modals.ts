import { App, Modal, Setting } from "obsidian";
import type { DailyFile } from "./review";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export class MonthPickerModal extends Modal {
  private selectedMonth: number;
  private selectedYear: number;
  private onSubmit: (yearMonth: string) => void;

  constructor(app: App, onSubmit: (yearMonth: string) => void) {
    super(app);
    const now = new Date();
    this.selectedMonth = now.getMonth();
    this.selectedYear = now.getFullYear();
    this.onSubmit = onSubmit;
  }

  onOpen() {
    const { contentEl } = this;
    this.setTitle("Select month to review");

    new Setting(contentEl).setName("Month").addDropdown((dropdown) => {
      MONTH_NAMES.forEach((name, index) => {
        dropdown.addOption(String(index), name);
      });
      dropdown.setValue(String(this.selectedMonth));
      dropdown.onChange((value) => {
        this.selectedMonth = Number(value);
      });
    });

    new Setting(contentEl).setName("Year").addDropdown((dropdown) => {
      const currentYear = new Date().getFullYear();
      for (let year = currentYear - 5; year <= currentYear; year++) {
        dropdown.addOption(String(year), String(year));
      }
      dropdown.setValue(String(this.selectedYear));
      dropdown.onChange((value) => {
        this.selectedYear = Number(value);
      });
    });

    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText("Create review")
        .setCta()
        .onClick(() => {
          const monthStr = String(this.selectedMonth + 1).padStart(2, "0");
          const yearMonth = `${this.selectedYear}-${monthStr}`;
          this.close();
          this.onSubmit(yearMonth);
        }),
    );
  }

  onClose() {
    this.contentEl.empty();
  }
}

export class ConfirmDeleteModal extends Modal {
  private files: DailyFile[];
  private onConfirm: () => void;

  constructor(app: App, files: DailyFile[], onConfirm: () => void) {
    super(app);
    this.files = files;
    this.onConfirm = onConfirm;
  }

  onOpen() {
    const { contentEl } = this;
    this.setTitle("Delete original daily notes?");

    const list = contentEl.createEl("ul");
    for (const file of this.files) {
      list.createEl("li", { text: file.fileName });
    }

    new Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText("Delete")
          .setDestructive()
          .onClick(() => {
            this.close();
            this.onConfirm();
          }),
      )
      .addButton((btn) =>
        btn.setButtonText("Cancel").onClick(() => {
          this.close();
        }),
      );
  }

  onClose() {
    this.contentEl.empty();
  }
}

export class ConfirmOverwriteModal extends Modal {
  private existingPath: string;
  private onConfirm: () => void;

  constructor(app: App, existingPath: string, onConfirm: () => void) {
    super(app);
    this.existingPath = existingPath;
    this.onConfirm = onConfirm;
  }

  onOpen() {
    const { contentEl } = this;
    this.setTitle("Review file already exists");
    contentEl.createEl("p", {
      text: `"${this.existingPath}" already exists. Overwrite it?`,
    });

    new Setting(contentEl)
      .addButton((btn) =>
        btn
          .setButtonText("Overwrite")
          .setDestructive()
          .onClick(() => {
            this.close();
            this.onConfirm();
          }),
      )
      .addButton((btn) =>
        btn.setButtonText("Cancel").onClick(() => {
          this.close();
        }),
      );
  }

  onClose() {
    this.contentEl.empty();
  }
}
