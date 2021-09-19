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

            startTraining();
        });


        let poseData = [];

        let state = 'waiting';

        let firstPose, secondPose, thirdPose;
        let nn = new NeuralNetwork(10, 64, 3);

        $.getJSON("./models/scene.json", function(json) {
            nn = NeuralNetwork.deserialize(json)
            console.log("Loaded Neural Network")
        });          

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
                    
                                console.log(firstPose);
                                console.log(secondPose);
                    
                                for (let i = 0; i < 5000; i++) {
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
                                        let input = thirdPose[Math.floor(Math.random() * thirdPose.length)]
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

        const startPosing = useCallback(async () => {

            const defaultWidth = 640;
            const defaultHeight = 480;

            let currPoseData = [];

            let counter = 0;
            let lastPose = undefined;
            let lastRep = Date.now();
            let halfRep = false;
            let training = false;

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
                        {
                            if (poseIndex == 1)
                            {
                                // right
                                //Home.setPageNumber(pageNumber+1);
                            } else if (poseIndex == 2)
                            {
                                // left
                                //Home.setPageNumber(pageNumber-1);
                            }
                            //setPageNumber();
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