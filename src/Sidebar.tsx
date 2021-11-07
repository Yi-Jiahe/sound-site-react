import React from 'react';

function Sidebar() {
    const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
      };
    
      return (
        <aside>
          <div className="description">You can drag these nodes to the pane on the right.</div>
          <div className="" onDragStart={(event) => onDragStart(event, 'analyserNodeElement')} draggable>
            Analyser Node
          </div>
        </aside>
      );
}

export {Sidebar};