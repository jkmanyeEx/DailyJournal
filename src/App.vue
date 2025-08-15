<template>
  <!-- Main App -->
  <div class="app-container" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
    <!-- Header -->
    <header class="app-header">
      <div class="header-wrapper">
        <div class="header-content">
          <!-- Fixed left container to always have consistent width -->
          <div class="header-left">
            <button v-if="currentView === 'home'" @click="showCalendar" class="back-button">
              <Calendar class="icon-size" />
            </button>
          </div>

          <h1 class="app-title">
            Daily Journal
          </h1>

          <!-- Fixed right container to balance the header properly -->
          <div class="header-right">
            <!-- Added install button for PWA -->
            <button v-if="showInstallButton && currentView === 'home'" @click="installPWA" class="install-button" title="Install App">
              <Download class="icon-size" />
            </button>
            <button v-if="currentView === 'home'" @click="showBackupMenu" class="back-button" title="Backup & Settings">
              <Archive class="icon-size" />
            </button>
            <Transition name="slide-up-reverse">
              <div v-if="!isOnline" class="offline-indicator">
                <div class="offline-dot"></div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <Transition name="slide-fade" mode="out-in">
        <!-- Installation Guide View -->
        <div v-if="currentView === 'install'" key="install" class="install-view">
          <div class="view-header">
            <button @click="goHome" class="back-button">
              <ChevronLeft class="icon-large" />
            </button>
            <h2 class="view-title">Install App</h2>
            <div class="header-spacer"></div>
          </div>

          <div class="install-content">
            <div class="card">
              <h3 class="card-section-title">Get the Best Experience</h3>
              <p class="install-description">
                Install Daily Journal as an app for offline access, faster loading, and a native mobile experience.
              </p>
            </div>

            <!-- iOS Instructions -->
            <div v-if="userOS === 'ios'" class="card">
              <h3 class="card-section-title">📱 Install on iOS</h3>
              <div class="install-steps">
                <div class="install-step">
                  <span class="step-number">1</span>
                  <p>Tap the <strong>Share</strong> button at the bottom of Safari</p>
                </div>
                <div class="install-step">
                  <span class="step-number">2</span>
                  <p>Scroll down and tap <strong>"Add to Home Screen"</strong></p>
                </div>
                <div class="install-step">
                  <span class="step-number">3</span>
                  <p>Tap <strong>"Add"</strong> to install the app</p>
                </div>
                <div class="install-step">
                  <span class="step-number">4</span>
                  <p>Find the Daily Journal app on your home screen</p>
                </div>
              </div>
            </div>

            <!-- Android Instructions -->
            <div v-if="userOS === 'android'" class="card">
              <h3 class="card-section-title">🤖 Install on Android</h3>
              <div class="install-steps">
                <div class="install-step">
                  <span class="step-number">1</span>
                  <p>Tap the <strong>menu</strong> (⋮) in Chrome</p>
                </div>
                <div class="install-step">
                  <span class="step-number">2</span>
                  <p>Select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></p>
                </div>
                <div class="install-step">
                  <span class="step-number">3</span>
                  <p>Tap <strong>"Install"</strong> to confirm</p>
                </div>
                <div class="install-step">
                  <span class="step-number">4</span>
                  <p>Launch from your app drawer or home screen</p>
                </div>
              </div>
            </div>

            <!-- Desktop Instructions -->
            <div v-if="userOS === 'desktop'" class="card">
              <h3 class="card-section-title">💻 Install on Desktop</h3>
              <div class="install-steps">
                <div class="install-step">
                  <span class="step-number">1</span>
                  <p>Look for the <strong>install icon</strong> (⊕) in your browser's address bar</p>
                </div>
                <div class="install-step">
                  <span class="step-number">2</span>
                  <p>Click <strong>"Install"</strong> when prompted</p>
                </div>
                <div class="install-step">
                  <span class="step-number">3</span>
                  <p>The app will open in its own window</p>
                </div>
                <div class="install-step">
                  <span class="step-number">4</span>
                  <p>Pin to taskbar for quick access</p>
                </div>
              </div>
            </div>

            <div class="card">
              <h3 class="card-section-title">✨ App Benefits</h3>
              <div class="benefits-list">
                <div class="benefit-item">📱 Native mobile experience</div>
                <div class="benefit-item">⚡ Faster loading times</div>
                <div class="benefit-item">🔒 Works completely offline</div>
                <div class="benefit-item">🔔 Push notifications for backups</div>
                <div class="benefit-item">💾 Secure local data storage</div>
              </div>
            </div>

            <div class="install-actions">
              <button @click="goHome" class="btn-primary full-width">
                Continue in Browser
              </button>
            </div>
          </div>
        </div>

        <!-- Welcome Section -->
        <div v-else-if="currentView === 'home'" key="home" class="home-view">
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
              <button @click="dismissBackupReminder" class="backup-close-btn">×</button>
            </div>
            <div class="backup-reminder-actions">
              <button @click="exportData" class="backup-export-btn">Export Now</button>
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

            <div v-if="todayEntry" class="entry-content">
              <h4 v-if="todayEntry.title" class="entry-title">{{ todayEntry.title }}</h4>
              <p class="entry-preview">{{ todayEntry.content }}</p>
              <button @click="editTodayEntry" class="btn-secondary">
                Edit Entry
              </button>
            </div>

            <div v-else class="empty-entry">
              <p class="empty-message">What are you grateful for today?</p>
              <button @click="startWriting" class="btn-primary full-width">
                Write Your Thoughts
              </button>
            </div>
          </div>

          <!-- Recent Entries -->
          <div v-if="recentEntries.length > 0" class="recent-section">
            <h3 class="section-title">Recent Entries</h3>
            <div class="entries-list">
              <TransitionGroup name="stagger" appear>
                <div v-for="(entry, index) in recentEntries" :key="entry.id" :style="{ '--delay': index * 0.1 + 's' }" @click="viewEntry(entry)" class="card entry-card stagger-item" :class="`stagger-delay-${Math.min(index, 9)}`">
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

        <!-- Backup Menu -->
        <div v-else-if="currentView === 'backup'" key="backup" class="backup-view"
             @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
          <div class="view-header">
            <button @click="goHome" class="back-button">
              <ChevronLeft class="icon-large" />
            </button>
            <h2 class="view-title">Backup & Settings</h2>
            <div class="header-spacer"></div>
          </div>

          <div class="backup-sections">
            <!-- Backup Status -->
            <div class="card">
              <h3 class="card-section-title">Backup Status</h3>
              <div class="status-list">
                <div class="status-item">
                  <span class="status-label">Total Entries:</span>
                  <span class="status-value">{{ entries.length }}</span>
                </div>
                <div class="status-item">
                  <span class="status-label">Last Backup:</span>
                  <span class="status-value">{{ lastBackupDate || 'Never' }}</span>
                </div>
                <div class="status-item">
                  <span class="status-label">Storage Used:</span>
                  <span class="status-value">{{ storageSize }}</span>
                </div>
              </div>
            </div>

            <!-- Export/Import -->
            <div class="card">
              <h3 class="card-section-title">Export & Import</h3>
              <div class="action-buttons">
                <button @click="exportData" class="btn-primary full-width">
                  <Download class="icon-size button-icon" />
                  Export All Entries
                </button>
                <div class="file-input-wrapper">
                  <input ref="fileInput" type="file" accept=".json" @change="importData" class="file-input" />
                  <button class="btn-secondary full-width">
                    <Upload class="icon-size button-icon" />
                    Import Entries
                  </button>
                </div>
              </div>
            </div>

            <!-- Auto-backup Settings -->
            <div class="card">
              <h3 class="card-section-title">Auto-backup Settings</h3>
              <div class="settings-list">
                <label class="setting-item">
                  <span class="setting-label">Backup Reminders</span>
                  <input v-model="backupSettings.reminders" type="checkbox" class="toggle-checkbox" />
                </label>
                <label class="setting-item">
                  <span class="setting-label">Push Notifications</span>
                  <input v-model="backupSettings.pushNotifications" type="checkbox" class="toggle-checkbox" @change="handlePushNotificationToggle" />
                </label>
                <div v-if="backupSettings.reminders" class="sub-settings">
                  <label class="setting-item sub-setting">
                    <span class="setting-label">Remind every:</span>
                    <select v-model="backupSettings.reminderDays" class="setting-select">
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                      <option value="30">30 days</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <!-- Daily Writing Reminders -->
            <div class="card">
              <h3 class="card-section-title">Daily Writing Reminders</h3>
              <div class="settings-list">
                <label class="setting-item">
                  <span class="setting-label">Daily Reminders</span>
                  <input v-model="writingReminderSettings.enabled" type="checkbox" class="toggle-checkbox" @change="saveWritingReminderSettings" />
                </label>
                <label class="setting-item">
                  <span class="setting-label">Push Notifications</span>
                  <input v-model="writingReminderSettings.pushNotifications" type="checkbox" class="toggle-checkbox" @change="handleWritingPushNotificationToggle" />
                </label>
                <div v-if="writingReminderSettings.enabled" class="sub-settings">
                  <label class="setting-item sub-setting">
                    <span class="setting-label">Reminder time:</span>
                    <input v-model="writingReminderSettings.time" type="time" class="setting-time-input" @change="saveWritingReminderSettings" />
                  </label>
                </div>
              </div>
            </div>

            <!-- Data Recovery -->
            <div class="card">
              <h3 class="card-section-title">Data Recovery</h3>
              <div class="action-buttons">
                <button @click="validateData" class="btn-secondary full-width">
                  <Shield class="icon-size button-icon" />
                  Validate Data Integrity
                </button>
                <button @click="recoverFromIndexedDB" class="btn-secondary full-width">
                  <RefreshCw class="icon-size button-icon" />
                  Recover from Backup Storage
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Calendar View -->
        <div v-else-if="currentView === 'calendar'" key="calendar" class="calendar-view"
             @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
          <div class="view-header">
            <button @click="goHome" class="back-button">
              <ChevronLeft class="icon-large" />
            </button>
            <h2 class="view-title">Browse Entries</h2>
            <div class="header-spacer"></div>
          </div>

          <!-- Month Navigation -->
          <div class="month-nav">
            <button @click="previousMonth" class="back-button">
              <ChevronLeft class="icon-size" />
            </button>
            <h3 class="month-title">{{ currentMonthYear }}</h3>
            <button @click="nextMonth" class="back-button">
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
              <div v-for="date in calendarDates" :key="date.key" class="calendar-date" :class="{'other-month': !date.isCurrentMonth, 'has-entry': date.hasEntry, 'is-today': date.isToday}" @click="date.hasEntry && selectDate(date.date)">
                <span class="date-number">{{ date.day }}</span>
                <div v-if="date.hasEntry" class="entry-dot"></div>
              </div>
            </div>
          </div>

          <!-- Selected Date Entries -->
          <Transition name="slide-up">
            <div v-if="selectedDateEntries.length > 0" class="selected-entries">
              <h3 class="section-title">{{ formatSelectedDate }}</h3>
              <div class="entries-list">
                <TransitionGroup name="stagger" appear>
                  <div v-for="(entry, index) in selectedDateEntries" :key="entry.id" :style="{ '--delay': index * 0.1 + 's' }" @click="viewEntry(entry)" class="card entry-card stagger-item" :class="`stagger-delay-${Math.min(index, 9)}`">
                    <h4 v-if="entry.title" class="entry-title">{{ entry.title }}</h4>
                    <p class="entry-preview">{{ entry.content }}</p>
                  </div>
                </TransitionGroup>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Write View -->
        <div v-else-if="currentView === 'write'" key="write" class="write-view"
             @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
          <div class="view-header">
            <button @click="goHome" class="back-button">
              <ChevronLeft class="icon-large" />
            </button>
            <h2 class="view-title">
              {{ isEditing ? 'Edit Entry' : 'New Entry' }}
            </h2>
            <div class="header-spacer"></div>
          </div>

          <div class="write-content">
            <div class="card">
              <input v-model="currentEntry.title" placeholder="Entry title (optional)" class="input-field" @input="autoSave" />
            </div>

            <div class="card">
              <textarea v-model="currentEntry.content" placeholder="What's on your mind today? Reflect on a moment that made you smile..." class="textarea-field" @input="autoSave"></textarea>
            </div>

            <div class="write-actions">
              <button @click="saveEntry" class="btn-primary flex-grow">
                <Save class="icon-size button-icon" />
                Save Entry
              </button>
              <button v-if="isEditing" @click="deleteEntry" class="btn-secondary">
                <Trash2 class="icon-size" />
              </button>
            </div>
          </div>
        </div>

        <!-- Entry View -->
        <div v-else-if="currentView === 'view'" key="view" class="view-entry"
             @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
          <div class="view-header">
            <button @click="goHome" class="back-button">
              <ChevronLeft class="icon-large" />
            </button>
            <h2 class="view-title">Entry</h2>
            <button @click="editEntry" class="edit-button">
              <Edit3 class="icon-size" />
            </button>
          </div>

          <div v-if="selectedEntry" class="entry-display">
            <div class="card">
              <div class="entry-header">
                <span class="entry-date">{{ formatDate(selectedEntry.date) }}</span>
              </div>
              <h3 v-if="selectedEntry.title" class="display-title">{{ selectedEntry.title }}</h3>
              <p class="display-content">{{ selectedEntry.content }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </main>

    <!-- Floating Action Button -->
    <button v-if="currentView !== 'backup' && currentView !== 'install'" @click="handlePlusClick" class="fab">
      <Edit3 v-if="todayEntry" class="icon-large" />
      <Plus v-else class="icon-large" />
    </button>

    <!-- Toast Notifications -->
    <Transition name="toast">
      <div v-show="toast.show" class="toast-bottom" :class="toast.type">
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Edit3,
  Trash2,
  Plus,
  Calendar,
  Archive,
  Download,
  Upload,
  Shield,
  RefreshCw
} from 'lucide-vue-next'

