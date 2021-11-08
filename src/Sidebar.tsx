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
                Source Node
              </div>
              <div className="node-component" onDragStart={(event) => onDragStart(event, 'oscillatorSourceNodeComponent')} draggable>
                Oscillator Node
              </div>
              <div className="node-component" onDragStart={(event) => onDragStart(event, 'analyserNodeComponent')} draggable>
                Analyser Node
              </div>
          </div>
        </aside>
      );
}

export {Sidebar};