<template>
  <div class="calendar-view" @touchstart="$emit('touchstart', $event)" @touchmove="$emit('touchmove', $event)" @touchend="$emit('touchend', $event)">
    <div class="view-header">
      <button @click="$emit('goHome')" class="back-button">
        <ChevronLeft class="icon-large" />
      </button>
      <h2 class="view-title">Browse Entries</h2>
      <div class="header-spacer"></div>
    </div>

    <!-- Month Navigation -->
    <div class="month-nav">
      <button @click="$emit('previousMonth')" class="back-button">
        <ChevronLeft class="icon-size" />
      </button>
      <h3 class="month-title">{{ currentMonthYear }}</h3>
      <button @click="$emit('nextMonth')" class="back-button">
        <ChevronRight class="icon-size" />
      </button>
    </div>

    <!-- Calendar Grid -->
    <div class="card">
      <div class="calendar-header">
        <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="day-header">
          {{ day }}
        </div>
      </div>

      <div class="calendar-grid">
        <!-- Allow clicking any date and mark selected date -->
        <div
            v-for="date in calendarDates"
            :key="date.key"
            class="calendar-date"
            :class="{
            'other-month': !date.isCurrentMonth,
            'has-entry': date.hasEntry,
            'is-today': date.isToday,
            'is-selected': isDateSelected(date.date)
          }"
            @click="handleDateClick(date)"
        >
          <span class="date-number">{{ date.day }}</span>
          <div v-if="date.hasEntry" class="entry-dot"></div>
        </div>
      </div>
    </div>

    <!-- Selected Date Entries -->
    <Transition name="slide-up">
      <div v-if="selectedDate" class="selected-entries">
        <h3 class="section-title">{{ formatSelectedDate }}</h3>
        <!-- Show no entries message when selectedDateEntries is empty -->
        <div v-if="selectedDateEntries.length === 0" class="no-entries-message">
          <p>No entries for this date</p>
        </div>
        <div v-else class="entries-list">
          <TransitionGroup name="stagger" appear>
            <div v-for="(entry, index) in selectedDateEntries" :key="entry.id" :style="{ '--delay': index * 0.1 + 's' }" @click="$emit('viewEntry', entry)" class="card entry-card stagger-item" :class="`stagger-delay-${Math.min(index, 9)}`">
              <h4 v-if="entry.title" class="entry-title">{{ entry.title }}</h4>
              <p class="entry-preview">{{ entry.content }}</p>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface JournalEntry {
  id: string
  date: string
  title?: string
  content: string
  musicUrl?: string
  createdAt: number
}

interface CalendarDate {
  key: string
  date: Date
  day: number
  isCurrentMonth: boolean
  hasEntry: boolean
  isToday: boolean
}

const props = defineProps<{
  currentMonthYear: string
  calendarDates: CalendarDate[]
  selectedDateEntries: JournalEntry[]
  formatSelectedDate: string
  selectedDate?: Date | null
}>()

const emit = defineEmits<{
  goHome: []
  previousMonth: []
  nextMonth: []
  selectDate: [date: Date]
  viewEntry: [entry: JournalEntry]
  touchstart: [event: TouchEvent]
  touchmove: [event: TouchEvent]
  touchend: [event: TouchEvent]
}>()

const isDateSelected = (date: Date) => {
  if (!props.selectedDate) return false
  return date.toDateString() === props.selectedDate.toDateString()
}

const handleDateClick = (dateObj: CalendarDate) => {
  if (!dateObj.isCurrentMonth) return
  emit('selectDate', dateObj.date)
}
</script>