interface JournalEntry {
  id: string
  date: string
  title?: string
  content: string
  createdAt: number
}

interface BackupSettings {
  reminders: boolean
  reminderDays: number
  pushNotifications: boolean
  lastBackupDate?: string
  lastReminderDate?: string
}

interface WritingReminderSettings {
  enabled: boolean
  time: string // Format: "HH:MM"
  pushNotifications: boolean
}

const currentView = ref<'home' | 'write' | 'view' | 'calendar' | 'backup' | 'install'>('home')
const entries = ref<JournalEntry[]>([])
const currentEntry = ref<Partial<JournalEntry>>({})
const selectedEntry = ref<JournalEntry | null>(null)
const isEditing = ref(false)
const toast = ref<{ show: boolean, message: string, type: string }>({ show: false, message: '', type: 'toast-error' })
const calendarDate = ref(new Date())
const selectedDate = ref<Date | null>(null)
const fileInput = ref<HTMLInputElement>()

const isOnline = ref(navigator.onLine)
const showOfflineToast = ref(false)

const backupSettings = ref<BackupSettings>({
  reminders: true,
  reminderDays: 14,
  pushNotifications: false
})

const writingReminderSettings = ref<WritingReminderSettings>({
  enabled: true,
  time: "20:00", // Default to 8 PM
  pushNotifications: false
})

