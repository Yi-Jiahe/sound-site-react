import React from 'react';

function Sidebar() {
    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
      };
    
      return (
        <aside>
          <div className="description">You can drag these nodes to the pane on the right.</div>
            <div className="component-selector">
              <div className="node-component" onDragStart={(event) => onDragStart(event, 'sourceNodeComponent')} draggable>
                <span className="drag-handle">Source Node</span>
              </div>
              <div className="node-component" onDragStart={(event) => onDragStart(event, 'oscillatorSourceNodeComponent')} draggable>
                <span className="drag-handle">Oscillator Node</span>
              </div>
              <div className="node-component" onDragStart={(event) => onDragStart(event, 'analyserNodeComponent')} draggable>
                <span>Analyser Node</span>
              </div>
          </div>
        </aside>
      );
}

export {Sidebar};