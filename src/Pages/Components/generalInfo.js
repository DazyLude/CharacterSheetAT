export default function GeneralInfo(props) {
    return (
        <div
            id="general-information"
            style={{
                "display": "grid",
                "gridTemplateColumns": "2fr 1fr 1fr",
                "gridTemplateRows": "1fr 1fr",
                "background": "#eeeeee",
                ...props.placement
            }}
        >
            <div
                style={{
                    "gridColumn": "1",
                    "gridRow": "1/-1",
                    "justifySelf": "center",
                    "alignSelf": "center",
                }}
            >
                <div className="form-big">{props.characterName}</div>
                <div className="sheet-subscript">character name</div>
            </div>
            <div>
                <div className="form-text">{props.characterClass}</div>
                <div className="sheet-subscript">class</div>
            </div>
            <div>
                <div className="form-text">{props.characterLevel}</div>
                <div className="sheet-subscript">level</div>
            </div>
            <div>
                <div className="form-text">{props.characterBackground}</div>
                <div className="sheet-subscript">background</div>
            </div>
            <div>
                <div className="form-text">{props.characterRace}</div>
                <div className="sheet-subscript">race</div>
            </div>
        </div>
    );
}