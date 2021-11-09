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
            <WaveformPlot id={data.id} getWaveform={data.functions.get("getWaveform")} />
            <FFTPlot id={data.id} getFFT={data.functions.get("getFFT")} />
        </div>
        <Handle
            id="output"
            type="source"
            position={"right" as Position} />
    </>);
}

const BiquadFilterNodeComponent:FC<NodeProps> = ({ data }) => {
    const typeInput = useRef<HTMLSelectElement>(null);
    const frequencySpan = useRef<HTMLSpanElement>(null);
    const frequencyInput = useRef<HTMLInputElement>(null);

    const onTypeChange = () => {
        if (!typeInput.current) {
            return;
        }

        if (!data.functions) {
            return;
        }
        data.functions.get("changeType")(data.id, typeInput.current.value);
    }
    
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
            <Handle
                id="input"
                type="target"
                position={"left" as Position} />
            <div className="node-component">
                <span className="drag-handle">Biquad Filter</span>
                <div className="control">
                    <span>Type</span>
                    <select ref={typeInput} onChange={onTypeChange}>
                        <option value="lowpass">Lowpass</option>
                        <option value="highpass">Highpass</option>
                        <option value="bandpass">Bandpass</option>
                        <option value="lowshelf">LowShelf</option>
                        <option value="highshelf">HighShelf</option>
                        <option value="peaking">Peaking</option>
                        <option value="notch">Notch</option>
                        <option value="allpass">Allpass</option>
                    </select>
                    <span ref={frequencySpan}>Frequency: 440Hz</span>
                    <input ref={frequencyInput} type="range" min="1" defaultValue="20" max="75" onChange={onFrequencyChange}></input>
                </div>
            </div>
            <Handle
                id="output"
                type="source"
                position={"right" as Position} />
        </>);
}

const GainNodeComponent:FC<NodeProps> = ({ data }) => {
    const gainSpan = useRef<HTMLSpanElement>(null);
    const gainInput = useRef<HTMLInputElement>(null);
    
    const onGainChange = () => {
        if (!gainInput.current || !gainSpan.current) {
            return;
        }

        const gainDB = gainInput.current.valueAsNumber - 20;
        const gain = Math.pow(1.122, gainDB);

        gainSpan.current.innerText = `Gain: ${gainDB}dB`;

        if (!data.functions) {
            return;
        }
        data.functions.get("updateGain")(data.id, gain);
    }

    return (
        <>
            <Handle
                id="input"
                type="target"
                position={"left" as Position} />
            <div className="node-component">
                <span className="drag-handle">Gain Node</span>
                <div className="control">
                    <span ref={gainSpan}>Gain: -6dB</span>
                    <input ref={gainInput} type="range" min="0" defaultValue="10" max="40" onChange={onGainChange}></input>
                </div>
            </div>
            <Handle
                id="output"
                type="source"
                position={"right" as Position} />
        </>);
}

const DelayNodeComponent:FC<NodeProps> = ({ data }) => {
    const delaySpan = useRef<HTMLSpanElement>(null);
    const delayInput = useRef<HTMLInputElement>(null);
    
    const onDelayChange = () => {
        if (!delaySpan.current || !delayInput.current) {
            return;
        }

        const delay = delayInput.current.valueAsNumber/10;

        delaySpan.current.innerText = `Delay: ${delay}s`;

        if (!data.functions) {
            return;
        }
        data.functions.get("updateDelay")(data.id, delay);
    }

    return (
        <>
            <Handle
                id="input"
                type="target"
                position={"left" as Position} />
            <div className="node-component">
                <span className="drag-handle">Delay Node</span>
                <div className="control">
                    <span ref={delaySpan}>Delay: 1s</span>
                    <input ref={delayInput} type="range" min="0" defaultValue="10" max="20" onChange={onDelayChange}></input>
                </div>
            </div>
            <Handle
                id="output"
                type="source"
                position={"right" as Position} />
        </>);
}

export { SourceNodeComponent, DestinationNodeComponent, AnalyserNodeComponent, OscillatorSourceNodeComponent, BiquadFilterNodeComponent, GainNodeComponent, DelayNodeComponent };
