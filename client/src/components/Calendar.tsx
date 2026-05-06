/**
 * Calendar
 * Design: ネオモーフィズム × iOS風ミニマリズム
 * - 月表示カレンダー
 * - 各日付セルはアプリアイコン風（CalendarDayCell）
 * - 当日のみ詳細パネル（TodayEventPanel）を表示
 * - 月移動はスワイプ風アニメーション
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CalendarDayCell from './CalendarDayCell';
import DraggableEventSheet from './DraggableEventSheet';
import EventModal from './EventModal';
import { type ScheduleEvent, useSchedule } from '@/contexts/ScheduleContext';
import { toast } from 'sonner';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay(); // 0=Sun
  const days: Date[] = [];

  // 前月の日付を埋める
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push(d);
  }

  // 当月の日付
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  // 次月の日付を埋める（6行になるように）
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push(new Date(year, month + 1, d));
  }

  return days;
}

export default function Calendar() {
  const { copyEvent } = useSchedule();
  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split('T')[0];

  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [direction, setDirection] = useState(0); // -1: prev, 1: next
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);

  const days = getCalendarDays(viewYear, viewMonth);

  const goToPrevMonth = () => {
    setDirection(-1);
    if (viewMonth === 0) {
      setViewYear(y => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    setDirection(1);
    if (viewMonth === 11) {
      setViewYear(y => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const goToToday = () => {
    setDirection(0);
    setViewYear(todayDate.getFullYear());
    setViewMonth(todayDate.getMonth());
    setSelectedDate(todayStr);
  };

  const handleDayClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    // 別の月の日付をクリックした場合、その月に移動
    if (date.getMonth() !== viewMonth) {
      setDirection(date.getMonth() > viewMonth || (viewMonth === 11 && date.getMonth() === 0) ? 1 : -1);
      setViewYear(date.getFullYear());
      setViewMonth(date.getMonth());
    }
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setModalOpen(true);
  };

  const handleEditEvent = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setModalOpen(true);
  };

  const handleDayDrop = (date: Date, e: React.DragEvent<HTMLButtonElement>) => {
    const data = e.dataTransfer.getData('application/json');
    if (data) {
      try {
        const event = JSON.parse(data) as ScheduleEvent;
        const targetDate = date.toISOString().split('T')[0];
        if (event.date === targetDate) {
          toast.error('同じ日付にはコピーできません');
          return;
        }
        copyEvent(event.id, targetDate);
        toast.success(`${event.title}を${date.getDate()}日にコピーしました`);
      } catch (err) {
        console.error('Failed to parse dropped event:', err);
      }
    }
  };

  const isToday = selectedDate === todayStr;

  const monthKey = `${viewYear}-${viewMonth}`;

  return (
    <div className="flex flex-col h-full">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between px-2 pb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={goToPrevMonth}
          className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground neu-raised-sm bg-background transition-colors"
        >
          <ChevronLeft size={18} />
        </motion.button>

        <div className="flex items-center gap-3">
          <motion.button
            key={monthKey}
            initial={{ opacity: 0, y: direction * -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            onClick={goToToday}
            className="text-center"
          >
            <span className="text-xl font-bold text-foreground">
              {viewYear}年{viewMonth + 1}月
            </span>
          </motion.button>

          {/* Today button */}
          {(viewYear !== todayDate.getFullYear() || viewMonth !== todayDate.getMonth()) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={goToToday}
              className="text-xs text-primary font-medium px-2.5 py-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              今日
            </motion.button>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={goToNextMonth}
          className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground neu-raised-sm bg-background transition-colors"
        >
          <ChevronRight size={18} />
        </motion.button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={`
              text-center text-xs font-semibold py-1
              ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-muted-foreground'}
            `}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={monthKey}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="grid grid-cols-7 gap-1 px-1 pt-2"
          >
            {days.map((date, idx) => {
              const dateStr = date.toISOString().split('T')[0];
              return (
                <CalendarDayCell
                  key={idx}
                  date={date}
                  currentMonth={viewMonth}
                  isToday={dateStr === todayStr}
                  isSelected={dateStr === selectedDate}
                  onClick={() => handleDayClick(date)}
                  onDrop={(e) => handleDayDrop(date, e)}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Draggable Event Sheet */}
      <DraggableEventSheet
        selectedDate={selectedDate}
        isToday={isToday}
        onAddEvent={handleAddEvent}
        onEditEvent={handleEditEvent}
      />

      {/* Event Modal */}
      <EventModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEvent(null); }}
        selectedDate={selectedDate}
        editingEvent={editingEvent}
      />
    </div>
  );
}