const showBackupReminder = ref(false)

const todayEntry = computed(() => {
  const today = new Date().toDateString()
  return entries.value.find(entry => new Date(entry.date).toDateString() === today)
})

const recentEntries = computed(() => {
  return entries.value
      .filter(entry => entry.id !== todayEntry.value?.id)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
})

const currentMonthYear = computed(() => {
  return calendarDate.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
})

const formatSelectedDate = computed(() => {
  if (!selectedDate.value) return ''
  return selectedDate.value.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
})

const selectedDateEntries = computed(() => {
  if (!selectedDate.value) return []
  const dateString = selectedDate.value.toDateString()
  return entries.value.filter(entry =>
      new Date(entry.date).toDateString() === dateString
  ).sort((a, b) => b.createdAt - a.createdAt)
})

const calendarDates = computed(() => {
  const year = calendarDate.value.getFullYear()
  const month = calendarDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const dates = []
  const today = new Date().toDateString()

  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)

    const dateString = currentDate.toDateString()
    const hasEntry = entries.value.some(entry =>
        new Date(entry.date).toDateString() === dateString
    )

    dates.push({
      key: `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`,
      date: new Date(currentDate),
      day: currentDate.getDate(),
      isCurrentMonth: currentDate.getMonth() === month,
      hasEntry,
      isToday: dateString === today
    })
  }

  return dates
})

