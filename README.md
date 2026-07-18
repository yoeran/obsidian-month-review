# Obsidian Month Review

This plugin concatenates a month's daily notes into a single review file, then optionally delete the originals.

### Features

- Trigger via ribbon or command
- Easy month picker
- Template stripping, to leave out empty notes
- Overwrite/delete confirmation of old notes
- Folder autocomplete in the settings
- Automatically opens the review when created

## Usage

Click the ribbon icon, or run the command, then pick a month and year, confirm deletion of old notes and you are done.

### Settings

- `Daily notes folder` - Folder containing your daily notes (default: `Daily/`)
- `Capture folder` - Folder where the generated review file will be saved (default: `Capture/`)
- `Daily note template path` - Path to the daily note template. Its content is stripped from each daily note before the note is included in the review (default: `Templates/Daily Note.md`)


## Installation

1. Clone this repo
2. Install the dependencies
3. Build the plugin with `npm run build` 
4. Copy `main.js` and `manifest.json` into `.obsidian/plugins/month-review/`
5. Visit your "Community Plugins" tab in Obsidian and enable this plugin

> Not available on Obsidian community plugin store (yet)

## Support

If you like this plugin, please consider supporting me.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Y8Y31UIDZG)