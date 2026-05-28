"use client";

import * as React from "react";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { Board3D } from "./Board3D";
import { Disc3D } from "./Disc3D";
import { ColumnPicker } from "./ColumnPicker";
import { BurnParticles } from "./BurnParticles";
import { useGame } from "@/lib/store/gameStore";
import { legalMoves, nextOpenRow } from "@/lib/engine/rules";
import { slotToWorld, BOARD_HEIGHT, FRAME_PAD } from "./constants";
import { COLS, type BurnEvent } from "@/lib/engine/types";

export function Scene() {
  const game = useGame((s) => s.game);
  const opponent = useGame((s) => s.opponent);
  const playMove = useGame((s) => s.playMove);
  const hoverCol = useGame((s) => s.hoverCol);
  const setHoverCol = useGame((s) => s.setHoverCol);
  const thinking = useGame((s) => s.thinking);

  const [activeBurns, setActiveBurns] = React.useState<Array<BurnEvent & { id: string }>>([]);
  const lastMoveCount = React.useRef(0);

  React.useEffect(() => {
    if (game.moves.length < lastMoveCount.current) setActiveBurns([]);
    if (game.moves.length > lastMoveCount.current) {
      const last = game.moves[game.moves.length - 1];
      if (last?.burnedThisTurn.length) {
        setActiveBurns((prev) => [
          ...prev,
          ...last.burnedThisTurn.map((b) => ({ ...b, id: `${b.col}-${b.row}-${Date.now()}-${Math.random()}` })),
        ]);
      }
    }
    lastMoveCount.current = game.moves.length;
  }, [game.moves]);

  const legal = legalMoves(game);
  const nextRowByCol = React.useMemo(
    () => Array.from({ length: COLS }, (_, c) => Math.max(0, nextOpenRow(game.cells, c))),
    [game.cells],
  );

  const interactivePlayer =
    typeof opponent === "object" && opponent.kind === "bot" ? (opponent.plays === 1 ? 2 : 1) : null;
  const canInteract =
    game.status === "playing" && !thinking && (interactivePlayer === null || game.currentPlayer === interactivePlayer);

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 7, 8]} intensity={1.7} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} />
      <directionalLight position={[-6, 2, 4]} intensity={0.32} color="#cfe0ff" />
      <directionalLight position={[0, -2, -6]} intensity={0.45} color="#ffd9a8" />
      <hemisphereLight args={["#fff3e6", "#16120e", 0.4]} />

      <Board3D />
      <ContactShadows
        position={[0, -(BOARD_HEIGHT / 2 + FRAME_PAD + 0.35), 0]}
        opacity={0.5}
        scale={18}
        blur={2.8}
        far={7}
        resolution={1024}
        color="#000000"
      />

      {game.cells.flatMap((column, c) =>
        column.map((disc, r) => {
          if (!disc) return null;
          const isLastPlaced = game.lastMove?.col === c && game.lastMove?.row === r;
          const isWinningCell = !!game.winningLine?.some((p) => p.col === c && p.row === r);
          return (
            <Disc3D
              key={`${c}-${r}`}
              player={disc.player}
              age={disc.age}
              position={slotToWorld(c, r)}
              isLastPlaced={isLastPlaced}
              isWinningCell={isWinningCell}
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
        minDistance={8}
        maxDistance={14}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}
