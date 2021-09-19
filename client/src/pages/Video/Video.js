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
    return <video autoPlay muted ref={ref} style={{
        position: "absolute",
        right: 20,
        border: "5px solid " + COLORS.primary,
        boxShadow: SHADOW.primary,
        borderRadius: "30px"}} width={500}/>
});

const Canvas = React.forwardRef((props, ref) => {
    return <canvas ref={ref} style={{zIndex: 10}}/>
})

const Video = React.memo(
    ({ model }) => {
        const video = useRef(null);
        const canvas = useRef(null);

        useWebcam(video, () => {
            runVideo();
        });

        useEffect(() => {
            console.log(canvas);
            startPosing();
        }, []);

        async function startPosing() {
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

            let nn = new NeuralNetwork(34, 64, 2);

            var ctx = canvas.current.getContext("2d");

            const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER};
            const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
    
            /*canvas.width = $("#video").innerWidth();
            canvas.height = $("#video").innerHeight();*/
    
            let r2 = Ola(0);
            let joints = {};
    
            // Update function
            async function update () {
    
                let videoElement = video.current;
                let poses = await detector.estimatePoses(videoElement);
        
                ctx.clearRect(0, 0, canvas.width, canvas.height)
        
                if (!poses[0]) return;
        
                let points = poses[0].keypoints;
                let body = {};
        
                // Convert points to body joints
        
                currPoseData = [];
                for (let p of points) {
                    currPoseData.push(p.x/defaultWidth);
                    currPoseData.push(p.y/defaultHeight);
        
                    p.x = (canvas.width-p.x - (canvas.width-defaultWidth)) * (canvas.width/defaultWidth);
                    p.y = p.y * (canvas.height/defaultHeight)
                    body[p.name] = p;
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
        
                drawText(ctx, "Predicted Pose: " + poseIndex, 20, 50, "20px Arial", "red", "left", "top");
                drawText(ctx, "# of Reps: " + counter, 20, 80, "20px Arial", "red", "left", "top");
        
                // SKELETON
        
                let nose = {
                    x: body["nose"].x,
                    y: body["nose"].y
                }
        
                let neck = {
                    x: (body["left_shoulder"].x + body["right_shoulder"].x) / 2,
                    y: (body["left_shoulder"].y + body["right_shoulder"].y) / 2
                }
                neckArray.push(neck.y);
        
                let middle = {
                    x: (body["left_hip"].x + body["right_hip"].x) / 2,
                    y: (body["left_hip"].y + body["right_hip"].y) / 2
                }
        
                let knee = {
                    x: (body["left_knee"].x + body["right_knee"].x) / 2,
                    y: (body["left_knee"].y + body["right_knee"].y) / 2
                }
        
                let foot = {
                    x: (body["left_ankle"].x + body["right_ankle"].x) / 2,
                    y: (body["left_ankle"].y + body["right_ankle"].y) / 2
                }
        
                // Plank / Pushup
        
                let xSpine = [body["left_shoulder"].x, body["left_hip"].x, body["left_knee"].x, body["left_ankle"].x];
                let ySpine = [body["left_shoulder"].y, body["left_hip"].y, body["left_knee"].y, body["left_ankle"].y];
        
                r2.set(linearRegression(xSpine, ySpine)["r2"]);
        
                //drawRectangle(0, 0, r2.value*canvas.width, 50, "green");
        
                drawText(ctx, "R2 value: " + r2.value.toFixed(2), 20, 20, "20px Arial", "red", "left", "top")
        
                let text, color;
                if (r2.value > 0.7) {
                    text = "Good Posture";
                    color = "green";
                } else if (r2.value > 0.5) {
                    text = "Straighten Your Back";
                    color = "orange";
                } else {
                    text = "Incorrect Posture";
                    color = "red";
                }
        
                // Draw the skeleton
                drawLine(ctx, joints["left_ear"].x, joints["left_ear"].y, joints["left_eye"].x, joints["left_eye"].y, "lime", 4)
                drawLine(ctx, joints["left_eye"].x, joints["left_eye"].y, joints["nose"].x, joints["nose"].y, "lime", 4)
                drawLine(ctx, joints["nose"].x, joints["nose"].y, joints["right_eye"].x, joints["right_eye"].y, "lime", 4)
                drawLine(ctx, joints["right_eye"].x, joints["right_eye"].y, joints["right_ear"].x, joints["right_ear"].y, "lime", 4)
        
                drawLine(ctx, joints["left_wrist"].x, joints["left_wrist"].y, joints["left_elbow"].x, joints["left_elbow"].y, "lime", 4)
                drawLine(ctx, joints["left_elbow"].x, joints["left_elbow"].y, joints["left_shoulder"].x, joints["left_shoulder"].y, "lime", 4)
        
                drawLine(ctx, joints["right_wrist"].x, joints["right_wrist"].y, joints["right_elbow"].x, joints["right_elbow"].y, "lime", 4)
                drawLine(ctx, joints["right_elbow"].x, joints["right_elbow"].y, joints["right_shoulder"].x, joints["right_shoulder"].y, "lime", 4)
        
                drawLine(ctx, joints["left_shoulder"].x, joints["left_shoulder"].y, joints["right_shoulder"].x, joints["right_shoulder"].y, "lime", 4)
                drawLine(ctx, joints["left_hip"].x, joints["left_hip"].y, joints["right_hip"].x, joints["right_hip"].y, "lime", 4)
        
                drawLine(ctx, joints["left_shoulder"].x, joints["left_shoulder"].y, joints["left_hip"].x, joints["left_hip"].y, "lime", 4)
                drawLine(ctx, joints["right_shoulder"].x, joints["right_shoulder"].y, joints["right_hip"].x, joints["right_hip"].y, "lime", 4)
        
                drawLine(ctx, joints["left_knee"].x, joints["left_knee"].y, joints["left_hip"].x, joints["left_hip"].y, "lime", 4)
                drawLine(ctx, joints["right_knee"].x, joints["right_knee"].y, joints["right_hip"].x, joints["right_hip"].y, "lime", 4)
        
                drawLine(ctx, joints["left_knee"].x, joints["left_knee"].y, joints["left_ankle"].x, joints["left_ankle"].y, "lime", 4)
                drawLine(ctx, joints["right_knee"].x, joints["right_knee"].y, joints["right_ankle"].x, joints["right_ankle"].y, "lime", 4)
        
                // Draw the joints
                for (let id of Object.keys(joints)) {
                    let p = joints[id];
                    drawCircle(ctx, p.x, p.y, 5);
                    body[p.name] = p
                }
        
                drawCircle(ctx, neck.x, neck.y, 5);
                drawCircle(ctx, middle.x, middle.y, 5);
                drawCircle(ctx, knee.x, knee.y, 5);
                drawCircle(ctx, foot.x, foot.y, 5);
        
                drawLine(ctx, nose.x, nose.y, neck.x, neck.y, "white", 8);
                drawLine(ctx, neck.x, neck.y, middle.x, middle.y, "white", 8);
                drawLine(ctx, middle.x, middle.y, knee.x, knee.y, "white", 8);
                drawLine(ctx, knee.x, knee.y, foot.x, foot.y, "white", 8);
    
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
    
        }

        const runVideo = useCallback(async () => {
            console.log("Hi");
        }, [model]);

        return(
            <div style={{position: "absolute", right: 0, top: 100, zIndex: 10}}>

                <Canvas style="position: absolute; z-index: 100;" ref={canvas}/>
                <Vid ref={video}/>
            </div>
        );
    }
)

export default Video;