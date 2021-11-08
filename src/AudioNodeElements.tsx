import { FC } from 'react';
import { Handle, NodeProps, Position } from 'react-flow-renderer';

import { FFTPlot, WaveformPlot } from './AnimatedPlots';

const SourceNodeElement: FC<NodeProps> = ({ data }) => {
    return (
        <div className="audio-source-node">
            <div>
                Audio Source
            </div>
            <Handle
                id="output"
                type="source"
                position={"right" as Position} />
        </div>
    );
}

const DestinationNodeElement: FC<NodeProps> = ({ data }) => {
    return (
        <div className="audio-destination-node">
            <Handle
                id="input"
                type="target"
                position={"left" as Position} />
            <div>
                Audio Destination
            </div>

        </div>
    );
}

const AnalyserNodeElement:FC<NodeProps> = ({ data }) => {
    console.log(data.audioNode);

    return (<div>
        <Handle
            id="input"
            type="target"
            position={"left" as Position} />
        <div>
            Audio Analyser
            <WaveformPlot analyserNode={data.audioNode} />
            <FFTPlot analyserNode={data.audioNode} />
        </div>
        <Handle
            id="output"
            type="source"
            position={"right" as Position} />
    </div>);
}

export { SourceNodeElement, DestinationNodeElement, AnalyserNodeElement };
