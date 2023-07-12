# DND5e character sheet assist tool (cheesiol)
A small open source SPA that can be used to manage your DND5e character and share them in a form of a .json file.

## features
- basic character sheet features: tracking your character HP, exhaustion levels and death saves, skill and saving throw modifiers.
- open / save character data as lightweight .json files
- character sheet layout customisation. Do you want the exhaustion tracker to be somewhere else? Feeling like your inventory is too small? You can change it!
- character data is autosaved in your browser's local storage whenever a change is made. Note: saving data to the disk has to be done manually
- exhaustion level tool-tip shows current debuffs, if there are any

## how-to's
### chaging values
- most ability throw, skill check and saving throw modifiers are calculated automatically from provided **ability scores** and proficiency bonus(es).
- to change a value you need to click (tap) on a checkbox, death-saves tracker or a text-field. Using tab to cycle through different fields works as well.

### sharing a .pdf
you can print character sheet to a .pdf file using built-in browser features. Pressing ctrl+p opens a printing interface, where you can select "Save to PDF" in most browsers.

## planned features
- multiple character sheets opened at once, for your DM'ing needs
- ability to set an expertise in a skill
- quick new character sheet creation using various templates
- enhancing layout editor UI/UX
- configuring custom fonts and templates

## about
### why I made this
I ran out of space on my character sheet, since I was groups record keeper, and instead of making a new .pdf filewith an additional page, I decided that it'd be cool to write a small web app.