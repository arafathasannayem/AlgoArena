# Bidirectional A* & Multi-Goal Search: Architectural Implementation Plan

## 1. Executive Summary

This document captures the design, mathematical foundations, and implementation details for the multi-goal search architecture and bidirectional optimal pathfinding engine in **Algorithm Arena**, specifically focusing on:
1. **Prompt Optimal Termination in Bidirectional A\*** (Pohl's bound + Pairwise Cut-Distance bound).
2. **Simultaneous Multi-Goal Search Execution** in Bidirectional A* and Bidirectional BFS.
3. **Suboptimal Goal Frontier Pruning** for multi-goal searches.
4. **Universal Path Cost Tracking** across all heuristic and graph search algorithms.

---

## 2. Root Cause Analysis: The Termination Problem

### 2.1 The Observed Anomaly
In Bidirectional A* (`src/algorithms/bidirectionalAstar.ts`), when the forward search (Start $\to$ Goal) and backward search (Goal $\to$ Start) met and reconstructed the provably optimal path, the search loop did not terminate immediately. Instead, it continued exploring dozens or hundreds of redundant nodes:
- **The Chokepoints (25×25)**: Optimal path discovered at step 322 (cost 59), but search persisted until step 485 (**163 extra steps**).
- **Local Maxima Trap (20×20)**: Optimal path discovered at step 141 (cost 22), but search persisted until step 168 (**27 extra steps**).
- **The Labyrinth (20×20)**: Optimal path discovered at step 133 (cost 36), but search persisted until step 142 (**9 extra steps**).

### 2.2 Mathematical Root Cause
The legacy termination condition relied on:
```typescript
if (bestPath !== null && Math.min(openA.peekF(), minOpenBF()) >= bestCost) {
  break;
}
```
Two fundamental factors caused severe overshooting:
1. **Overly Restrictive `Math.min` Conjunction**:
   Requiring $\min(f_{min}^A, f_{min}^B) \ge \text{bestCost}$ demanded that **both** the forward open set and all backward open sets independently drain until their minimum $f$-scores equaled or exceeded `bestCost`.
2. **Heuristic Underestimation Around Obstacles**:
   The Manhattan distance heuristic $h(n) = |x_1 - x_2| + |y_1 - y_2|$ ignores physical obstacles (walls). Nodes located inside dead ends, alcoves, or behind long barriers have artificially low $f(n) = g(n) + h(n)$ values (e.g., $f = 41$ when `bestCost` = 59).
   Because the algorithm demanded that the minimum $f$-value across all open nodes reach 59, the search was forced into an exhaustive exploration of unrelated dead ends before stopping.

---

## 3. Mathematical Formulation for Immediate Termination

Any unexamined path $P$ connecting Start ($S$) and a Goal ($G_s$) must cross the cut between the explored set of $A$ and the explored set of $B_s$. Therefore, $P$ must pass through at least one frontier node $u \in open_A$ and at least one frontier node $v \in open_{B_s}$.

The cost of any unexamined path is strictly bounded from below by two admissible criteria:

### 3.1 Pohl's Lower Bound (1971)
$$\text{Cost}(P) \ge f_A(u) \ge \min_{x \in open_A} f_A(x) = f_{min}^A$$
$$\text{Cost}(P) \ge f_{B_s}(v) \ge \min_{y \in open_{B_s}} f_{B_s}(y) = f_{min}^{B_s}$$
Therefore:
$$\text{Cost}(P) \ge \max(f_{min}^A, f_{min}^{B_s})$$

If $\max(openA.peekF(), \min_s open_{B_s}.peekF()) \ge \text{bestCost}$, **no unexamined path can have cost $< \text{bestCost}$**.
- *Effect*: Instantly eliminates extra steps on *Local Maxima Trap* (168 $\to$ 141, **0 extra**), *The Labyrinth* (142 $\to$ 133, **0 extra**), *The Spiral* (**0 extra**), and *The Desert Oasis* (**0 extra**).

### 3.2 Pairwise Cut-Distance Lower Bound
For obstacles where both $f_{min}^A < \text{bestCost}$ and $f_{min}^{B_s} < \text{bestCost}$ due to dead-end heuristic underestimation, we inspect the actual boundary cut between the open sets:
$$\text{Cost}(S \rightsquigarrow u \rightsquigarrow v \rightsquigarrow G_s) \ge g_A(u) + \text{dist}(u, v) + g_{B_s}(v) \ge g_A(u) + \text{manhattan}(u, v) + g_{B_s}(v)$$

The lower bound across all unexamined connections between $open_A$ and $open_{B_s}$ is:
$$\text{CutBound}(s) = \min_{u \in open_A,\, v \in open_{B_s}} \left( g_A(u) + \text{manhattan}(u, v) + g_{B_s}(v) \right)$$

If $\text{CutBound}(s) \ge \text{bestCost}$ for all active goal searchers, **no undiscovered path through any frontier can beat `bestCost`**.
- *Effect*: Resolves *The Chokepoints*. At step 322, $\text{CutBound} = 59 \ge \text{bestCost} = 59$. The algorithm terminates at step 322 with **0 extra steps**.

---

## 4. Architecture & Component Changes

### 4.1 Bidirectional A* Engine (`src/algorithms/bidirectionalAstar.ts`)

#### 1. Read-Only Heap Cut Access
Added an `entries` getter to the `MinHeap` data structure so the cut-boundary inspection can examine open nodes without modifying heap order:
```typescript
get entries(): readonly HeapItem[] {
  return this.data;
}
```

#### 2. The `isOptimal()` Evaluator
```typescript
function isOptimal(): boolean {
  if (bestPath === null) return false;
  cleanHeap(openA, closedA);

  // Fast Path 1: Pohl's lower bound (O(1))
  const fA = openA.peekF();
  const fB = minOpenBF();
  if (Math.max(fA, fB) >= bestCost) return true;

  // Fast Path 2: Forward frontier exhausted
  const nodesA = openA.entries.filter((e) => !closedA.has(key(e.point)));
  if (nodesA.length === 0) return true;

  // Criterion 2: Pairwise cut-distance lower bound across active goals
  for (let i = 0; i < goalSearchers.length; i++) {
    const s = goalSearchers[i]!;
    cleanHeap(s.heap, s.closed);
    const nodesB = s.heap.entries.filter((e) => !s.closed.has(key(e.point)));
    if (nodesB.length === 0) continue;

    let minPair = Infinity;
    for (let a = 0; a < nodesA.length; a++) {
      const ea = nodesA[a]!;
      const ga = gA.get(key(ea.point))!;
      if (ga >= bestCost) continue;

      for (let b = 0; b < nodesB.length; b++) {
        const eb = nodesB[b]!;
        const gb = s.gScore.get(key(eb.point))!;
        const d = ga + manhattan(ea.point, eb.point) + gb;
        if (d < minPair) {
          minPair = d;
          if (minPair < bestCost) break; // Early prune for this goal
        }
      }
      if (minPair < bestCost) break;
    }

    if (minPair < bestCost) return false;
  }

  return true;
}
```

#### 3. Simultaneous Multi-Goal Turn Model
Start advances once, and **each active Goal queue advances once** concurrently per round:
```typescript
// Round: Start side takes 1 step
expandForward();
if (isOptimal()) break;

// Each active goal searcher takes 1 step in parallel
for (const s of activeGoalSearchers) {
  expandBackward(s);
  if (isOptimal()) break;
}
```

#### 4. Dynamic Frontier Pruning
Goal queues whose minimum potential cost exceeds `bestCost` ($f_{min}^{B_s} \ge \text{bestCost}$) are actively pruned from subsequent expansions.

---

### 4.2 Bidirectional BFS Engine (`src/algorithms/bidirectionalBfs.ts`)

- Refactored goal exploration to run multi-head simultaneous execution: Start takes 1 step, followed by each active Goal queue taking 1 step in round-robin order.
- Immediate termination when the shortest path between Start and any Goal is closed.

---

### 4.3 Universal Search Algorithms Updates

To ensure multi-goal cost parity across the entire engine:
- **`src/algorithms/dfs.ts`**: Evaluates path cost across any reached goals and selects the first valid path.
- **`src/algorithms/dijkstra.ts`**: Terminates at the true cheapest goal by total path weight.
- **`src/algorithms/greedyBestFirst.ts`**: Calculates complete path cost to prevent misleading zero-cost comparisons.
- **`src/algorithms/simulatedAnnealing.ts`**: Evaluates multi-goal candidates using Manhattan distance to nearest active goal.

---

### 4.4 New Map Preset: *The Three Shrines* (`src/maps/presets.ts`)

Added a 30×30 multi-goal challenge map featuring:
- Start position surrounded by divergent terrain corridors.
- Three distinct Shrines (Goals) positioned across mud/swamp hazards, labyrinthine walls, and open highways.
- Exercises multi-goal disambiguation and simultaneous bidirectional frontier exploration.

---

## 5. Benchmark Results Across Presets

| Preset | Grid Size | Optimal Cost | Previous Termination | New Termination | Extra Steps Saved |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **The Spiral** | 20×20 | 20 | 59 | **59** | **0** |
| **Local Maxima Trap** | 20×20 | 22 | 168 | **141** | **27 saved** |
| **The Chokepoints** | 25×25 | 59 | 485 | **322** | **163 saved** |
| **The Desert Oasis** | 20×20 | 29 | 181 | **181** | **0** |
| **The Labyrinth** | 20×20 | 36 | 142 | **133** | **9 saved** |
| **Twin Chambers** | 20×20 | 27 | 213 | **213** | **0** |
| **Islands & Stepping Stones** | 20×20 | 30 | 94 | **94** | **0** |
| **The Three Shrines** | 30×30 | 16 | 75 | **75** | **0** |

Across all official presets, Bidirectional A* terminates **at the exact step the optimal path is matched** ($Extra = 0$).

---

## 6. Verification Checklist

- [x] **Vitest Unit Tests**: All 253 unit tests passing across 16 test files (`npm test`).
- [x] **TypeScript Strict Check**: 0 type errors (`npx tsc -b --noEmit`).
- [x] **Linter Cleanliness**: 0 ESLint warnings or errors (`npm run lint`).
- [x] **Production Bundle**: Successfully built with Vite (`npm run build`).
- [x] **Synthetic Grid Verification**: 100 random grids with obstacles and costs tested against single-source A* with 100% path cost optimality.
