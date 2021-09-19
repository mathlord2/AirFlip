import React, { useState, useEffect, useRef } from "react";

import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

import Upload from "../../components/Upload";
import Button from "../../components/Button";
import Video from "../Video/Video";

import "./Home.css";

const options = {
    cMapUrl: 'cmaps/',
    cMapPacked: SVGComponentTransferFunctionElement
};

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const mic = new SpeechRecognition();

mic.continuous = true;
mic.interimResults = true;
mic.lang = 'en-US';

const Home = props => {
    //State variables
    const [file, setFile] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [numPages, setNumPages] = useState(1);
    const [videoOn, setVideoOn] = useState(false);
    const [words, setWords] = useState("");

    //Ref variables
    const pageRef = useRef({});
    pageRef.current = pageNumber;
    const numRef = useRef({});
    numRef.current = numPages;
    const wordRef = useRef({});
    wordRef.current = words;

    useEffect(() => {
        handleListen();

    }, [videoOn]);
    
    const handleListen = () => {
        if (videoOn) {
            mic.start();
            mic.onend = () => {
                mic.start();
            }
        } else {
            mic.stop();
            mic.onend = () => {
                console.log('Stopped Mic.');
            }
        }
    
        mic.onresult = event => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            
            const length = event.results.length;
            const mostRecentWord = event.results[length-1][0].transcript.trim();
            //console.log(mostRecentWord);

            if (transcript !== wordRef.current) {
                setWords(transcript);
                flipPage(mostRecentWord);
            }

            mic.onerror = event => {
                console.log(event.error);
            }
        }
    }

    const flipPage = word => { 
        const forward = ["forward", "next", "right"];
        const backward = ["backward", "previous", "back", "left"];

        if (forward.includes(word.toLowerCase().trim()) && pageRef.current !== numRef.current) {
            setPageNumber(prevNum => prevNum+1);
        } else if (backward.includes(word.toLowerCase().trim()) && pageRef.current !== 1) {
            setPageNumber(prevNum => prevNum-1);
        }
    }

    const changeFile = e => {
        setFile(e.target.files[0]);
    }

    const onDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
        setNumPages(nextNumPages);
    }

    const toggleVideo = () => {
        setVideoOn(!videoOn);
    }

    return (
        <div className="page">
            <div style={{padding: "5vh 0px"}}/>
            <Upload text="Open PDF" size="18px" onChange={changeFile} file={file} accept=".pdf"/>
            {file && <Button text={!videoOn ? "Start flipping :)" : "Stop flipping :("} margin="10px 0px" onClick={toggleVideo}/>}
            {/* {videoOn && <Video/>} */}
            
            {videoOn && <Video setPageNumber={setPageNumber} pageNumber={pageNumber} numPages={numPages}/>}

            {file && <div style={{marginTop: "5vh"}}>
                <Document file={file} onLoadSuccess={onDocumentLoadSuccess} options={options}>
                    <Page pageNumber={pageNumber} className="pdf"/>
                </Document>

                <div style={{display: "inline-block", margin: "5px 0px"}}>
                    {pageNumber !== 1 && <Button onClick={() => setPageNumber(pageNumber-1)} text="Left"/>}
                    {pageNumber !== numPages && <Button onClick={() => setPageNumber(pageNumber+1)} text="Right"/>}
                </div>
            </div>}
        </div>
    );
}

export default Home;