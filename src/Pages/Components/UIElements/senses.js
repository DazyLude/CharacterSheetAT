export default function Senses({characterData}) {
    const { primarySkills, proficiencies, proficiencyModifier } = characterData;
    return (
            <div style={{display: "grid", gridTemplateColumns: "2fr 1fr 2fr", alignItems: "center", justifyItems: "center", gridTemplateRows: "30px repeat(3, 1fr)"}}>
                <div className="sheet-title" style={{gridColumn: "1 / -1"}}>senses</div>
                <div className="sheet-title">passive perception</div>
                <span className="sheet-big">{10 + Math.floor((primarySkills['wis'] - 10)/2) + (proficiencies["perception"]??0)*proficiencyModifier}</span>
                <span className="sheet-title">(wisdom)</span>
                <div className="sheet-title">passive insight</div>
                <span className="sheet-big">{10 + Math.floor((primarySkills['wis'] - 10)/2) + (proficiencies["insight"]??0)*proficiencyModifier}</span>
                <span className="sheet-title">(wisdom)</span>
                <div className="sheet-title">passive investigation</div>
                <span className="sheet-big">{10 + Math.floor((primarySkills['int'] - 10)/2) + (proficiencies["investigation"]??0)*proficiencyModifier}</span>
                <span className="sheet-title">(intelligence)</span>
            </div>
    );
}