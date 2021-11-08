import React, { useRef, useState, DragEvent } from 'react';
import ReactFlow, { Background, MiniMap, Controls, 
    Connection, Edge, Elements,  ReactFlowProvider, 
    updateEdge, addEdge,
    OnLoadParams } from 'react-flow-renderer';

import { SourceNodeComponent, DestinationNodeComponent, AnalyserNodeComponent, OscillatorSourceNodeComponent } from './AudioNodeElements';
import { Sidebar } from './Sidebar';

import './AudioGraph.css';

const nodeTypes = {
    sourceNodeComponent: SourceNodeComponent,
    destinationNodeComponent: DestinationNodeComponent,
    analyserNodeComponent: AnalyserNodeComponent,
    oscillatorSourceNodeComponent: OscillatorSourceNodeComponent
};

let audioContext: AudioContext;

let id: number = 0;
const getId = () => `${id++}`;

const nodes: Map<String, AudioNode | null> = new Map();

// const onConnectStart = (event: React.MouseEvent, { nodeId, handleType }: OnConnectStartParams) => console.log('onConnectStart', { event, nodeId, handleType });
// const onConnectEnd = (event: MouseEvent) => console.log('onConnectEnd', event);
// const onConnectStop = (event: MouseEvent) => console.log('onConnectStop', event);
// const onEdgeUpdateStart = (_: React.MouseEvent, edge: Edge) => console.log('start update', edge);
// const onEdgeUpdateEnd = (_: MouseEvent, edge: Edge<any>) => console.log('end update', edge);

function AudioGraph() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<OnLoadParams | null>(null);
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

        console.log("Connecting " + newTargetNode + " to " + newSourceNode);
        newSourceNode.connect(newTargetNode);

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

        const id = getId();
        let audioNode;
        switch(type) {
            case 'sourceNodeComponent':
                audioNode = await getMediaStreamSource();
                nodes.set(id, audioNode);
                break;
            case 'analyserNodeComponent':
                audioNode = new AnalyserNode(audioContext, {
                    fftSize: 2048
                });
                nodes.set(id, audioNode);
                break;
            case 'oscillatorSourceNodeComponent':
                audioNode = new OscillatorNode(audioContext);
                audioNode.type = 'sine';
                audioNode.frequency.setValueAtTime(440, audioContext.currentTime);
                audioNode.start();
                nodes.set(id, audioNode);
                break;
        }
        console.log(id, audioNode);

        const newNode = {
            id: id,
            type,
            position,
            data: { audioNode: nodes.get(id) },
        };

        setElements((es) => es.concat(newNode));
    };
    const onOverlayClick = async () => {
        createAudioContext();
        if (!audioContext) {
            return;
        }
        document.getElementById("overlay")?.remove();

        const initialElements = [];

        let id;
        
        if (!nodes) {
            return;
        }

        id = getId();
        nodes.set(id, await getMediaStreamSource());
        initialElements.push({
            id: id, type: 'sourceNodeComponent', position: { x: 50, y: window.innerHeight/2 }, data: { audioNode: nodes.get(id) }
        });

        id = getId();
        nodes.set(id, audioContext.destination);
        initialElements.push({
            id: id, type: 'destinationNodeComponent', position: { x: window.innerWidth-200 , y: window.innerHeight/2 }, data: { audioNode: nodes.get(id) }
        })

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
            console.log(err);
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