import { GraphEdge, GraphNode } from "reagraph";

export const dummyNodes: GraphNode[] = [
    {
        id: "1",
    },
    {
        id: "2",
    },
    {
        id: "3",
    },
];


export const dummyEdges: GraphEdge[] = [
    {
        id: "1-2",
        source: "1",
        target: "2",
    },
    {
        id: "2-3",
        source: "2",
        target: "3",
    },
    {
        id: "3-1",
        source: "3",
        target: "1",
    },
];