import React from "react";

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

export default class Home extends React.Component {
    state = {
        file: null,
        pageNumber: 1,
        numPages: 1,
        videoOn: false
    }

    changeFile = e => {
        console.log(e.target.files[0]);
        this.setState({file: e.target.files[0]});
    }

    onDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
        this.setState({numPages: nextNumPages});
    }

    toggleVideo = () => {
        this.setState(prevState => ({videoOn: !prevState.videoOn}));
    }

    render() {
        return (
            <div class="page">
                <div style={{padding: "5vh 0px"}}/>
                <Upload text="Open PDF" size="18px" onChange={this.changeFile} file={this.state.file} accept=".pdf"/>
                {this.state.file && <Button text={!this.state.videoOn ? "Start flipping :)" : "Stop flipping :("} margin="10px 0px" onClick={this.toggleVideo}/>}

                {this.state.videoOn && <Video/>}

                {this.state.file && <div style={{marginTop: "5vh"}}>
                    <Document file={this.state.file} onLoadSuccess={this.onDocumentLoadSuccess} options={options}>
                        <Page pageNumber={this.state.pageNumber} className="pdf"/>
                    </Document>

                    <div style={{display: "inline-block", margin: "5px 0px"}}>
                        {this.state.pageNumber !== 1 && <Button onClick={() => this.setState({pageNumber: this.state.pageNumber-1})} text="Left"/>}
                        {this.state.pageNumber !== this.state.numPages && <Button onClick={() => this.setState({pageNumber: this.state.pageNumber+1})} text="Right"/>}
                    </div>
                </div>}
            </div>
        );
    }
}