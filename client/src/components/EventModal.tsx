/**
 * EventModal
 * Design: ネオモーフィズム × iOS風ミニマリズム
 * - ボトムシート風のモーダル
 * - 予定の追加・編集・削除
 * - カテゴリ選択でカラーコーディング
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Clock, Tag, AlignLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type EventCategory, type ScheduleEvent, CATEGORY_COLORS, useSchedule } from '@/contexts/ScheduleContext';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  editingEvent?: ScheduleEvent | null;
}

const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: 'work', label: '仕事' },
  { value: 'personal', label: '個人' },
  { value: 'health', label: '健康' },
  { value: 'social', label: '交流' },
  { value: 'other', label: 'その他' },
];

export default function EventModal({ isOpen, onClose, selectedDate, editingEvent }: EventModalProps) {
  const { addEvent, updateEvent, deleteEvent } = useSchedule();

  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState<EventCategory>('work');
  const [description, setDescription] = useState('');
  const [allDay, setAllDay] = useState(false);

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setStartTime(editingEvent.startTime);
      setEndTime(editingEvent.endTime);
      setCategory(editingEvent.category);
      setDescription(editingEvent.description || '');
      setAllDay(editingEvent.allDay || false);
    } else {
      setTitle('');
      setStartTime('09:00');
      setEndTime('10:00');
      setCategory('work');
      setDescription('');
      setAllDay(false);
    }
  }, [editingEvent, isOpen]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    const eventData = {
      title: title.trim(),
      date: selectedDate,
      startTime,
      endTime,
      category,
      description: description.trim(),
      allDay,
    };
    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
    } else {
      addEvent(eventData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (editingEvent) {
      deleteEvent(editingEvent.id);
      onClose();
    }
  };

  // 日付フォーマット
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto"
          >
            <div className="bg-background rounded-t-3xl shadow-2xl overflow-hidden"
              style={{
                boxShadow: '0 -8px 40px oklch(0.2 0.01 240 / 0.2)',
              }}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {editingEvent ? '予定を編集' : '予定を追加'}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(selectedDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {editingEvent && (
                    <button
                      onClick={handleDelete}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="px-5 pb-8 space-y-4">
                {/* Title */}
                <div>
                  <Input
                    placeholder="予定のタイトル"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="text-base font-medium border-0 bg-muted/50 rounded-xl h-12 px-4 focus-visible:ring-primary/30"
                    autoFocus
                  />
                </div>

                {/* All day toggle */}
                <div className="flex items-center gap-3 px-1">
                  <Clock size={16} className="text-muted-foreground flex-shrink-0" />
                  <div className="flex items-center gap-2 flex-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => setAllDay(!allDay)}
                        className={`w-10 h-6 rounded-full transition-colors duration-200 relative ${allDay ? 'bg-primary' : 'bg-muted'}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${allDay ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </div>
                      <span className="text-sm text-foreground">終日</span>
                    </label>
                  </div>
                </div>

                {/* Time range */}
                {!allDay && (
                  <div className="flex items-center gap-3 px-1">
                    <div className="w-4 flex-shrink-0" />
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        className="flex-1 border-0 bg-muted/50 rounded-xl h-10 text-sm text-center"
                      />
                      <span className="text-muted-foreground text-sm">〜</span>
                      <Input
                        type="time"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        className="flex-1 border-0 bg-muted/50 rounded-xl h-10 text-sm text-center"
                      />
                    </div>
                  </div>
                )}

                {/* Category */}
                <div className="flex items-start gap-3 px-1">
                  <Tag size={16} className="text-muted-foreground flex-shrink-0 mt-2" />
                  <div className="flex flex-wrap gap-2 flex-1">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => setCategory(cat.value)}
                        className={`
                          px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150
                          ${category === cat.value
                            ? 'text-white shadow-md scale-105'
                            : 'bg-muted text-muted-foreground hover:bg-accent'
                          }
                        `}
                        style={category === cat.value ? {
                          backgroundColor: CATEGORY_COLORS[cat.value],
                          boxShadow: `0 3px 10px ${CATEGORY_COLORS[cat.value]}55`,
                        } : undefined}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="flex items-start gap-3 px-1">
                  <AlignLeft size={16} className="text-muted-foreground flex-shrink-0 mt-3" />
                  <textarea
                    placeholder="メモ（任意）"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={2}
                    className="flex-1 bg-muted/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none border-0 outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Submit */}
                <Button
                  onClick={handleSubmit}
                  disabled={!title.trim()}
                  className="w-full h-12 rounded-xl text-base font-semibold"
                  style={{
                    background: title.trim()
                      ? `linear-gradient(135deg, ${CATEGORY_COLORS[category]}dd, ${CATEGORY_COLORS[category]})`
                      : undefined,
                  }}
                >
                  {editingEvent ? '保存する' : '追加する'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
