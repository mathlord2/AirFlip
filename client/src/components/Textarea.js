import React from "react";
import {COLORS, SHADOW} from "../styleVars";

const Textarea = props => {
    return (
        <textarea placeholder={props.placeholder} value={props.value} onChange={props.onChange} style={{
            padding: "10px",
            border: "3px solid " + COLORS.primary,
            borderRadius: "15px",
            textAlign: "left",
            width: props.width,
            height: props.height,
            boxShadow: SHADOW.primary
        }}/>
    );
}

export default Textarea;