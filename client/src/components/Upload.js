import React from "react";
import {BsCloudUpload} from "react-icons/bs";
import {COLORS, SHADOW} from "../styleVars";

const Upload = props => {
    return (
        <div style={{margin: "15px 0px"}}>
            <BsCloudUpload style={{position: "absolute", marginLeft: "10px", fontSize: "20px"}}/>
            <input type="file" id="button" hidden onChange={props.onChange} accept={props.accept}/>
            <label for="button" style={{
                padding: "10px",
                paddingLeft: "35px",
                border: "3px solid " + COLORS.primary,
                borderRadius: "15px",
                textAlign: "left",
                width: props.width,
                height: props.height,
                marginRight: "10px",
                boxShadow: SHADOW.primary
            }}>{props.text}</label>
            <span id="file-chosen">{!props.file ? "No file chosen" : props.file.name}</span>
        </div>
    );
}

export default Upload;