const daysSinceLastBackup = computed(() => {
  if (!backupSettings.value.lastBackupDate) return 999
  const lastBackup = new Date(backupSettings.value.lastBackupDate)
  const now = new Date()
  return Math.floor((now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60 * 24))
})

const lastBackupDate = computed(() => {
  if (!backupSettings.value.lastBackupDate) return null
  return new Date(backupSettings.value.lastBackupDate).toLocaleDateString()
})

const storageSize = computed(() => {
  const data = JSON.stringify(entries.value)
  const bytes = new Blob([data]).size
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
})

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

const startWriting = () => {
  currentEntry.value = {
    content: '',
    title: '',
    date: new Date().toISOString(),
    id: Date.now().toString()
  }
  isEditing.value = false
  currentView.value = 'write'
}

const handlePlusClick = () => {
  if (todayEntry.value) {
    currentEntry.value = { ...todayEntry.value }
    isEditing.value = true
    currentView.value = 'write'
  } else {
    startWriting()
  }
}

const editTodayEntry = () => {
  if (todayEntry.value) {
    currentEntry.value = { ...todayEntry.value }
    isEditing.value = true
    currentView.value = 'write'
  }
}

const editEntry = () => {
  if (selectedEntry.value) {
    currentEntry.value = { ...selectedEntry.value }
    isEditing.value = true
    currentView.value = 'write'
  }
}

