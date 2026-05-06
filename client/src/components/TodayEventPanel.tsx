/**
 * TodayEventPanel
 * Design: ネオモーフィズム × iOS風ミニマリズム
 * - 選択日の詳細な予定リストを表示
 * - 当日は特別なヘッダーデザイン
 * - 予定カードはカテゴリ色のアクセントライン付き
 * - 予定クリックで編集モーダルを開く
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CalendarDays, Clock } from 'lucide-react';
import { CATEGORY_COLORS, type ScheduleEvent, useSchedule } from '@/contexts/ScheduleContext';

interface TodayEventPanelProps {
  selectedDate: string;
  isToday: boolean;
  onAddEvent: () => void;
  onEditEvent: (event: ScheduleEvent) => void;
  onEventDragStart?: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  work: '仕事',
  personal: '個人',
  health: '健康',
  social: '交流',
  other: 'その他',
};

export default function TodayEventPanel({
  selectedDate,
  isToday,
  onAddEvent,
  onEditEvent,
  onEventDragStart,
}: TodayEventPanelProps) {
  const { getEventsByDate } = useSchedule();
  const events = getEventsByDate(selectedDate);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[d.getDay()];
    return { month, day, weekday };
  };

  const { month, day, weekday } = formatDate(selectedDate);

  return (
    <motion.div
      key={selectedDate}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-col h-full max-h-full"
    >
      {/* Panel Header */}
      <div className={`
        flex items-center justify-between px-5 py-4 rounded-2xl mb-3
        ${isToday
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
          : 'bg-background neu-raised-sm'
        }
      `}>
        <div className="flex items-center gap-3">
          <div className={`
            flex flex-col items-center justify-center w-12 h-12 rounded-xl
            ${isToday ? 'bg-white/20' : 'bg-primary/10'}
          `}>
            <span className={`text-xs font-medium leading-none ${isToday ? 'text-white/80' : 'text-primary'}`}>
              {month}月
            </span>
            <span className={`text-xl font-bold leading-tight ${isToday ? 'text-white' : 'text-primary'}`}>
              {day}
            </span>
          </div>
          <div>
            <div className={`text-sm font-semibold ${isToday ? 'text-white' : 'text-foreground'}`}>
              {weekday}曜日
              {isToday && <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">今日</span>}
            </div>
            <div className={`text-xs mt-0.5 ${isToday ? 'text-white/70' : 'text-muted-foreground'}`}>
              {events.length === 0 ? '予定なし' : `${events.length}件の予定`}
            </div>
          </div>
        </div>

        {/* Add button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onAddEvent}
          className={`
            w-9 h-9 rounded-full flex items-center justify-center
            transition-colors duration-150
            ${isToday
              ? 'bg-white/20 hover:bg-white/30 text-white'
              : 'bg-primary text-white shadow-md'
            }
          `}
          style={!isToday ? {
            boxShadow: '0 3px 10px oklch(0.55 0.22 255 / 0.4)',
          } : undefined}
        >
          <Plus size={18} />
        </motion.button>
      </div>

      {/* Events List */}
      <div className="flex-1 space-y-2 pr-1 pb-2 min-h-0">
        <AnimatePresence mode="popLayout">
          {events.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-3 neu-raised-sm">
                <CalendarDays size={28} className="text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground">予定はありません</p>
              <p className="text-xs text-muted-foreground/60 mt-1">「＋」ボタンで予定を追加</p>
            </motion.div>
          ) : (
            events.map((event, index) => (
              <div
                key={event.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer!.effectAllowed = 'copy';
                  e.dataTransfer!.setData('application/json', JSON.stringify(event));
                  if (onEventDragStart) {
                    onEventDragStart();
                  }
                }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, scale: 0.95 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  onClick={() => onEditEvent(event)}
                  className="
                    flex items-stretch gap-0 rounded-xl overflow-hidden
                    bg-background neu-raised-sm
                    hover:scale-[1.01] active:scale-[0.99]
                    transition-transform duration-150
                    cursor-grab active:cursor-grabbing
                    select-none
                  "
              >
                {/* Category accent bar */}
                <div
                  className="w-1 flex-shrink-0 rounded-l-xl"
                  style={{ backgroundColor: CATEGORY_COLORS[event.category] }}
                />

                {/* Event content */}
                <div className="flex-1 px-3 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{event.title}</p>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{event.description}</p>
                      )}
                    </div>
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[event.category]}20`,
                        color: CATEGORY_COLORS[event.category],
                      }}
                    >
                      {CATEGORY_LABELS[event.category]}
                    </span>
                  </div>

                  {/* Time */}
                  {!event.allDay ? (
                    <div className="flex items-center gap-1 mt-1.5">
                      <Clock size={11} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {event.startTime} 〜 {event.endTime}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1.5">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">終日</span>
                    </div>
                  )}
                </div>
                </motion.div>
              </div>
            ))
          )}
        </AnimatePresence>
        {/* URLバーで隠れるのを防ぐための下部余白（予定1個分） */}
        <div className="h-20 flex-shrink-0" />
      </div>
    </motion.div>
  );
}
