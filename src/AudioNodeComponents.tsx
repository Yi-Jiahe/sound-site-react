import { FC, useRef } from 'react';
import { Handle, NodeProps, Position } from 'react-flow-renderer';

import { FFTPlot, WaveformPlot } from './AnimatedPlots';

const style = { cursor: "pointer" };

const SourceNodeComponent: FC<NodeProps> = ({ data }) => {
    return (
        <>
            <div className="node-component" style={style}>
                <span className="drag-handle">Audio Source</span>
            </div>
            <Handle
                id="output"
                type="source"
                position={"right" as Position} />
        </>
    );
}

const OscillatorSourceNodeComponent: FC<NodeProps> = ({ data }) => {
    const frequencySpan = useRef<HTMLSpanElement>(null);
    const frequencyInput = useRef<HTMLInputElement>(null);

    const onFrequencyChange = () => {
        if (!frequencyInput.current || !frequencySpan.current) {
            return;
        }

        const x = frequencyInput.current.valueAsNumber/10;
        const frequency = Math.floor(240*x + 0.75*Math.pow(x, 5));

        frequencySpan.current.innerText = `Frequency: ${frequency}Hz`;

        if (!data.functions) {
            return;
        }
        data.functions.get("updateFrequency")(data.id, frequency);
    }

    return (
        <>
            <div className="node-component" style={style}>
                <span className="drag-handle">Oscillator Source</span>
                <div className="control">
                    <span ref={frequencySpan}>Frequency: 440Hz</span>
                    <input ref={frequencyInput} type="range" min="1" defaultValue="20" max="75" onChange={onFrequencyChange}></input>
                </div>
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
            <div className="node-component" style={style}>
                <span className="drag-handle">Audio Destination</span>
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
        <div className="node-component">
            <span className="drag-handle">Audio Analyser</span>
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
