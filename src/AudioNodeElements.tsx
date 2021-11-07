import React, { useState } from 'react';
import { Handle, Position } from 'react-flow-renderer';

function SourceNodeElement() {
    return (
        <div className="audio-source-node">
            <div>
                Audio Source
            </div>
            <Handle
                type="source"
                position={"right" as Position} />
        </div>
    );
}

function DestinationNodeElement() {
    return (
        <div className="audio-destination-node">
            <Handle
                type="target"
                position={"left" as Position} />
            <div>
                Audio Destination
            </div>

        </div>
    );
}

function AnalyserNodeElement() {
    return (<div>
        <Handle
            type="target"
            position={"left" as Position} />
        <div>
            Audio Analyser
        </div>
        <Handle
            type="source"
            position={"right" as Position} />
    </div>);
}

export { SourceNodeElement, DestinationNodeElement, AnalyserNodeElement };