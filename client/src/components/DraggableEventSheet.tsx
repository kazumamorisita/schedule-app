/**
 * DraggableEventSheet
 * Design: ネオモーフィズム × iOS風ミニマリズム
 * - ドラッグで上下に動かせるシート
 * - 下から上へドラッグで全画面表示
 * - 上から下へドラッグで折りたたみ
 * - スナップポイント：最小化、中間、全画面
 */

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import TodayEventPanel from './TodayEventPanel';
import { type ScheduleEvent } from '@/contexts/ScheduleContext';

interface DraggableEventSheetProps {
  selectedDate: string;
  isToday: boolean;
  onAddEvent: () => void;
  onEditEvent: (event: ScheduleEvent) => void;
  onEventDragStart?: () => void;
}

type SheetState = 'collapsed' | 'middle' | 'expanded';

export default function DraggableEventSheet({
  selectedDate,
  isToday,
  onAddEvent,
  onEditEvent,
  onEventDragStart,
}: DraggableEventSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<SheetState>('middle');
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState<number | null>(null);

  // スナップポイント（ビューポート高さの比率）
  const SNAP_POINTS = {
    collapsed: 0.15,
    middle: 0.45,
    expanded: 0.95,
  };

  // ビューポート高さを使用
  const getViewportHeight = () => window.innerHeight;

  // 状態に基づいてシートの上端Y位置を計算（top基準）
  const getYForState = (s: SheetState) => {
    const vh = getViewportHeight();
    return vh * (1 - SNAP_POINTS[s]);
  };

  // 現在のY位置から最も近いスナップポイントを決定
  const getClosestState = (y: number): SheetState => {
    const vh = getViewportHeight();
    const ratio = 1 - (y / vh);

    const distances = {
      collapsed: Math.abs(ratio - SNAP_POINTS.collapsed),
      middle: Math.abs(ratio - SNAP_POINTS.middle),
      expanded: Math.abs(ratio - SNAP_POINTS.expanded),
    };

    const closest = Object.entries(distances).reduce((prev, curr) =>
      curr[1] < prev[1] ? curr : prev
    )[0] as SheetState;

    return closest;
  };

  // イベントドラッグ開始時のコールバック
  const handleEventDragStart = () => {
    if (state === 'expanded') {
      setState('collapsed');
    }
  };

  // ドラッグ開始
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('textarea') || target.closest('[role="button"]')) {
      return;
    }
    
    // expanded状態では、ハンドルバーのみでドラッグを受け付ける
    if (state === 'expanded' && !target.closest('[data-drag-handle]')) {
      return;
    }
    
    e.preventDefault();
    setIsDragging(true);
    setStartY(e.clientY);
    setCurrentY(getYForState(state));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('textarea') || target.closest('[role="button"]')) {
      return;
    }
    
    // expanded状態では、ハンドルバーのみでドラッグを受け付ける
    if (state === 'expanded' && !target.closest('[data-drag-handle]')) {
      return;
    }
    
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(getYForState(state));
  };

  // selectedDate変更時にシート状態をリセット
  useEffect(() => {
    setState('middle');
    setCurrentY(null);
  }, [selectedDate]);

  // expanded状態時に背景のスクロールを無効化
  useEffect(() => {
    if (state === 'expanded') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [state]);

  // ドラッグ中
  useEffect(() => {
    if (!isDragging || currentY === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientY - startY;
      const newY = getYForState(state) + delta;
      const vh = getViewportHeight();

      // 範囲制限
      const minY = getYForState('expanded');
      const maxY = getYForState('collapsed');
      const clampedY = Math.max(minY, Math.min(maxY, newY));

      setCurrentY(clampedY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const delta = e.touches[0].clientY - startY;
      const newY = getYForState(state) + delta;
      const vh = getViewportHeight();

      const minY = getYForState('expanded');
      const maxY = getYForState('collapsed');
      const clampedY = Math.max(minY, Math.min(maxY, newY));

      setCurrentY(clampedY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (currentY !== null) {
        const newState = getClosestState(currentY);
        setState(newState);
      }
      setCurrentY(null);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      if (currentY !== null) {
        const newState = getClosestState(currentY);
        setState(newState);
      }
      setCurrentY(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, startY, state, currentY]);

  const targetY = getYForState(state);
  const displayY = currentY !== null && isDragging ? currentY : targetY;

  return (
    <>
      {/* Backdrop (only when expanded) */}
      <AnimatePresence>
        {state === 'expanded' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Draggable Sheet */}
      <motion.div
        ref={sheetRef}
        animate={{ y: displayY }}
        transition={isDragging ? { type: 'tween', duration: 0 } : { type: 'spring', stiffness: 300, damping: 30 }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`
          fixed left-0 right-0 top-0 z-50
          bg-background rounded-t-3xl
          flex flex-col
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
          transition-shadow duration-200
          ${state === 'expanded' ? 'shadow-2xl' : 'shadow-lg'}
          select-none
        `}
        style={{
          boxShadow: state === 'expanded'
            ? '0 -12px 50px oklch(0.2 0.01 240 / 0.3)'
            : '0 -8px 40px oklch(0.2 0.01 240 / 0.2)',
          touchAction: 'none',
          height: '95vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Handle bar - ビジュアルインジケーター */}
        <div
          className="flex justify-center pt-3 pb-2 flex-shrink-0 select-none pointer-events-auto"
          data-drag-handle="true"
        >
          <motion.div
            animate={{
              width: state === 'expanded' ? 40 : 40,
              opacity: state === 'collapsed' ? 0.5 : 1,
            }}
            className="h-1 rounded-full bg-muted-foreground/30"
          />
        </div>

        {/* Collapse indicator */}
        {state !== 'collapsed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center pb-1 flex-shrink-0 pointer-events-none"
          >
            <ChevronDown size={18} className="text-muted-foreground/40" />
          </motion.div>
        )}

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 pointer-events-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <TodayEventPanel
          selectedDate={selectedDate}
          isToday={isToday}
          onAddEvent={onAddEvent}
          onEditEvent={onEditEvent}
          onEventDragStart={handleEventDragStart}
        />
        </div>
      </motion.div>
    </>
  );
}
