import React from "react";
import {SHADOW} from "../styleVars";

const WhiteContainer = props => {
    return (
        <div onClick={props.onClick} style={{
            backgroundColor: "white",
            borderRadius: 15,
            padding: "20px",
            boxShadow: SHADOW.primary,
            width: props.width,
            height: props.height,
            alignItems: "center",
            margin: props.margin + " 0px",
            position: "relative",
            textAlign: props.left ? "left" : "center",
            cursor: props.onClick && "pointer"
        }}>
            {props.children}
        </div>
    )
}

export default WhiteContainer;