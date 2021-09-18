import React from "react";
import {COLORS, SHADOW} from "../styleVars";

const Textbox = props => {
    return (
        <input placeholder={props.placeholder} value={props.value} onChange={props.onChange} type={props.type} style={{
            padding: "10px",
            border: "3px solid " + COLORS.primary,
            borderRadius: "15px",
            textAlign: "left",
            width: props.width,
            height: props.height,
            marginRight: props.margin,
            boxShadow: SHADOW.primary
        }}/>
    );
}

export default Textbox;