const viewEntry = (entry: JournalEntry) => {
  selectedEntry.value = entry
  currentView.value = 'view'
}

const saveEntry = () => {
  if (!currentEntry.value.content?.trim()) {
    showToast('Please write something first!', 'toast-error')
    return
  }

  const entry: JournalEntry = {
    id: currentEntry.value.id || Date.now().toString(),
    date: currentEntry.value.date || new Date().toISOString(),
    title: currentEntry.value.title?.trim() || undefined,
    content: currentEntry.value.content,
    createdAt: Date.now()
  }

  if (isEditing.value) {
    const index = entries.value.findIndex(e => e.id === entry.id)
    if (index !== -1) {
      entries.value[index] = entry
    }
  } else {
    entries.value.push(entry)
  }

  saveToLocalStorage()
  showToast('Entry saved!', 'toast-success')
  goHome()
}

const deleteEntry = () => {
  if (currentEntry.value.id) {
    entries.value = entries.value.filter(e => e.id !== currentEntry.value.id)
    saveToLocalStorage()
    showToast('Entry deleted', 'toast-success')
    goHome()
  }
}

const goHome = () => {
  currentView.value = 'home'
  currentEntry.value = {}
  selectedEntry.value = null
  selectedDate.value = null
  isEditing.value = false
}

