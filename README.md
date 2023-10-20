# DND5e character sheet assist tool
A small open source SPA that can be used to manage your DND5e character and share them in a form of a .json file.

![image](https://github.com/DazyLude/CharacterSheetAT/assets/36658009/8a009fa6-ff5e-472e-b621-97b61c95ebe8)

## features
- basic character sheet features: tracking your character HP, exhaustion levels and death saves, skill and saving throw modifiers.
- open / save character data as lightweight .json files
- character sheet layout customisation. Do you want the exhaustion tracker to be somewhere else? Feeling like your inventory is too small? You can change it!
- character data is autosaved in your browser's local storage whenever a change is made. Note: saving data to the disk has to be done manually
- exhaustion level tool-tip shows current debuffs, if there are any

## how-to's
###

### changing values
- most ability throw, skill check and saving throw modifiers are calculated automatically from provided **ability scores** and proficiency bonus(es).
- to change a value you need to click (tap) on a checkbox, death-saves tracker or a text-field. Using tab to cycle through different fields works as well.
- there is a readonly mode that you can turn off to prevent unwanted changes
- to set custom formula for a skill modifier calculation, or to set an expertise in a skill, switch to "element editing mode" and click on the "advanced" button for the skill you want to change

### changing layout of the page
- switch layout editing mode and the drag the center of layout elements to move them, or borders to resize them.

### changing table items' positions
- switch element editing mode, then click on the buttons with "<" and ">" symbols to change the item's column
- to change the ordering within the column, change the items priority in the "priority" column
- items with highest priority are sorted to the top, items within the same priority are sorted by the order of adding the items to the table
- newest items are added to the least populated column at the bottom.

### sharing a .pdf
you can print character sheet to a .pdf file using built-in browser features. Pressing ctrl+p opens a printing interface, where you can select "Save to PDF" in most browsers.

## planned features for 0.6
- moving some of the features from React to Tauri, e.g. file manipulation
- adding commonly used elements creator interface
- adding shortcuts for implemented features
- image display element
- exploring native appdata folders provided by Tauri for storage of, well, app data

## planned features in no particular order
- using external resourses, such as images, from web or local machine, on the character sheet
- changing the color scheme of the character sheet
- multiple character sheets opened at once, for your DM'ing needs
- quick new character sheet creation using various templates
- enhancing layout editor UI/UX
- configuring custom fonts and templates
- photo-mode with hidden status bar
- and also moving appstate to backend from react :^)

## about
### why I made this
I ran out of space on my character sheet, since I was groups record keeper, and instead of making a new .pdf filewith an additional page, I decided that it'd be cool to write a small web app.
