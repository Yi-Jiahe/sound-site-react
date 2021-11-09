import { useEffect, useRef, useState } from "react";

const style = { cursor: "crosshair", background: "white" };

function useTick(delay:number) {
    const [tick, setTick] = useState(0);
    useEffect(() => {
      const interval = setInterval(() => {
        if (!document.hidden) {
          setTick((tick: number) => tick + 1);
        }
      }, delay);
      return () => clearInterval(interval);
    }, [delay]);
    return tick;
}

function drawFFT(fft: Uint8Array, canvas: HTMLCanvasElement, clearCanvas: boolean , options={strokeStyle: 'rgb(0, 0, 0)'}) {
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
        if (i === 0) {
            ctx.moveTo(0, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
}

function drawWaveform(waveform: Uint8Array, canvas: HTMLCanvasElement, clearCanvas: boolean , options={strokeStyle: 'rgb(0, 0, 0)'}){
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
        if (i===0) {
            ctx.moveTo(0, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
}

const FFTPlot = ({ id, getFFT }: { id: string, getFFT: (id:string) => Uint8Array }) => {
    const plotCanvas = useRef<HTMLCanvasElement | null>(null);

    useTick(1000/30);

    if (plotCanvas.current) {
        const fft = getFFT(id);
        drawFFT(fft, plotCanvas.current, true);
        
    }


    return (<canvas ref={plotCanvas} style={style}>
    </canvas>);
}

function WaveformPlot({ id, getWaveform }: { id: string, getWaveform: (id:string) => Uint8Array }) {
    const plotCanvas = useRef<HTMLCanvasElement | null>(null);

    useTick(1000/30);

    if (plotCanvas.current) {
        const waveform = getWaveform(id);
        drawWaveform(waveform, plotCanvas.current, true);
    }


    return (<canvas ref={plotCanvas} style={style}>
    </canvas>);
}

export {FFTPlot, WaveformPlot};