const autoSave = () => {
  if (currentEntry.value.content || currentEntry.value.title) {
    localStorage.setItem('journal-draft', JSON.stringify(currentEntry.value))
  }
}

const showToast = (message: string, type: string) => {
  toast.value.message = message
  toast.value.type = type
  toast.value.show = true
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const saveToLocalStorage = () => {
  localStorage.setItem('journal-entries', JSON.stringify(entries.value))
  saveToIndexedDB()
}

const loadEntries = () => {
  const saved = localStorage.getItem('journal-entries')
  if (saved) {
    entries.value = JSON.parse(saved)
  }

  const draft = localStorage.getItem('journal-draft')
  if (draft && currentView.value === 'write') {
    const draftEntry = JSON.parse(draft)
    if (!draftEntry.id || !entries.value.find(e => e.id === draftEntry.id)) {
      currentEntry.value = draftEntry
    }
  }
}

const showBackupMenu = () => {
  currentView.value = 'backup'
}

const exportData = () => {
  const data = {
    entries: entries.value,
    exportDate: new Date().toISOString(),
    version: '1.0'
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `journal-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  backupSettings.value.lastBackupDate = new Date().toISOString()
  saveBackupSettings()
  showToast('Backup exported successfully!', 'toast-success')
}

const importData = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)

      if (!data.entries || !Array.isArray(data.entries)) {
        throw new Error('Invalid backup file format')
      }

      const validEntries = data.entries.filter((entry: any) =>
          entry.id && entry.date && entry.content && typeof entry.createdAt === 'number'
      )

      if (validEntries.length === 0) {
        throw new Error('No valid entries found in backup')
      }

      const existingIds = new Set(entries.value.map(e => e.id))
      const newEntries = validEntries.filter((entry: JournalEntry) => !existingIds.has(entry.id))

      entries.value = [...entries.value, ...newEntries].sort((a, b) => b.createdAt - a.createdAt)

      saveToLocalStorage()
      saveToIndexedDB()
      showToast(`Imported ${newEntries.length} new entries!`, 'toast-success')

    } catch (error) {
      showToast('Failed to import backup file. Please check the file format.', 'toast-error')
      console.error('Import error:', error)
    }
  }
  reader.readAsText(file)

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const validateData = () => {
  let issues = 0
  const validatedEntries = entries.value.filter(entry => {
    if (!entry.id || !entry.date || !entry.content || typeof entry.createdAt !== 'number') {
      issues++
      return false
    }
    return true
  })

  if (issues > 0) {
    entries.value = validatedEntries
    saveToLocalStorage()
    saveToIndexedDB()
    showToast(`Fixed ${issues} corrupted entries`, 'toast-success')
  } else {
    showToast('All data is valid!', 'toast-success')
  }
}

const saveToIndexedDB = async () => {
  try {
    const request = indexedDB.open('JournalBackup', 1)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('entries')) {
        db.createObjectStore('entries', { keyPath: 'id' })
      }
    }

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      const transaction = db.transaction(['entries'], 'readwrite')
      const store = transaction.objectStore('entries')

      store.clear()

      entries.value.forEach(entry => {
        store.add(entry)
      })

      transaction.oncomplete = () => {
        console.log('Data backed up to IndexedDB')
      }
    }
  } catch (error) {
    console.error('IndexedDB backup failed:', error)
  }
}

const recoverFromIndexedDB = async () => {
  try {
    const request = indexedDB.open('JournalBackup', 1)

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      const transaction = db.transaction(['entries'], 'readonly')
      const store = transaction.objectStore('entries')
      const getAllRequest = store.getAll()

      getAllRequest.onsuccess = () => {
        const backupEntries = getAllRequest.result as JournalEntry[]

        if (backupEntries.length === 0) {
          showToast('No backup data found in IndexedDB', 'toast-error')
          return
        }

        const existingIds = new Set(entries.value.map(e => e.id))
        const newEntries = backupEntries.filter(entry => !existingIds.has(entry.id))

        entries.value = [...entries.value, ...newEntries].sort((a, b) => b.createdAt - a.createdAt)

        saveToLocalStorage()
        showToast(`Recovered ${newEntries.length} entries from backup!`, 'toast-success')
      }
    }

    request.onerror = () => {
      showToast('Failed to access backup storage', 'toast-error')
    }
  } catch (error) {
    showToast('Recovery failed. Please try importing a JSON backup.', 'toast-error')
    console.error('IndexedDB recovery failed:', error)
  }
}

const checkBackupReminder = async () => {
  if (!backupSettings.value.reminders) return

  const daysSinceBackup = daysSinceLastBackup.value
  const daysSinceReminder = backupSettings.value.lastReminderDate
      ? Math.floor((Date.now() - new Date(backupSettings.value.lastReminderDate).getTime()) / (1000 * 60 * 60 * 24))
      : 999

  if (daysSinceBackup >= backupSettings.value.reminderDays && daysSinceReminder >= 3) {
    showBackupReminder.value = true

    // Send push notification if enabled
    if (backupSettings.value.pushNotifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Journal Backup Reminder', {
        body: `It's been ${daysSinceBackup} days since your last backup. Consider exporting your entries.`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'backup-reminder'
      })
    }
  }
}

