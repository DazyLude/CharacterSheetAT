import GeneralInfo from "./generalInfo";
import PrimarySkills from "./primarySkills";
import SecondarySkills from "./secondarySkills";
import BattleStats from "./battleStats";
import HealthStats from "./healthStats";
import DeathSavesTracker from "./deathSavesTracker";
import HitdiceTracker from "./hitdiceTracker";
import ExhaustionTracker from "./exhaustionTracker";
import ProficiencyModifier from "./proficiencyModifier";
import AbilitySaveDC from "./abilitySaveDC";
import Senses from "./senses";
import SavingThrows from "./savingThrows";
import Inventory from "./inventory";
import SpellList from "./spellList";
import CustomTextField from "./customTextField";
import ImageDisplay from "./imageDisplay";

export {
    GeneralInfo,
    PrimarySkills,
    SecondarySkills,
    BattleStats,
    HealthStats,
    DeathSavesTracker,
    HitdiceTracker,
    ExhaustionTracker,
    SavingThrows,
    ProficiencyModifier,
    AbilitySaveDC,
    Senses,
    CustomTextField,
    Inventory,
    SpellList,
    ImageDisplay
};

const classLibrary = {
    "generalInfo" : GeneralInfo,
    "primarySkills" : PrimarySkills,
    "secondarySkills" : SecondarySkills,
    "battleStats" : BattleStats,
    "healthStats": HealthStats,
    "deathSavesTracker": DeathSavesTracker,
    "hitdiceTracker": HitdiceTracker,
    "exhaustionTracker": ExhaustionTracker,
    "savingThrowsStats": SavingThrows,
    "proficiencyModifierTracker": ProficiencyModifier,
    "abilitySaveDC": AbilitySaveDC,
    "sensesStats": Senses,
    "customTextField": CustomTextField,
    "inventory": Inventory,
    "spellList": SpellList,
    "imageDisplay": ImageDisplay,
}

export function getUIElementFromString(typeString) {
    return classLibrary[typeString] ?? "div";
};