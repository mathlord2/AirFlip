import React, { useState, useRef, useCallback, useEffect } from "react";
import useWebcam from './useWebcam';
import {COLORS, SHADOW} from "../../styleVars";

import {
    drawCircle,
    drawLine,
    drawRectangle,
    drawText,
    linearRegression 
} from "./javascripts/helper.js";
import { NeuralNetwork } from "./javascripts/nn.js"

import Ola from "ola";

import $ from "jquery";

import * as poseDetection from '@tensorflow-models/pose-detection';

const Vid = React.forwardRef((props, ref) => {
    return <video autoPlay={true} muted ref={ref} style={{
        border: "5px solid " + COLORS.primary,
        boxShadow: SHADOW.primary,
        borderRadius: "30px",
        zIndex: 0,
        transform: "rotateY(180deg)",
    }} />
});

const Canvas = React.forwardRef((props, ref) => {
    return <canvas ref={ref} style={{position: "absolute", right: 0, zIndex: 15}}/>
})

const Video = React.memo(
    ({ model }) => {
        const video = useRef();
        const canvas = useRef();

        useWebcam(video, () => {
            startPosing();
        });

        const startPosing = useCallback(async () => {
            const defaultWidth = 640;
            const defaultHeight = 480;

            let currPoseData = [];
            let poseData = [];
            let firstPose, secondPose;

            let counter = 0;
            let lastPose = undefined;
            let lastRep = Date.now();
            let halfRep = false;
            let training = false;
            let state = 'waiting';

            let nn = new NeuralNetwork(10, 64, 2);
            let canvasElement = canvas.current;

            var ctx = canvas.current.getContext("2d");

            const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER};
            const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
    
            canvas.current.width = video.current.offsetWidth;
            canvas.current.height = video.current.offsetHeight;
    
            let r2 = Ola(0);
            let joints = {};
    
            // Update function
            async function update () {
    
                let videoElement = video.current;
                let poses = await detector.estimatePoses(videoElement);

                if (canvasElement) {
                    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height)
            
                    if (!poses[0]) return;
            
                    let points = poses[0].keypoints;
                    let body = {};
            
                    // Convert points to body joints
            
                    currPoseData = [];
                    for (let p of points) {
                        if (["nose", "left_ear", "right_ear", "left_eye", "right_eye"].includes(p.name)) {
                            currPoseData.push(p.x/defaultWidth);
                            currPoseData.push(p.y/defaultHeight);
                
                            p.x = (canvasElement.width-p.x - (canvasElement.width-defaultWidth)) * (canvasElement.width/defaultWidth);
                            p.y = p.y * (canvasElement.height/defaultHeight)
                            body[p.name] = p;
                        }

                        
                    }
            
                    if (state == 'collecting')
                        poseData.push(currPoseData);
            
                    // Joints
                    for (let id of Object.keys(body)) {
                        if (joints[id]) {
                            joints[id].x = body[id].x;
                            joints[id].y = body[id].y;
                        } else {
                            joints[id] = Ola({x: body[id].x, y: body[id].y}, 50);
                        }
                    }
            
                    // Feedforward
            
                    let result = nn.feedForward(currPoseData);
                    let poseIndex = result.indexOf(Math.max(...result))
            
                    if (lastPose != poseIndex && Date.now()-lastRep > 400) {
                        halfRep = !halfRep;
            
                        if (!halfRep)
                        counter++;
            
                        lastRep = Date.now();
                    }
            
            
                    lastPose = poseIndex;
            
                    
                    // Draw the skeleton
                    drawLine(ctx, joints["left_ear"].x, joints["left_ear"].y, joints["left_eye"].x, joints["left_eye"].y, "lime", 4)
                    drawLine(ctx, joints["left_eye"].x, joints["left_eye"].y, joints["nose"].x, joints["nose"].y, "lime", 4)
                    drawLine(ctx, joints["nose"].x, joints["nose"].y, joints["right_eye"].x, joints["right_eye"].y, "lime", 4)
                    drawLine(ctx, joints["right_eye"].x, joints["right_eye"].y, joints["right_ear"].x, joints["right_ear"].y, "lime", 4)

                
                    // Draw the joints
                    for (let id of Object.keys(joints)) {
                        let p = joints[id];
                        drawCircle(ctx, p.x, p.y, 5);
                        body[p.name] = p
                    }
            
        
                }
            }
    
            // Video loop
            var fps = 1000;
            var now;
            var then = Date.now();
            var interval = 1000/fps;
            window.delta = 0;
    
            let neckArray = [];
    
            function loop() {
                requestAnimationFrame(loop);
        
                now = Date.now();
                window.delta = now - then;
        
                if (window.delta > interval) {
                    then = now - (window.delta % interval);
        
                    update();
                }
            }
            loop();
    
        }, []);

        return(
            <div style={{position: "absolute", right: 0, top: 100, zIndex: 10}}>
                <Vid ref={video}/>

                <Canvas ref={canvas}/>
            </div>
        );
    }
)

export default Video;