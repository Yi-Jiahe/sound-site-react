import React, { useRef, useState, DragEvent } from 'react';
import ReactFlow, { Background, MiniMap, Controls, 
    Connection, Edge, Elements,  ReactFlowProvider, 
    updateEdge, addEdge,
    OnLoadParams } from 'react-flow-renderer';

import { SourceNodeComponent, DestinationNodeComponent, AnalyserNodeComponent, OscillatorSourceNodeComponent, BiquadFilterNodeComponent, GainNodeComponent } from './AudioNodeComponents';
import { Sidebar } from './Sidebar';

import './AudioGraph.css';

const style = { width: "100%", height: "100vh" };

const nodeTypes = {
    sourceNodeComponent: SourceNodeComponent,
    destinationNodeComponent: DestinationNodeComponent,
    analyserNodeComponent: AnalyserNodeComponent,
    oscillatorSourceNodeComponent: OscillatorSourceNodeComponent,
    biquadFilterNodeComponent: BiquadFilterNodeComponent,
    gainNodeComponent: GainNodeComponent
};

let audioContext: AudioContext;

// const onConnectStart = (event: React.MouseEvent, { nodeId, handleType }: OnConnectStartParams) => console.log('onConnectStart', { event, nodeId, handleType });
// const onConnectEnd = (event: MouseEvent) => console.log('onConnectEnd', event);
// const onConnectStop = (event: MouseEvent) => console.log('onConnectStop', event);
// const onEdgeUpdateStart = (_: React.MouseEvent, edge: Edge) => console.log('start update', edge);
// const onEdgeUpdateEnd = (_: MouseEvent, edge: Edge<any>) => console.log('end update', edge);

