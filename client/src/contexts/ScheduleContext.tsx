/**
 * ScheduleContext
 * Design: ネオモーフィズム × iOS風ミニマリズム
 * - スケジュールデータの状態管理
 * - LocalStorageへの永続化
 * - CRUD操作の提供
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { nanoid } from 'nanoid';

export type EventCategory = 'work' | 'personal' | 'health' | 'social' | 'other';

export interface ScheduleEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  category: EventCategory;
  description?: string;
  allDay?: boolean;
}

interface ScheduleContextValue {
  events: ScheduleEvent[];
  addEvent: (event: Omit<ScheduleEvent, 'id'>) => void;
  updateEvent: (id: string, event: Partial<ScheduleEvent>) => void;
  deleteEvent: (id: string) => void;
  copyEvent: (id: string, newDate: string) => void;
  getEventsByDate: (date: string) => ScheduleEvent[];
  getEventCountByDate: (date: string) => number;
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

const STORAGE_KEY = 'schedule-app-events';

const CATEGORY_COLORS: Record<EventCategory, string> = {
  work: '#007AFF',
  personal: '#34C759',
  health: '#FF9500',
  social: '#AF52DE',
  other: '#8E8E93',
};

export { CATEGORY_COLORS };

// サンプルデータ（今日の日付を基準に生成）
function generateSampleEvents(): ScheduleEvent[] {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const addDays = (d: Date, n: number) => {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  };

  return [
    {
      id: nanoid(),
      title: 'チームミーティング',
      date: fmt(today),
      startTime: '09:00',
      endTime: '10:00',
      category: 'work',
      description: '週次の進捗確認ミーティング',
    },
    {
      id: nanoid(),
      title: 'ランチ',
      date: fmt(today),
      startTime: '12:00',
      endTime: '13:00',
      category: 'personal',
      description: '田中さんとランチ',
    },
    {
      id: nanoid(),
      title: 'プロジェクトレビュー',
      date: fmt(today),
      startTime: '15:00',
      endTime: '16:30',
      category: 'work',
      description: 'Q2プロジェクトの中間レビュー',
    },
    {
      id: nanoid(),
      title: 'ジム',
      date: fmt(addDays(today, 1)),
      startTime: '07:00',
      endTime: '08:30',
      category: 'health',
    },
    {
      id: nanoid(),
      title: 'クライアント打ち合わせ',
      date: fmt(addDays(today, 1)),
      startTime: '14:00',
      endTime: '15:00',
      category: 'work',
    },
    {
      id: nanoid(),
      title: '歯医者',
      date: fmt(addDays(today, 2)),
      startTime: '11:00',
      endTime: '12:00',
      category: 'health',
    },
    {
      id: nanoid(),
      title: '友人の誕生日パーティー',
      date: fmt(addDays(today, 3)),
      startTime: '18:00',
      endTime: '21:00',
      category: 'social',
    },
    {
      id: nanoid(),
      title: '読書会',
      date: fmt(addDays(today, 3)),
      startTime: '14:00',
      endTime: '16:00',
      category: 'personal',
    },
    {
      id: nanoid(),
      title: 'オンライン勉強会',
      date: fmt(addDays(today, 5)),
      startTime: '19:00',
      endTime: '21:00',
      category: 'work',
    },
    {
      id: nanoid(),
      title: '週次レポート提出',
      date: fmt(addDays(today, -1)),
      startTime: '17:00',
      endTime: '18:00',
      category: 'work',
    },
    {
      id: nanoid(),
      title: 'ヨガクラス',
      date: fmt(addDays(today, -2)),
      startTime: '07:30',
      endTime: '08:30',
      category: 'health',
    },
    {
      id: nanoid(),
      title: '映画鑑賞',
      date: fmt(addDays(today, 7)),
      startTime: '19:00',
      endTime: '21:30',
      category: 'social',
    },
    {
      id: nanoid(),
      title: '月次報告書作成',
      date: fmt(addDays(today, 7)),
      startTime: '10:00',
      endTime: '12:00',
      category: 'work',
    },
    {
      id: nanoid(),
      title: '家族との夕食',
      date: fmt(addDays(today, 7)),
      startTime: '18:30',
      endTime: '20:00',
      category: 'personal',
    },
  ];
}

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<ScheduleEvent[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as ScheduleEvent[];
      }
    } catch {
      // ignore
    }
    return generateSampleEvents();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const addEvent = useCallback((event: Omit<ScheduleEvent, 'id'>) => {
    setEvents(prev => [...prev, { ...event, id: nanoid() }]);
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<ScheduleEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  const copyEvent = useCallback((id: string, newDate: string) => {
    const eventToCopy = events.find(e => e.id === id);
    if (eventToCopy) {
      const newEvent: ScheduleEvent = {
        ...eventToCopy,
        id: nanoid(),
        date: newDate,
      };
      setEvents(prev => [...prev, newEvent]);
    }
  }, [events]);

  const getEventsByDate = useCallback((date: string) => {
    return events
      .filter(e => e.date === date)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [events]);

  const getEventCountByDate = useCallback((date: string) => {
    return events.filter(e => e.date === date).length;
  }, [events]);

  return (
    <ScheduleContext.Provider value={{
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      copyEvent,
      getEventsByDate,
      getEventCountByDate,
    }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider');
  return ctx;
}
