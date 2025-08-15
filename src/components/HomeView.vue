<template>
  <div class="home-view">
    <!-- Landscape Orientation Warning -->
    <div class="landscape-warning">
      <div class="landscape-content">
        <div class="rotate-icon">📱</div>
        <h3>Please rotate your device</h3>
        <p>Daily Journal works best in portrait mode</p>
      </div>
    </div>

    <div v-if="showBackupReminder" class="backup-reminder-dialog">
      <div class="backup-reminder-content">
        <div class="backup-reminder-text">
          <h4 class="backup-reminder-title">Backup Reminder</h4>
          <p class="backup-reminder-message">
            It's been {{ daysSinceLastBackup }} days since your last backup.
            Consider exporting your entries to stay safe.
          </p>
        </div>
        <button @click="$emit('dismissBackupReminder')" class="backup-close-btn">×</button>
      </div>
      <div class="backup-reminder-actions">
        <button @click="$emit('exportData')" class="backup-export-btn">Export Now</button>
      </div>
    </div>

    <div class="welcome-section">
      <h2 class="welcome-title">Welcome to Your Daily Reflection</h2>
      <p class="welcome-date">{{ getCurrentDateString() }}</p>
    </div>

    <!-- Today's Entry Card -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Today's Entry</h3>
        <span v-if="todayEntry" class="entry-status">✓ Written</span>
      </div>

      <!-- Fixed today's entry to navigate to view instead of edit -->
      <div v-if="todayEntry" class="entry-content" @click="$emit('viewEntry', todayEntry)">
        <h4 v-if="todayEntry.title" class="entry-title">{{ todayEntry.title }}</h4>
        <p class="entry-preview">{{ todayEntry.content }}</p>
        <button @click.stop="$emit('editTodayEntry')" class="btn-secondary">
          Edit Entry
        </button>
      </div>

      <div v-else class="empty-entry">
        <p class="empty-message">What are you grateful for today?</p>
        <button @click="$emit('newEntry')" class="btn-primary full-width">
          Write Your Thoughts
        </button>
      </div>
    </div>

    <!-- Recent Entries -->
    <div v-if="recentEntries.length > 0" class="recent-section">
      <h3 class="section-title">Recent Entries</h3>
      <div class="entries-list">
        <TransitionGroup name="stagger" appear>
          <div v-for="(entry, index) in recentEntries" :key="entry.id" :style="{ '--delay': index * 0.1 + 's' }" @click="$emit('viewEntry', entry)" class="card entry-card stagger-item" :class="`stagger-delay-${Math.min(index, 9)}`">
            <div class="entry-meta">
              <span class="entry-date">{{ formatDate(entry.date) }}</span>
            </div>
            <h4 v-if="entry.title" class="entry-title">{{ entry.title }}</h4>
            <p class="entry-preview">{{ entry.content }}</p>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface JournalEntry {
  id: string
  date: string
  title?: string
  content: string
  musicUrl?: string
  createdAt: number
}

defineProps<{
  todayEntry: JournalEntry | undefined
  recentEntries: JournalEntry[]
  showBackupReminder: boolean
  daysSinceLastBackup: number
}>()

defineEmits<{
  newEntry: []
  editTodayEntry: []
  viewEntry: [entry: JournalEntry]
  dismissBackupReminder: []
  exportData: []
}>()

const getCurrentDateString = () => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>
