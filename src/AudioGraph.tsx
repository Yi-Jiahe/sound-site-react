import React, { useRef, useState, DragEvent } from 'react';
import ReactFlow, { Background, MiniMap, Controls, updateEdge, Connection, Edge, Elements, addEdge, ReactFlowProvider, OnLoadParams } from 'react-flow-renderer';

import { SourceNodeElement, DestinationNodeElement, AnalyserNodeElement } from './AudioNodeElements';
import { Sidebar } from './Sidebar';

const nodeTypes = {
    sourceNodeElement: SourceNodeElement,
    destinationNodeElement: DestinationNodeElement,
    analyserNodeElement: AnalyserNodeElement
};

const graphStyles = { width: "100%", height: "500px" };

let id: number = 0;
const getId = () => `${id++}`;

function AudioGraph() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<OnLoadParams | null>(null);
    const [elements, setElements] = useState<Elements<any>>([]);
    const [audioContext, setAudioContext] = useState<AudioContext>();
    const [nodes, setNodes] = useState<Map<string, any>>(new Map());

    const createAudioContext = () => {
        if (audioContext) {
            return;
        }
        // for legacy browsers
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        setAudioContext(new AudioContext());
    }


    const onLoad = (_reactFlowInstance: OnLoadParams) => setReactFlowInstance(_reactFlowInstance);
    const onEdgeUpdate = (oldEdge: Edge, newConnection: Connection) => {
        console.log("onEdgeUpdate:" + JSON.stringify(oldEdge) + JSON.stringify(newConnection));
        setElements((els: Elements<any>) => updateEdge(oldEdge, newConnection, els));
    };
    const onConnect = (params: Edge<any> | Connection) => {
        console.log("onConnect:" + JSON.stringify(params.source));
        setElements((els: Elements<any>) => addEdge(params, els));
    };
    const onDragOver = (event: DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };
    const onDrop = (event: DragEvent) => {
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
        switch(type) {
            case 'analyserNodeElement':
                const audioNode = new AnalyserNode(audioContext);
                nodes.set(id, audioNode);
                break;
        }
        const newNode = {
            id: id,
            type,
            position,
            data: { audioNode: nodes.get(id) },
        };

        setElements((es) => es.concat(newNode));
    };
    const onOverlayClick = () => {
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
        nodes.set(id, getMediaStreamSource());
        initialElements.push({
            id: id, type: 'sourceNodeElement', position: { x: 50, y: 250 }, data: { audioNode: nodes.get(id) }
        });

        id = getId();
        nodes.set(id, audioContext.destination);
        initialElements.push({
            id: id, type: 'destinationNodeElement', position: { x: 700, y: 250 }, data: { audioNode: nodes.get(id) }
        })

        setNodes(nodes);
        setElements(initialElements);
    };

    const getMediaStreamSource = () => {
        if (!audioContext) {
            return;
        }

        // Get the microphone
        navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true
        }).then(stream => {
            return audioContext.createMediaStreamSource(stream);
        }).catch(err => {
            console.log("You got an error:" + err);
        });
    }

    return (
        <div>
            <ReactFlowProvider>
                <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                    <ReactFlow
                        elements={elements}
                        style={graphStyles}
                        nodeTypes={nodeTypes}
                        onLoad={onLoad}
                        onEdgeUpdate={onEdgeUpdate}
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