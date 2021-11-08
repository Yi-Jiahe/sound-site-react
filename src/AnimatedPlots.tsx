import { useEffect, useRef, useState } from "react";

function useTick(delay:number) {
    const [tick, setTick] = useState(0);
    useEffect(() => {
      const interval = setInterval(() => {
        if (!document.hidden) {
          setTick((tick: number) => tick + 1);
        }
      }, delay);
      return () => clearInterval(interval);
    }, []);
    return tick;
}

function drawFFT(analyserNode: AnalyserNode, canvas: HTMLCanvasElement, clearCanvas: boolean , options={strokeStyle: 'rgb(0, 0, 0)'}) {
    const fft = new Uint8Array(analyserNode.frequencyBinCount);
    analyserNode.getByteFrequencyData(fft);

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return;
    }

    if (clearCanvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    ctx.beginPath();
    ctx.strokeStyle = options['strokeStyle'];
    for (var i=0; i < fft.length; i++) {
        const x = Math.trunc(i);
        const y = Math.trunc((fft[i]/-255+1)*canvas.height);
        // console.log(x, y);
        if (i == 0) {
            ctx.moveTo(0, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
}

function drawWaveform(analyserNode: AnalyserNode, canvas: HTMLCanvasElement, clearCanvas: boolean , options={strokeStyle: 'rgb(0, 0, 0)'}){
    const waveform = new Uint8Array(analyserNode.fftSize)
    analyserNode.getByteTimeDomainData(waveform);

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return;
    }

    if (clearCanvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    ctx.beginPath();
    ctx.strokeStyle = options['strokeStyle'];
    for (var i=0; i < waveform.length; i++) {
        const x = Math.trunc(i);
        const y = Math.trunc((waveform[i]/255)*canvas.height);
        // console.log(x, y);
        if (i==0) {
            ctx.moveTo(0, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
}

const FFTPlot = ({ analyserNode }: {analyserNode: AnalyserNode}) => {
    const plotCanvas = useRef<HTMLCanvasElement | null>(null);

    let tick = useTick(1000/30);

    console.log(analyserNode);

    if (plotCanvas.current) {
        if (analyserNode) {
            console.log(analyserNode);
            drawFFT(analyserNode, plotCanvas.current, true)
        }
    }


    return (<canvas ref={plotCanvas}>
    </canvas>);
}

function WaveformPlot({ analyserNode }: {analyserNode: AnalyserNode}) {
    const plotCanvas = useRef<HTMLCanvasElement | null>(null);

    let tick = useTick(1000/30);

    console.log(analyserNode);

    if (plotCanvas.current) {
        if (analyserNode) {
            console.log(analyserNode);
            drawWaveform(analyserNode, plotCanvas.current, true)
        }
    }


    return (<canvas ref={plotCanvas}>
    </canvas>);
}

export {FFTPlot, WaveformPlot};
