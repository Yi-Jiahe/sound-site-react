import { FC } from 'react';
import { Handle, NodeProps, Position } from 'react-flow-renderer';

import { FFTPlot, WaveformPlot } from './AnimatedPlots';

const SourceNodeElement: FC<NodeProps> = ({ data }) => {
    return (
        <>
            <div className="node-component">
                Audio Source
            </div>
            <Handle
                id="output"
                type="source"
                position={"right" as Position} />
        </>
    );
}

const DestinationNodeElement: FC<NodeProps> = ({ data }) => {
    return (
        <>
            <Handle
                id="input"
                type="target"
                position={"left" as Position} />
            <div className="node-component">
                Audio Destination
            </div>
        </>
    );
}

const AnalyserNodeElement:FC<NodeProps> = ({ data }) => {
    return (
    <>
        <Handle
            id="input"
            type="target"
            position={"left" as Position} />
        <div className="node-component audio-analyser-node">
            Audio Analyser
            <WaveformPlot analyserNode={data.audioNode} />
            <FFTPlot analyserNode={data.audioNode} />
        </div>
        <Handle
            id="output"
            type="source"
            position={"right" as Position} />
    </>);
}

export { SourceNodeElement, DestinationNodeElement, AnalyserNodeElement };
