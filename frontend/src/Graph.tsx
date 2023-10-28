
import React from 'react';
import { GraphCanvas, GraphEdge, GraphNode } from 'reagraph';
import { dummyEdges, dummyNodes } from './dummyData';

export interface IGraphProps {
  state: number;
  states: number[];
  stateTransitions: number[][];
}

export function Graph(props: IGraphProps) {

  const nodes: GraphNode[] = props.states.map((state, index) => {
    const isCurrentState = props.state === state;
    return {
      id: state.toString(),
      label: state.toString(),
      fill: isCurrentState ? 'red' : 'black',
    };
  });

  const edges: GraphEdge[] = props.stateTransitions.map((transition, index) => {
    return {
      id: `${transition[0]}-${transition[1]}`,
      source: transition[0].toString(),
      target: transition[1].toString(),
    };
  }
  );

  return (
    <div className="w-full h-full relative">
      <GraphCanvas
        edgeArrowPosition='none'
        nodes={nodes}
        edges={edges}
      />
    </div>
  );
}
