<script lang="ts">
  import { writable } from 'svelte/store';
  import {
    SvelteFlow,
    Controls,
    Background,
    MiniMap,
    type Node,
    type Edge,
  } from '@xyflow/svelte';

  import '@xyflow/svelte/dist/style.css';
  import { onMount } from 'svelte';
  import { logs } from './logs/logs';
  import { decodeArray } from 'type-decoder';
  import { decodeKibanaLog, type KibanaLog } from './logs/types';
  import {  sortLogs, validateFunctionCalls, validateSortedLogs } from './logs';
  import { buildFunctionHierarchytree } from './logs/tree';
  import { traverseAndContructSvelteFlowTree } from './logs/svetleflow';

  const nodes = writable<Node[]>([]);
  const edges = writable<Edge[]>([]);

  async function loadKibanaLogsAndVerify() : Promise<KibanaLog[] | null>{
    // const kibanaLogs = await loadLogs();
    const kibanaLogs = logs;
    const hits = kibanaLogs["rawResponse"]["hits"]["hits"];
    const decodedHits = decodeArray<KibanaLog>(hits,decodeKibanaLog);
    if(decodedHits !== null){
      const sortedHits = sortLogs(decodedHits);
      if(validateSortedLogs(sortedHits)){
        console.log("Logs are sorted and validated")
        if(!validateFunctionCalls(sortedHits)){
          console.log("Function calls are not in right order");
        }
        else{
          console.log(
            "Functions called are in right order , ready to build function hierarchy tree"
          );
        }
        return sortedHits;
      }
      else{
        console.log("Error validating sorted logs");
      }
    }
    else{
      console.log("Error decoding logs");
    }
    return null;
  }

  onMount(async ()=>{
    const sortedLogs = await loadKibanaLogsAndVerify();
    if(sortedLogs === null){
      console.log("Error loading logs");
      return;
    }
    const functionHierarchyTreeRoot = buildFunctionHierarchytree(sortedLogs);
    if(functionHierarchyTreeRoot === null){
      console.log("Error building function hierarchy tree");
      return;
    }
    const svelteTree = traverseAndContructSvelteFlowTree(functionHierarchyTreeRoot,0,0);
    nodes.set(svelteTree.nodes);
    edges.set(svelteTree.edges);
  })

</script>

<div style:height="100vh">
  <SvelteFlow {nodes} {edges} fitView>
    <Controls />
    <Background />
    <MiniMap />
  </SvelteFlow>
</div>
