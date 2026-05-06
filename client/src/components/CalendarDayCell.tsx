/**
 * CalendarDayCell
 * Design: ネオモーフィズム × iOS風ミニマリズム
 * - 各日付をアプリアイコンに見立てた角丸正方形セル
 * - バッジ通知はiOS標準の赤い円形バッジ（右上角）
 * - 当日は青いグラデーションで強調
 * - 選択中はインセット効果
 */

import { motion } from 'framer-motion';
import { CATEGORY_COLORS, useSchedule } from '@/contexts/ScheduleContext';

interface CalendarDayCellProps {
  date: Date;
  currentMonth: number;
  isToday: boolean;
  isSelected: boolean;
  onClick: () => void;
  onDrop?: (event: React.DragEvent<HTMLButtonElement>) => void;
  isDragOver?: boolean;
}

export default function CalendarDayCell({
  date,
  currentMonth,
  isToday,
  isSelected,
  onClick,
  onDrop,
  isDragOver,
}: CalendarDayCellProps) {
  const { getEventsByDate, getEventCountByDate } = useSchedule();
  const dateStr = date.toISOString().split('T')[0];
  const count = getEventCountByDate(dateStr);
  const events = getEventsByDate(dateStr);
  const isCurrentMonth = date.getMonth() === currentMonth;
  const dayOfWeek = date.getDay();
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;

  // 当日のカテゴリ色ドット（最大3つ）
  const dotColors = events.slice(0, 3).map(e => CATEGORY_COLORS[e.category]);

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (onDrop) {
      onDrop(e);
    }
  };

  return (
    <motion.button
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      whileHover={{ scale: isToday ? 1.0 : 1.04 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        relative flex flex-col items-center justify-center
        aspect-square rounded-2xl select-none overflow-visible
        transition-all duration-200
        ${!isCurrentMonth ? 'opacity-30' : ''}
        ${isDragOver
          ? 'bg-gradient-to-br from-green-400 to-green-600 text-white ring-2 ring-green-500'
          : isToday
            ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
            : isSelected
              ? 'bg-background text-foreground'
              : 'bg-background text-foreground hover:bg-accent'
        }
        ${isDragOver ? 'neu-inset' : isSelected && !isToday ? 'neu-inset' : isToday ? '' : 'neu-raised-sm'}
        ${isCurrentMonth && !isToday && !isDragOver && isSunday ? 'text-red-500' : ''}
        ${isCurrentMonth && !isToday && !isDragOver && isSaturday ? 'text-blue-500' : ''}
      `}
      style={isToday ? {
        boxShadow: '4px 4px 10px oklch(0.45 0.22 255 / 0.4), -2px -2px 8px oklch(0.75 0.15 255 / 0.3)',
      } : undefined}
    >
      {/* 日付数字 */}
      <span className={`
        font-semibold leading-none
        text-sm sm:text-base
        ${isToday ? 'text-white' : ''}
      `}>
        {date.getDate()}
      </span>

      {/* カテゴリドット（当日以外） */}
      {!isToday && count > 0 && (
        <div className="flex gap-0.5 mt-0.5">
          {dotColors.map((color, i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}

      {/* iOSバッジ通知（当日以外、件数がある場合） */}
      {!isToday && count > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
          className={`
            absolute -top-1 -right-1
            min-w-[16px] h-[16px] px-0.5
            bg-red-500 text-white
            rounded-full flex items-center justify-center
            text-[9px] font-bold leading-none
            shadow-md z-10
          `}
          style={{
            boxShadow: '0 2px 6px rgba(255, 59, 48, 0.5)',
          }}
        >
          {count > 9 ? '9+' : count}
        </motion.div>
      )}

      {/* 当日の予定件数インジケーター */}
      {isToday && count > 0 && (
        <div className="flex gap-0.5 mt-0.5">
          {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-white/70" />
          ))}
        </div>
      )}
    </motion.button>
  );
}