const dismissBackupReminder = () => {
  showBackupReminder.value = false
  backupSettings.value.lastReminderDate = new Date().toISOString()
  saveBackupSettings()
}

const saveBackupSettings = () => {
  localStorage.setItem('journal-backup-settings', JSON.stringify(backupSettings.value))
}

const saveWritingReminderSettings = () => {
  localStorage.setItem('journal-writing-reminder-settings', JSON.stringify(writingReminderSettings.value))
  // Reschedule reminder with new settings
  scheduleWritingReminder()
}

const loadWritingReminderSettings = () => {
  const saved = localStorage.getItem('journal-writing-reminder-settings')
  if (saved) {
    writingReminderSettings.value = { ...writingReminderSettings.value, ...JSON.parse(saved) }
  }
}

const handlePushNotificationToggle = async () => {
  if (backupSettings.value.pushNotifications) {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        backupSettings.value.pushNotifications = false
        showToast('Push notifications permission denied', 'toast-error')
      } else {
        showToast('Push notifications enabled', 'toast-success')
      }
    } else {
      backupSettings.value.pushNotifications = false
      showToast('Push notifications not supported', 'toast-error')
    }
  }
  saveBackupSettings()
}

const handleWritingPushNotificationToggle = async () => {
  if (writingReminderSettings.value.pushNotifications) {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        writingReminderSettings.value.pushNotifications = false
        showToast('Push notifications permission denied', 'toast-error')
      } else {
        showToast('Writing reminder notifications enabled', 'toast-success')
      }
    } else {
      writingReminderSettings.value.pushNotifications = false
      showToast('Push notifications not supported', 'toast-error')
    }
  }
  saveWritingReminderSettings()
}

const showCalendar = () => {
  currentView.value = 'calendar'
}

const previousMonth = () => {
  const newDate = new Date(calendarDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  calendarDate.value = newDate
}

const nextMonth = () => {
  const newDate = new Date(calendarDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  calendarDate.value = newDate
}

const selectDate = (date: Date) => {
  selectedDate.value = date
  currentView.value = 'view'
}

const checkWritingReminder = () => {
  if (!writingReminderSettings.value.enabled) return

  const today = new Date().toDateString()
  const hasWrittenToday = entries.value.some(entry =>
      new Date(entry.date).toDateString() === today
  )

  if (!hasWrittenToday) {
    const now = new Date()
    const [hours, minutes] = writingReminderSettings.value.time.split(':').map(Number)
    const reminderTime = new Date()
    reminderTime.setHours(hours, minutes, 0, 0)

    // Check if current time is past reminder time
    if (now >= reminderTime) {
      // Send push notification if enabled
      if (writingReminderSettings.value.pushNotifications && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Daily Journal Reminder', {
          body: "Don't forget to write in your journal today! Capture your thoughts and experiences.",
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'writing-reminder'
        })
      }
    }
  }
}

