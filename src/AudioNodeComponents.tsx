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
    // const fftSizeSpan = useRef<HTMLSpanElement>(null);
    // const fftSizeInput = useRef<HTMLInputElement>(null);

    // const onFrequencyChange = () => {
    //     if (!fftSizeSpan.current || !fftSizeInput.current) {
    //         return;
    //     }

    //     const fftSize = Math.pow(2, fftSizeInput.current.valueAsNumber);

    //     fftSizeSpan.current.innerText = `FFT Size: ${fftSize}`;

    //     if (!data.functions) {
    //         return;
    //     }
    //     data.functions.get("setFFTSize")(data.id, fftSize);
    // }

    return (
    <>
        <Handle
            id="input"
            type="target"
            position={"left" as Position} />
        <div className="node-component">
            <span className="drag-handle">Audio Analyser</span>
            {/* <div className="control">
                <span ref={fftSizeSpan}>FFT Size: 2048</span>
                <input ref={fftSizeInput} type="range" min="5" defaultValue="11" max="15" onChange={onFrequencyChange}></input>
            </div> */}
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