function AudioGraph() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<OnLoadParams | null>(null);
    const [id, setId] = useState(0);
    const [nodes, setNodes] = useState(new Map());
    const [elements, setElements] = useState<Elements<any>>([]);

    const createAudioContext = () => {
        if (audioContext) {
            return;
        }
        // for legacy browsers
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
    }

    const onLoad = (_reactFlowInstance: OnLoadParams) => setReactFlowInstance(_reactFlowInstance);
    const onEdgeUpdate = (oldEdge: Edge, newConnection: Connection) => {
        if (!newConnection.source || !newConnection.target) {
            return;
        }

        const oldSourceNode = nodes.get(oldEdge.source);
        const oldTargetNode = nodes.get(oldEdge.target);
        const newSourceNode = nodes.get(newConnection.source);
        const newTargetNode = nodes.get(newConnection.target);

        if (!oldSourceNode || !oldTargetNode || !newSourceNode || !newTargetNode) {
            return;
        }

        console.log("Disconnecting " + oldTargetNode + " from " + oldSourceNode);
        oldSourceNode.disconnect(oldTargetNode);
        nodes.set(oldEdge.source, oldSourceNode);

        console.log("Connecting " + newTargetNode + " to " + newSourceNode);
        newSourceNode.connect(newTargetNode);
        nodes.set(newConnection.source, newSourceNode);
        
        setNodes(nodes);
        setElements((els: Elements<any>) => updateEdge(oldEdge, newConnection, els));
    };
    const onConnect = (params: Edge<any> | Connection) => {
        if (!params.source || !params.target) {
            return;
        }

        const sourceNode = nodes.get(params.source);
        const targetNode = nodes.get(params.target);

        if (!sourceNode || !targetNode) {
            return;
        }

        console.log("Connecting " + targetNode + " to " + sourceNode);
        sourceNode.connect(targetNode);
        nodes.set(params.source, sourceNode);

        setNodes(nodes);
        setElements((els: Elements<any>) => addEdge(params, els));
    };
    const onDragOver = (event: DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };
    const onDrop = async (event: DragEvent) => {
        event.preventDefault();

        if (!reactFlowWrapper.current || !reactFlowInstance) {
            return;
        }

        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const type = event.dataTransfer.getData('application/reactflow');
        const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        });

        if (!audioContext || !nodes) {
            return;
        }

        let audioNode;
        const functions = new Map();
        switch(type) {
            case 'sourceNodeComponent':
                audioNode = await getMediaStreamSource();
                if (!audioNode) {
                    return;
                }
                nodes.set(`${id}`, audioNode);
                break;
            case 'analyserNodeComponent':
                audioNode = new AnalyserNode(audioContext);
                nodes.set(`${id}`, audioNode);
                functions.set("setFFTSize", (id:string, fftSize:number) => {
                    nodes.get(id).fftSize = fftSize
                });
                functions.set("getFFT", (id:string) => {
                    const analyserNode = nodes.get(id);
                    const fft = new Uint8Array(analyserNode.frequencyBinCount);
                    analyserNode.getByteFrequencyData(fft);
                    return fft;
                })
                functions.set("getWaveform", (id:string) => {
                    const analyserNode = nodes.get(id);
                    const waveform = new Uint8Array(analyserNode.fftSize)
                    analyserNode.getByteTimeDomainData(waveform);
                    return waveform;
                })
                break;
            case 'oscillatorSourceNodeComponent':
                audioNode = new OscillatorNode(audioContext);
                audioNode.type = 'sine';
                audioNode.frequency.setValueAtTime(440, audioContext.currentTime);
                audioNode.start();
                nodes.set(`${id}`, audioNode);
                functions.set("updateFrequency", (id: string, frequency: number) => {
                    nodes.get(id).frequency.setValueAtTime(frequency, audioContext.currentTime);
                });
                break;
            case 'biquadFilterNodeComponent':
                audioNode = new BiquadFilterNode(audioContext);
                audioNode.type = "lowpass";
                nodes.set(`${id}`, audioNode);
                functions.set("changeType", (id: string, type: string) => {
                    nodes.get(id).type = type;
                });
                functions.set("updateFrequency", (id: string, frequency: number) => {
                    nodes.get(id).frequency.value = frequency;
                });
                break;
                case 'gainNodeComponent':
                    audioNode = new GainNode(audioContext);
                    audioNode.gain.value = 0.5;
                    nodes.set(`${id}`, audioNode);
                    functions.set("updateGain", (id: string, gain: number) => {
                        nodes.get(id).gain.value = gain;
                    });
                    break;
        }
        console.log(id, audioNode);

        const newNode = {
            id: `${id}`,
            type,
            dragHandle: '.drag-handle',
            position,
            data: { 
                id: `${id}`,
                functions: functions
            },
        };

        setId(id+1);
        setNodes(nodes);
        setElements((es) => es.concat(newNode));
    };
    const onOverlayClick = async () => {
        createAudioContext();
        if (!audioContext) {
            return;
        }
        document.getElementById("overlay")?.remove();

        const initialElements = [];
        
        if (!nodes) {
            return;
        }

        let audioNode = await getMediaStreamSource();
        if (audioNode) {
            nodes.set(`${id}`, audioNode);
            initialElements.push({
                id: `${id}`, 
                type: 'sourceNodeComponent', 
                dragHandle: '.drag-handle',
                position: { x: 50, y: window.innerHeight/2 }, 
                data: { 
                    id: `${id}`,
                    functions: new Map()
                }
            });
        }

        nodes.set(`${id+initialElements.length}`, audioContext.destination);
        initialElements.push({
            id: `${id+initialElements.length}`, 
            type: 'destinationNodeComponent', 
            dragHandle: '.drag-handle',
            position: { x: window.innerWidth-200 , y: window.innerHeight/2 },
            data: {
                id: `${id+initialElements.length}`,
                functions: new Map()
            }
        })

        setId(id+initialElements.length);
        setNodes(nodes);
        setElements(initialElements);
    };

    const getMediaStreamSource = async () => {
        if (!audioContext) {
            return null;
        }

        // Get the microphone
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: true
            });
            return audioContext.createMediaStreamSource(stream);
        } catch(err) {
            window.alert(err);
            return null;
        }
    }

    return (
        <div>
            <ReactFlowProvider>
                <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                    <ReactFlow
                        elements={elements}
                        nodeTypes={nodeTypes}
                        style={style}
                        onLoad={onLoad}
                        // onEdgeUpdateStart={onEdgeUpdateStart}
                        // onEdgeUpdateEnd={onEdgeUpdateEnd}
                        onEdgeUpdate={onEdgeUpdate}
                        // onConnectStart={onConnectStart}
                        // onConnectEnd={onConnectEnd}
                        // onConnectStop={onConnectStop}
                        onConnect={onConnect}
                        onDragOver={onDragOver}
                        onDrop={onDrop}>
                        <MiniMap />
                        <Controls />
                        <Background color="#aaa" gap={16} />
                    </ReactFlow>
                </div>
                <Sidebar />
            </ReactFlowProvider>
            <div id="overlay" onClick={onOverlayClick}>
                <span id="begin-text">Click to create new AudioContext</span>
            </div>
        </div>
    );
}

export default AudioGraph;