const scheduleWritingReminder = () => {
  if (!writingReminderSettings.value.enabled) return

  const [hours, minutes] = writingReminderSettings.value.time.split(':').map(Number)
  const now = new Date()
  const reminderTime = new Date()
  reminderTime.setHours(hours, minutes, 0, 0)

  // If reminder time has passed today, schedule for tomorrow
  if (now >= reminderTime) {
    reminderTime.setDate(reminderTime.getDate() + 1)
  }

  const timeUntilReminder = reminderTime.getTime() - now.getTime()

  setTimeout(() => {
    checkWritingReminder()
    // Schedule next day's reminder
    scheduleWritingReminder()
  }, timeUntilReminder)
}

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('SW registered: ', registration)
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError)
    }
  }
}

const handleOnlineStatus = () => {
  const wasOffline = !isOnline.value
  isOnline.value = navigator.onLine

  if (!navigator.onLine && !showOfflineToast.value) {
    showOfflineToast.value = true
    setTimeout(() => {
      showOfflineToast.value = false
    }, 5000)
  } else if (navigator.onLine && wasOffline) {
    showOfflineToast.value = false
    showToast('Back online!', 'toast-success')
  }
}

const showInstallButton = ref(false)
let deferredPrompt: any = null

const installPWA = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      showToast('App installed successfully!', 'toast-success')
    }
    deferredPrompt = null
    showInstallButton.value = false
  }
}

const userOS = ref<'ios' | 'android' | 'desktop'>('desktop')

const detectUserOS = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(userAgent)) {
    userOS.value = 'ios'
  } else if (/android/.test(userAgent)) {
    userOS.value = 'android'
  } else {
    userOS.value = 'desktop'
  }
}

const showInstallGuide = () => {
  currentView.value = 'install'
}

const loadBackupSettings = () => {
  const saved = localStorage.getItem('journal-backup-settings')
  if (saved) {
    backupSettings.value = { ...backupSettings.value, ...JSON.parse(saved) }
  }
}

const touchStartX = ref(0)
const touchStartY = ref(0)
const isSwipeGesture = ref(false)
const touchEndX = ref(0)

const handleTouchStart = (e: TouchEvent) => {
  if (currentView.value === 'backup' || currentView.value === 'calendar' ||
      currentView.value === 'write' || currentView.value === 'view') {
    touchStartX.value = e.touches[0].clientX
    touchStartY.value = e.touches[0].clientY
  }
}

const handleTouchMove = (e: TouchEvent) => {
  if (currentView.value === 'backup' || currentView.value === 'calendar' ||
      currentView.value === 'write' || currentView.value === 'view') {
    touchEndX.value = e.touches[0].clientX
  }
}

const handleTouchEnd = () => {
  if (currentView.value === 'backup' || currentView.value === 'calendar' ||
      currentView.value === 'write' || currentView.value === 'view') {
    const deltaX = touchEndX.value - touchStartX.value
    const deltaY = Math.abs(touchStartY.value - touchEndX.value)

    // Swipe from left edge to right (return to home)
    if (touchStartX.value < 50 && deltaX > 100 && deltaY < 100) {
      // Use existing slide-fade animation with right direction
      isSwipeGesture.value = true
      setTimeout(() => {
        goHome()
        isSwipeGesture.value = false
      }, 150)
    }
  }
}

onMounted(() => {
  loadEntries()
  loadBackupSettings()
  loadWritingReminderSettings()
  scheduleWritingReminder()
  checkBackupReminder()
  registerServiceWorker()

  detectUserOS()

  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    showInstallButton.value = true
  })
})
</script>

<style scoped>
/* Removed all duplicate styles that exist in style.css */
</style>
