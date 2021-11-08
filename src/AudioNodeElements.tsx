import { FC } from 'react';
import { Handle, NodeProps, Position } from 'react-flow-renderer';

import { FFTPlot, WaveformPlot } from './AnimatedPlots';

const SourceNodeComponent: FC<NodeProps> = ({ data }) => {
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

const OscillatorSourceNodeComponent: FC<NodeProps> = ({ data }) => {
    return (
        <>
            <div className="node-component">
                Oscillator Source
            </div>
            <Handle
                id="output"
                type="source"
                position={"right" as Position} />
        </>
    );
}

const DestinationNodeComponent: FC<NodeProps> = ({ data }) => {
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

const AnalyserNodeComponent:FC<NodeProps> = ({ data }) => {
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

export { SourceNodeComponent, DestinationNodeComponent, AnalyserNodeComponent, OscillatorSourceNodeComponent };
