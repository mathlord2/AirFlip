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
import Webcam from "react-webcam";

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


let nn = new NeuralNetwork(10, 64, 3);
let init = false;

$.getJSON("./models/scene.json", function(json) {
    nn = NeuralNetwork.deserialize(json)
    console.log("Loaded Neural Network")
}); 

const Video = (props) => {
        const video = useRef();
        const canvas = useRef();
        
        useEffect(async () => {
            if (!init) {
                await startPosing();

                //startTraining();
                init = true;
            }
        }, []);

        
        const videoConstraints = {
            height: 400,
            width: 400,
            facingMode: "environment",
        };

        let poseData = [];

        let state = 'waiting';

        let firstPose, secondPose, thirdPose;

        function startTraining() {
            console.log("Get ready for posing in 5 seconds")
            setTimeout(function () {
              poseData = [];
              console.log("Start Posing")
              state = 'collecting';
          
              setTimeout(function() {
                console.log("Done Posing");
                state = 'done';
          
                firstPose = JSON.parse(JSON.stringify(poseData));
          
                console.log("Get ready for posing in 5 seconds")
          
                // TRAIN SECOND POSE
                setTimeout(function () {
                    poseData = [];
                    console.log("Start Posing")
                    state = 'collecting';
          
                    setTimeout(function() {
                        console.log("Done Posing");
                        state = 'done';
            
                        secondPose = JSON.parse(JSON.stringify(poseData));
                        
                        console.log("Get ready for posing in 5 seconds")
          
                        // TRAIN THIRD POSE
                        setTimeout(function () {
                            poseData = [];
                            console.log("Start Posing")
                            state = 'collecting';
                
                            setTimeout(function() {
                                console.log("Done Posing");
                                state = 'done';
                    
                                thirdPose = JSON.parse(JSON.stringify(poseData));
            
                                console.log("Start Training")
                    
                                // console.log(firstPose);
                                // console.log(secondPose);
                    
                                for (let i = 0; i < 50000; i++) {
                                    let randomTarget = Math.floor(Math.random() * 3);
                    
                                    if (randomTarget == 0) {
                                        let input = firstPose[Math.floor(Math.random() * firstPose.length)]
                                        let target = [1, 0, 0];
                                        nn.train(input, target);
                                    } else if (randomTarget == 1) {
                                        let input = secondPose[Math.floor(Math.random() * secondPose.length)]
                                        let target = [0, 1, 0];
                                        nn.train(input, target);
                                    } else if (randomTarget == 2) {
                                        let input = thirdPose[Math.floor(Math.random() * thirdPose.length)];
                                        let target = [0, 0, 1];
                                        nn.train(input, target);
                                    }
                                
                                }
                    
                                console.log("Done Training");
                    
                                var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(nn.serialize());
                                var dlAnchorElem = document.getElementById('downloadAnchorElem');
                                dlAnchorElem.setAttribute("href",     dataStr     );
                                dlAnchorElem.setAttribute("download", "scene.json");
                                dlAnchorElem.click();
                            }, 5000)
                        }, 5000)
                    }, 5000)
                  }, 5000)
              }, 5000)
            }, 5000)
        }

        const startPosing = async () => {

            const defaultWidth = 400;
            const defaultHeight = 400;

            let currPoseData = [];

            let counter = 0;
            let lastPose = undefined;
            let lastRep = Date.now();
            let halfRep = false;
            let training = false;

            let poseIndex = 0;

            let canvasElement = canvas.current;
            let videoElement = document.getElementById("webcam");

            var ctx = canvasElement.getContext("2d");

            const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER};
            const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

            // canvasElement.width = videoElement.offsetWidth;
            // canvasElement.height = videoElement.offsetHeight;
            canvasElement.width = videoConstraints.width;
            canvasElement.height = videoConstraints.height;

            let r2 = Ola(0);
            let joints = {};
    
            // Update function
            async function update () {
    
                let poses = await detector.estimatePoses(videoElement);

                if (canvasElement) {
                    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height)
            
                    if (!poses[0]) return;
            
                    let points = poses[0].keypoints;
                    let body = {};
            
                    // Convert points to body joints
            
                    currPoseData = [];

                    let leftOffset, rightOffset;

                    for (let p of points) {
                        if (p.name == "left_ear") {
                            leftOffset = {x: p.x, y: p.y};

                            leftOffset.x = (canvasElement.width-leftOffset.x - (canvasElement.width-defaultWidth))*(canvasElement.width/defaultWidth);
                            leftOffset.y = leftOffset.y * (canvasElement.height/defaultHeight);
                        } else if (p.name =="right_ear") {
                            rightOffset = {x: p.x, y: p.y};
                            
                            rightOffset.x = (canvasElement.width-rightOffset.x - (canvasElement.width-defaultWidth))*(canvasElement.width/defaultWidth);
                            rightOffset.y = rightOffset.y * (canvasElement.height/defaultHeight);
                        }
                    }

                    let normalizedWidth = Math.abs(rightOffset.x - leftOffset.x) + 50;
                    let normalizedHeight = Math.abs(rightOffset.y - leftOffset.y) + 100;

                    drawRectangle(ctx, leftOffset.x-25, Math.min(leftOffset.y, rightOffset.y)-50, normalizedWidth, normalizedHeight, "blue", {fill: false, outline: true, outlineWidth: 5, outlineColor: "blue"});

                    for (let p of points) {

                        if (["nose", "left_ear", "right_ear", "left_eye", "right_eye"].includes(p.name)) {

                            currPoseData.push((p.x-leftOffset.x+25)/normalizedWidth);
                            currPoseData.push((p.y-leftOffset.y+50)/normalizedHeight);
                            
                            p.x = (canvasElement.width-p.x - (canvasElement.width-defaultWidth)) * (canvasElement.width/defaultWidth);
                            p.y = p.y * (canvasElement.height/defaultHeight);

                            // p.x = (p.x-leftOffset.x+25)/normalizedWidth;
                            // p.y = (p.y-leftOffset.y+50)/normalizedHeight;

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
                    poseIndex = result.indexOf(Math.max(...result))
                    
                    if (lastPose == 0 && poseIndex > 0 && Date.now()-lastRep > 400) {
            
                        if (poseIndex === 1) // Turn right
                        {
                            // right
                            props.increment();
                        } else if (poseIndex === 2) // Turn left
                        {
                            // left
                            props.decrement();
                        }
        
                        lastRep = Date.now();
                    }

                    lastPose = poseIndex;

                    drawText(ctx, "Predicted Pose: " + poseIndex, 20, 50, "20px Arial", "red", "left", "top");
                    drawText(ctx, "# of Reps: " + counter, 20, 80, "20px Arial", "red", "left", "top");            
                    
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
        
                    setTimeout(() => update(), 3000);
                }
            }
            if (props.videoOn) {
                loop();
            }
        }

        return(
            <div style={{position: "absolute", right: 0, top: 100, zIndex: 10}}>
                <Webcam
                    id="webcam"
                    audio={false}
                    ref={video}
                    style={{
                        transform: "rotateY(180deg)"
                    }}
                    videoConstraints={videoConstraints}
                />
                <Canvas id="canvas" ref={canvas}/>
            </div>
        );
    }

export default Video;