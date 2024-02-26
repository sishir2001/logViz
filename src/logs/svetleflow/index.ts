
import Node from "../node";
import { type Edge, type Node as SvelteFlowNode } from "@xyflow/svelte";

type SvelteTree = {
    nodes : SvelteFlowNode[],
    edges : Edge[]
};

function createNode(id: string,label:string,positionX : number,positionY : number) : SvelteFlowNode {
    return {
        id: id,
        data : {
            label: label
        },
        position : {x:positionX,y:positionY}
    }
}

function createEdge(sourceId : string, targetId : string) : Edge {
    return {
        id : `${sourceId}-${targetId}`,
        source : sourceId,
        target : targetId
    }
}

export function traverseAndContructSvelteFlowTree(root : Node ,positionX : number, positionY : number) : SvelteTree {
    const uiNode = createNode(root.treeLog.id,root.treeLog.functionName,positionX,positionY);
    let currChildNodePositionX = positionX;
    let resNodes : SvelteFlowNode[] = [];
    let resEdges : Edge[] = [];
    for (const child of root.children) {
        const newTree = traverseAndContructSvelteFlowTree(child,currChildNodePositionX,positionY+300);
        const uiEdge = createEdge(uiNode.id,child.treeLog.id);
        currChildNodePositionX += 500;
        resNodes = resNodes.concat(newTree.nodes);
        resEdges = resEdges.concat(newTree.edges);
        resEdges.push(uiEdge);
    }
    resNodes.push(uiNode);
    return {
        nodes : resNodes,
        edges : resEdges 
    }
}
