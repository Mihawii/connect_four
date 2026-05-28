"use client";

import * as React from "react";
import { OrbitControls, Sparkles } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Board3D } from "./Board3D";
import { Disc3D } from "./Disc3D";
import { ColumnPicker } from "./ColumnPicker";
import { BurnParticles } from "./BurnParticles";
import { useGame } from "@/lib/store/gameStore";
import { legalMoves, nextOpenRow } from "@/lib/engine/rules";
import { slotToWorld } from "./constants";
import type { BurnEvent } from "@/lib/engine/types";

interface BirthRegistry {
  [key: string]: number;
}

export function Scene() {
  const game = useGame((s) => s.game);
  const opponent = useGame((s) => s.opponent);
  const playMove = useGame((s) => s.playMove);
  const hoverCol = useGame((s) => s.hoverCol);
  const setHoverCol = useGame((s) => s.setHoverCol);
  const thinking = useGame((s) => s.thinking);

  const births = React.useRef<BirthRegistry>({});
  const [activeBurns, setActiveBurns] = React.useState<Array<BurnEvent & { id: string; at: number }>>([]);
  const lastTotalTurns = React.useRef(0);
  const lastMoveTimestamp = React.useRef<number | null>(null);
  const { clock: r3fClock } = useThree();

  React.useEffect(() => {
    if (game.moves.length < lastTotalTurns.current) {
      births.current = {};
      setActiveBurns([]);
    }
    if (game.moves.length !== lastTotalTurns.current) {
      lastTotalTurns.current = game.moves.length;
      const lastMove = game.moves[game.moves.length - 1];
      if (lastMove) {
        const key = `${lastMove.col},${lastMove.row}`;
        births.current[key] = r3fClock.elapsedTime * 1000;
        if (lastMove.burnedThisTurn.length > 0) {
          setActiveBurns((prev) => [
            ...prev,
            ...lastMove.burnedThisTurn.map((b) => ({
              ...b,
              id: `${b.col}-${b.row}-${Date.now()}-${Math.random()}`,
              at: Date.now(),
            })),
          ]);
        }
        lastMoveTimestamp.current = lastMove.timestamp;
      }
    }
  }, [game.moves, r3fClock]);

  const legal = legalMoves(game);
  const nextRowByCol = React.useMemo(() => {
    return Array.from({ length: 7 }, (_, c) => Math.max(0, nextOpenRow(game.cells, c)));
  }, [game.cells]);

  const interactivePlayer =
    typeof opponent === "object" && opponent.kind === "bot" ? (opponent.plays === 1 ? 2 : 1) : null;
  const canInteract = game.status === "playing" && !thinking && (interactivePlayer === null || game.currentPlayer === interactivePlayer);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 6, 8]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, -2, 4]} intensity={0.4} color="#FF7B3A" />
      <pointLight position={[0, 0, 5]} intensity={0.8} color="#FFB47A" distance={20} />
      <hemisphereLight args={["#fff0e0", "#1a0d05", 0.5]} />

      <Board3D />

      <Sparkles count={30} scale={[10, 8, 4]} size={2} speed={0.3} color="#FF7B3A" opacity={0.4} />

      {game.cells.flatMap((column, c) =>
        column.map((disc, r) => {
          if (!disc) return null;
          const key = `${c},${r}`;
          const bornAt = births.current[key] ?? r3fClock.elapsedTime * 1000 - 1000;
          const isLastPlaced = game.lastMove?.col === c && game.lastMove?.row === r;
          const isWinningCell = !!game.winningLine?.some((p) => p.col === c && p.row === r);
          return (
            <Disc3D
              key={key}
              player={disc.player}
              age={disc.age}
              position={slotToWorld(c, r)}
              isLastPlaced={isLastPlaced}
              isWinningCell={isWinningCell}
              bornAt={bornAt}
            />
          );
        }),
      )}

      {activeBurns.map((b) => (
        <BurnParticles
          key={b.id}
          position={slotToWorld(b.col, b.row)}
          onComplete={() => setActiveBurns((prev) => prev.filter((x) => x.id !== b.id))}
        />
      ))}

      {canInteract && (
        <ColumnPicker
          onHover={setHoverCol}
          onPick={playMove}
          legalCols={legal}
          hoverCol={hoverCol}
          nextRowByCol={nextRowByCol}
          currentPlayer={game.currentPlayer}
        />
      )}

      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.9}
        minAzimuthAngle={-Math.PI / 6}
        maxAzimuthAngle={Math.PI / 6}
        minDistance={9}
        maxDistance={14}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}
