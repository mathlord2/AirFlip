import React, { useState, useRef, useCallback } from "react";
import useWebcam from './useWebcam';
import {COLORS, SHADOW} from "../../styleVars";

const Video = React.memo(
    ({ model }) => {
        const videoRef = useRef();
        const canvasRef = useRef();

        useWebcam(videoRef, () => {
            runVideo();
        });

        const runVideo = useCallback(async () => {
            console.log("Hi");
        }, [model]);

        return(
            <div style={{position: "absolute", right: 0, top: 100, zIndex: 10}}>
                <video autoPlay muted ref={videoRef} style={{
                    position: "absolute",
                    right: 20,
                    border: "5px solid " + COLORS.primary,
                    boxShadow: SHADOW.primary,
                    borderRadius: "30px"}} width={500}/>
                <canvas ref={canvasRef}/>
            </div>
        );
    }
)

export default Video;