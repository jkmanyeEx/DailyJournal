<template>
  <div class="app-container" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
    <!-- Loading Screen -->
    <div v-if="isLoading" class="loading-screen">
      <div class="loading-content">
        <div class="coffee-icon">☕</div>
        <h2 class="loading-title">Daily Journal</h2>
        <p class="loading-subtitle">Loading your thoughts...</p>
        <div class="loading-spinner"></div>
      </div>
    </div>

    <!-- Password Check Screen (shows after loading if password is set) -->
    <div v-else-if="needsPasswordOnStartup" class="startup-password-screen">
      <div class="startup-password-content">
        <div class="coffee-icon">☕</div>
        <h2 class="startup-password-title">Enter Password</h2>
        <input
            v-model="startupPasswordInput"
            type="password"
            placeholder="Enter your password"
            class="startup-password-input"
            @keyup.enter="verifyStartupPassword"
        />
        <button @click="verifyStartupPassword" class="startup-password-button">
          Unlock Journal
        </button>
      </div>
    </div>

    <!-- Main App (shows after loading and password check) -->
    <div v-else>
      <!-- Header -->
      <header class="app-header">
        <div class="header-wrapper">
          <div class="header-content">
            <div class="header-left">
              <button v-if="currentView === 'home'" @click="showCalendar" class="back-button">
                <Calendar class="icon-size" />
              </button>
            </div>

            <!-- Made Daily Journal text clickable to go home -->
            <h1 class="app-title" @click="goHome">Daily Journal</h1>

            <div class="header-right">
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
          <HomeView
              v-if="currentView === 'home'"
              key="home"
              :entries="entries"
              :todayEntry="todayEntry"
              :recentEntries="recentEntries"
              @new-entry="newEntry"
              @view-entry="viewEntry"
          />

          <WriteView
              v-else-if="currentView === 'write'"
              key="write"
              :currentEntry="currentEntry"
              :isEditing="isEditing"
              @save="saveEntry"
              @delete="deleteEntry"
              @go-home="goHome"
          />

          <EntryView
              v-else-if="currentView === 'view'"
              key="view"
              :selectedEntry="selectedEntry"
              :currentMusicUrl="currentMusicUrl"
              :isPlaying="isPlaying"
              :albumCover="currentAlbumCover"
              @edit="editEntry"
              @delete="deleteEntry"
              @go-home="goHome"
              @play-music="playMusic"
              @pause-music="pauseMusic"
              @stop-music="stopMusic"
              @toggle-music="toggleMusic"
          />

          <CalendarView
              v-else-if="currentView === 'calendar'"
              key="calendar"
              :calendarDates="calendarDates"
              :selectedDateEntries="selectedDateEntries"
              :currentMonthYear="currentMonthYear"
              :formatSelectedDate="formatSelectedDate"
              :selectedDate="selectedDate"
              @previous-month="previousMonth"
              @next-month="nextMonth"
              @select-date="selectDate"
              @view-entry="viewEntry"
              @go-home="goHome"
          />

          <BackupView
              v-else-if="currentView === 'backup'"
              key="backup"
              :entries="entries"
              :backupSettings="backupSettings"
              :writingReminderSettings="writingReminderSettings"
              :userPassword="userPassword"
              :totalEntries="totalEntries"
              :lastBackupDate="lastBackupDate"
              :storageSize="storageSize"
              @export-data="exportData"
              @import-data="importData"
              @update-backup-settings="updateBackupSettings"
              @update-writing-settings="updateWritingSettings"
              @update-user-password="updatePassword"
              @go-home="goHome"
          />

          <PasswordView
              v-else-if="currentView === 'password' || currentView === 'password-entry'"
              key="password"
              :passwordInput="passwordInput"
              :currentView="currentView"
              @verify-password="verifyPassword"
              @go-home="goHome"
              @update:passwordInput="passwordInput = $event"
              @save-password="savePassword"
          />
        </Transition>
      </main>

      <!-- Floating Action Button -->
      <Transition name="slide-up">
        <button
            v-if="currentView === 'home'"
            @click="handleFloatingAction"
            class="fab"
        >
          <Edit3 v-if="todayEntry" class="icon-size" />
          <Plus v-else class="icon-size" />
        </button>
      </Transition>

      <!-- Toast Notifications -->
      <Transition name="slide-up">
        <div v-if="toast.show" :class="['toast-bottom', toast.type]">
          {{ toast.message }}
        </div>
      </Transition>

      <!-- Backup Reminder -->
      <Transition name="slide-up">
        <div v-if="showBackupReminder" class="backup-reminder">
          <div class="backup-reminder-content">
            <h3 class="backup-reminder-title">Time to backup your thoughts</h3>
            <p class="backup-reminder-message">It's been {{ backupSettings.reminderDays }} days since your last backup.</p>
            <div class="backup-reminder-actions">
              <button @click="exportData" class="backup-reminder-button primary">Export Now</button>
              <button @click="dismissBackupReminder" class="backup-reminder-button secondary">
                <X class="icon-small" />
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Calendar, Archive, Download, Edit3, Plus, X, Play, Pause, Square } from 'lucide-vue-next'

// Import components
import HomeView from './components/HomeView.vue'
import WriteView from './components/WriteView.vue'
import EntryView from './components/EntryView.vue'
import CalendarView from './components/CalendarView.vue'
import BackupView from './components/BackupView.vue'
import PasswordView from './components/PasswordView.vue'

interface JournalEntry {
  id: string
  date: string
  title?: string
  content: string
  musicUrl?: string
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
  time: string
  pushNotifications: boolean
}

interface CalendarDate {
  key: string
  date: Date
  day: number
  isCurrentMonth: boolean
  hasEntry: boolean
  isToday: boolean
}

// State
const currentView = ref<'home' | 'write' | 'view' | 'calendar' | 'backup' | 'password' | 'password-entry'>('home')
const entries = ref<JournalEntry[]>([])
const currentEntry = ref<Partial<JournalEntry>>({})
const selectedEntry = ref<JournalEntry | null>(null)
const isEditing = ref(false)
const toast = ref<{ show: boolean, message: string, type: string }>({ show: false, message: '', type: 'toast-error' })
const calendarDate = ref(new Date())
const selectedDate = ref<Date | null>(null)
const isOnline = ref(navigator.onLine)
const backupSettings = ref<BackupSettings>({
  reminders: true,
  reminderDays: 14,
  pushNotifications: false
})
const writingReminderSettings = ref<WritingReminderSettings>({
  enabled: false,
  time: "20:00",
  pushNotifications: false
})
const showBackupReminder = ref(false)
const passwordInput = ref('')
const userPassword = ref(localStorage.getItem('userPassword') || '')
const showInstallButton = ref(false)
const currentMusicUrl = ref('')
const isPlaying = ref(false)
const pendingAction = ref<{ type: 'new-entry' | 'view-entry' | 'edit-entry', entry?: JournalEntry } | null>(null)
const currentAudio = ref<HTMLAudioElement | null>(null)
const isLoading = ref(true)
const needsPasswordOnStartup = ref(false)
const startupPasswordInput = ref('')
const currentAlbumCover = ref('')
const currentMusicTitle = ref('')
const currentMusicArtist = ref('')
const handleAudioLoadStart = () => {
  console.log('[v0] Audio loading started')
  // Don't change isPlaying state during loading
}
const handleAudioCanPlay = () => {
  console.log('[v0] Audio can play')
  // Ensure playing state is correct when audio is ready
  if (currentAudio.value && !currentAudio.value.paused) {
    isPlaying.value = true
  }
}

// Computed
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
  return entries.value.filter(entry => new Date(entry.date).toDateString() === dateString)
})

const calendarDates = computed(() => {
  const year = calendarDate.value.getFullYear()
  const month = calendarDate.value.getMonth()
  const today = new Date()

  // Get first day of month and how many days to show from previous month
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const dates: CalendarDate[] = []
  const current = new Date(startDate)

  // Generate 42 days (6 weeks) for calendar grid
  for (let i = 0; i < 42; i++) {
    const dateString = current.toDateString()
    const hasEntry = entries.value.some(entry => new Date(entry.date).toDateString() === dateString)
    const isCurrentMonth = current.getMonth() === month
    const isToday = current.toDateString() === today.toDateString()

    dates.push({
      key: current.toISOString(),
      date: new Date(current),
      day: current.getDate(),
      isCurrentMonth,
      hasEntry,
      isToday
    })

    current.setDate(current.getDate() + 1)
  }

  return dates
})

const totalEntries = computed(() => entries.value.length)

const lastBackupDate = computed(() => {
  const installDate = localStorage.getItem('installDate')
  const backupDate = backupSettings.value.lastBackupDate

  if (backupDate) {
    return new Date(backupDate).toLocaleDateString()
  } else if (installDate) {
    return new Date(installDate).toLocaleDateString()
  }
  return 'Never'
})

const storageSize = computed(() => {
  const data = JSON.stringify(entries.value)
  const bytes = new Blob([data]).size
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
})

// Methods - keeping only essential navigation and core functionality
const goHome = () => {
  currentView.value = 'home'
  selectedDate.value = null
}

const showCalendar = () => {
  currentView.value = 'calendar'
}

const showBackupMenu = () => {
  currentView.value = 'backup'
}

const newEntry = () => {
  currentEntry.value = {
    date: new Date().toISOString(),
    content: '',
    title: '',
    musicUrl: ''
  }
  isEditing.value = false
  currentView.value = 'write'
}

const viewEntry = (entry: JournalEntry) => {
  selectedEntry.value = entry

  // Only change music if entry has different music URL or no music is playing
  if (entry.musicUrl && entry.musicUrl !== currentMusicUrl.value) {
    // Stop current music first if it's different
    if (currentMusicUrl.value && currentMusicUrl.value !== entry.musicUrl) {
      stopMusic()
    }

    // Set new music URL and load metadata
    currentMusicUrl.value = entry.musicUrl

    if (entry.musicUrl.includes('youtube.com') || entry.musicUrl.includes('youtu.be')) {
      fetchAlbumCover(entry.musicUrl)
      fetchMusicMetadata(entry.musicUrl)
    }
  } else if (!entry.musicUrl && currentMusicUrl.value) {
    // Entry has no music but music is playing - keep it playing
    console.log('[v0] Entry has no music, keeping current music playing')
  }

  currentView.value = 'view'
}

const editEntry = () => {
  if (selectedEntry.value) {
    currentEntry.value = { ...selectedEntry.value }
    isEditing.value = true
    currentView.value = 'write'
  }
}

const handleFloatingAction = () => {
  if (todayEntry.value) {
    viewEntry(todayEntry.value)
  } else {
    newEntry()
  }
}

// Essential methods that need to stay in App.vue
const saveEntry = (entry: JournalEntry) => {
  if (!entry.content?.trim()) {
    showToast('Please write something before saving.')
    return
  }

  const entryToSave: JournalEntry = {
    id: entry.id || generateId(),
    date: entry.date || new Date().toISOString(),
    title: entry.title || '',
    content: entry.content,
    musicUrl: entry.musicUrl || '',
    createdAt: entry.createdAt || Date.now()
  }

  const existingIndex = entries.value.findIndex(e => e.id === entryToSave.id)

  if (existingIndex >= 0) {
    entries.value[existingIndex] = entryToSave
    showToast('Entry updated successfully.')
  } else {
    entries.value.push(entryToSave)
    showToast('Entry saved successfully.')
  }

  // Save to localStorage
  localStorage.setItem('journal-entries', JSON.stringify(entries.value))

  // Auto-backup to IndexedDB
  saveToIndexedDB(entries.value)

  goHome()
}

const deleteEntry = (id: string) => {
  const index = entries.value.findIndex(entry => entry.id === id)
  if (index >= 0) {
    entries.value.splice(index, 1)
    localStorage.setItem('journal-entries', JSON.stringify(entries.value))
    saveToIndexedDB(entries.value)
    showToast('Entry deleted successfully.')
    goHome()
  }
}

const previousMonth = () => {
  calendarDate.value = new Date(calendarDate.value.getFullYear(), calendarDate.value.getMonth() - 1)
}

const nextMonth = () => {
  calendarDate.value = new Date(calendarDate.value.getFullYear(), calendarDate.value.getMonth() + 1)
}

const selectDate = (date: Date) => {
  selectedDate.value = date
}

const exportData = () => {
  // Implementation
}

const importData = (event: Event) => {
  // Implementation
}

const updateBackupSettings = (settings: BackupSettings) => {
  backupSettings.value = settings
}

const updateWritingSettings = (settings: WritingReminderSettings) => {
  writingReminderSettings.value = settings
}

const updatePassword = (password: string) => {
  userPassword.value = password
  localStorage.setItem('userPassword', userPassword.value)
  showToast('Password set successfully.')
  currentView.value = 'backup'
}

// Updated savePassword method
const savePassword = () => {
  const trimmedPassword = passwordInput.value.trim()

  if (trimmedPassword) {
    userPassword.value = trimmedPassword
    localStorage.setItem('userPassword', userPassword.value)
    showToast('Password set successfully.')
    currentView.value = 'backup'
  } else {
    userPassword.value = ''
    localStorage.removeItem('userPassword')
    showToast('Password protection disabled.')
    currentView.value = 'backup'
  }
  passwordInput.value = ''
}

// Updated executePendingAction method
const executePendingAction = () => {
  if (!pendingAction.value) {
    currentView.value = 'home'
    return
  }

  const action = pendingAction.value
  pendingAction.value = null

  switch (action.type) {
    case 'new-entry':
      currentEntry.value = {
        date: new Date().toISOString(),
        content: '',
        title: '',
        musicUrl: ''
      }
      isEditing.value = false
      currentView.value = 'write'
      break

    case 'view-entry':
      if (action.entry) {
        selectedEntry.value = action.entry
        currentMusicUrl.value = action.entry.musicUrl || ''
        currentView.value = 'view'
      }
      break

    case 'edit-entry':
      if (action.entry) {
        currentEntry.value = { ...action.entry }
        isEditing.value = true
        currentView.value = 'write'
      }
      break

    default:
      currentView.value = 'home'
  }
}

// Helper methods for functionality
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  let formattedMessage = message
  if (!message.endsWith('.') && !message.endsWith('!') && !message.endsWith('?')) {
    formattedMessage = message + '.'
  }

  toast.value = {
    show: true,
    message: formattedMessage,
    type: type === 'success' ? 'toast-success' : 'toast-error'
  }

  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const saveToIndexedDB = async (data: JournalEntry[]) => {
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

      // Clear existing data
      store.clear()

      // Add all entries
      data.forEach(entry => {
        store.add(entry)
      })
    }
  } catch (error) {
    console.error('Failed to backup to IndexedDB:', error)
  }
}

const verifyPassword = (type: string, inputPassword: string) => {
  console.log('[v0] Verifying password:', { type, inputPassword, userPassword: userPassword.value })

  if (!userPassword.value || userPassword.value.trim() === '') {
    // No password set, allow access
    if (type === 'settings') {
      currentView.value = 'backup'
      showToast('No password set - access granted.')
    } else if (type === 'entries') {
      executePendingAction()
      showToast('No password set - entries unlocked.')
    }
    passwordInput.value = ''
    return
  }

  // Password is set, verify it
  if (inputPassword && inputPassword.trim() === userPassword.value.trim()) {
    if (type === 'settings') {
      currentView.value = 'backup'
      showToast('Access granted.')
    } else if (type === 'entries') {
      executePendingAction()
      showToast('Entries unlocked.')
    }
    passwordInput.value = ''
  } else {
    showToast('Incorrect password.')
    // Don't clear password input on error so user can try again
  }
}

const playMusic = async (url?: string) => {
  if (url) {
    currentMusicUrl.value = url

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      await fetchAlbumCover(url)
      await fetchMusicMetadata(url)
      isPlaying.value = true
      showToast('YouTube music loaded!')
      return
    }

    // Stop current audio if playing different URL
    if (currentAudio.value && currentAudio.value.src !== url) {
      currentAudio.value.pause()
      currentAudio.value.currentTime = 0
      removeAudioListeners()
      currentAudio.value = null
    }

    // Create new audio only if needed
    if (!currentAudio.value) {
      try {
        currentAudio.value = new Audio(url)
        currentAudio.value.loop = true
        currentAudio.value.volume = 0.7
        currentAudio.value.preload = 'auto' // Ensure audio is preloaded
        addAudioListeners()

        // Wait for audio to be ready before playing
        await new Promise((resolve, reject) => {
          if (currentAudio.value) {
            currentAudio.value.addEventListener('canplaythrough', resolve, { once: true })
            currentAudio.value.addEventListener('error', reject, { once: true })
            currentAudio.value.load()
          }
        })
      } catch (error) {
        console.error('Audio creation failed:', error)
        showToast('Audio format not supported!')
        return
      }
    }

    try {
      await currentAudio.value.play()
      isPlaying.value = true
      showToast('Music started playing!')
    } catch (error) {
      console.error('Audio playback failed:', error)
      showToast('Audio playback failed!')
      isPlaying.value = false
    }
  } else if (currentAudio.value && currentAudio.value.paused) {
    try {
      await currentAudio.value.play()
      isPlaying.value = true
      showToast('Music resumed!')
    } catch (error) {
      console.error('Audio resume failed:', error)
      showToast('Could not resume audio!')
    }
  }
}

const pauseMusic = () => {
  if (currentMusicUrl.value.includes('youtube.com') || currentMusicUrl.value.includes('youtu.be')) {
    isPlaying.value = false
    showToast('YouTube music paused!')
    return
  }

  if (currentAudio.value && !currentAudio.value.paused) {
    currentAudio.value.pause()
    isPlaying.value = false
    showToast('Music paused!')
  }
}

const stopMusic = () => {
  if (currentAudio.value) {
    currentAudio.value.pause()
    currentAudio.value.currentTime = 0
    removeAudioListeners()
    currentAudio.value = null
  }

  // Clear all music state
  currentMusicUrl.value = ''
  currentAlbumCover.value = ''
  currentMusicTitle.value = ''
  currentMusicArtist.value = ''
  isPlaying.value = false
  showToast('Music stopped!')
}

const toggleMusic = async () => {
  console.log('[v0] Toggle music called, current state:', {
    isPlaying: isPlaying.value,
    hasAudio: !!currentAudio.value,
    musicUrl: currentMusicUrl.value
  })

  if (currentMusicUrl.value.includes('youtube.com') || currentMusicUrl.value.includes('youtu.be')) {
    isPlaying.value = !isPlaying.value
    showToast(isPlaying.value ? 'YouTube music playing!' : 'YouTube music paused!')
    return
  }

  if (currentAudio.value) {
    if (currentAudio.value.paused) {
      try {
        await currentAudio.value.play()
        isPlaying.value = true
        showToast('Music resumed!')
      } catch (error) {
        console.error('Play failed:', error)
        showToast('Could not play audio!')
      }
    } else {
      currentAudio.value.pause()
      isPlaying.value = false
      showToast('Music paused!')
    }
  } else if (currentMusicUrl.value) {
    await playMusic(currentMusicUrl.value)
  }
}

const fetchAlbumCover = async (url: string) => {
  try {
    const videoId = extractYouTubeVideoId(url)
    if (videoId) {
      currentAlbumCover.value = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    }
  } catch (error) {
    console.error('Failed to fetch album cover:', error)
    currentAlbumCover.value = ''
  }
}

const fetchMusicMetadata = async (url: string) => {
  try {
    let videoId = ''

    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0]
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0]
    }

    if (!videoId) return

    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
    const data = await response.json()

    if (data.title) {
      const title = data.title
      if (title.includes(' - ')) {
        const parts = title.split(' - ')
        currentMusicArtist.value = parts[0].trim()
        currentMusicTitle.value = parts[1].trim()
      } else if (title.includes(' by ')) {
        const parts = title.split(' by ')
        currentMusicTitle.value = parts[0].trim()
        currentMusicArtist.value = parts[1].trim()
      } else {
        currentMusicTitle.value = title
        currentMusicArtist.value = data.author_name || ''
      }
    }
  } catch (error) {
    console.error('Failed to fetch music metadata:', error)
    currentMusicTitle.value = 'Background Music'
    currentMusicArtist.value = ''
  }
}

const extractYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

const verifyStartupPassword = () => {
  if (!userPassword.value || startupPasswordInput.value.trim() === userPassword.value.trim()) {
    needsPasswordOnStartup.value = false
    startupPasswordInput.value = ''
    showToast('Welcome to your journal.')
  } else {
    showToast('Incorrect password.')
  }
}

// Audio event handlers for proper state management
const handleAudioEnded = () => {
  console.log('[v0] Audio ended')
  if (currentAudio.value && currentAudio.value.loop) {
    // Ensure loop continues without interruption
    currentAudio.value.currentTime = 0
    currentAudio.value.play().catch(error => {
      console.error('Auto-restart failed:', error)
      isPlaying.value = false
    })
  } else {
    isPlaying.value = false
  }
}

const handleAudioPause = () => {
  console.log('[v0] Audio paused')
  // Only update state if pause wasn't caused by seeking or buffering
  if (currentAudio.value && currentAudio.value.readyState >= 2) {
    isPlaying.value = false
  }
}

const handleAudioPlay = () => {
  console.log('[v0] Audio playing')
  isPlaying.value = true
}

const handleAudioError = (error: Event) => {
  console.error('[v0] Audio error:', error)
  isPlaying.value = false
  showToast('Audio playback error occurred!')
}

// Proper audio event listener management
const addAudioListeners = () => {
  if (!currentAudio.value) return

  currentAudio.value.addEventListener('ended', handleAudioEnded)
  currentAudio.value.addEventListener('pause', handleAudioPause)
  currentAudio.value.addEventListener('play', handleAudioPlay)
  currentAudio.value.addEventListener('error', handleAudioError)
  currentAudio.value.addEventListener('loadstart', handleAudioLoadStart)
  currentAudio.value.addEventListener('canplay', handleAudioCanPlay)
}

const removeAudioListeners = () => {
  if (!currentAudio.value) return

  currentAudio.value.removeEventListener('ended', handleAudioEnded)
  currentAudio.value.removeEventListener('pause', handleAudioPause)
  currentAudio.value.removeEventListener('play', handleAudioPlay)
  currentAudio.value.removeEventListener('error', handleAudioError)
  currentAudio.value.removeEventListener('loadstart', handleAudioLoadStart)
  currentAudio.value.removeEventListener('canplay', handleAudioCanPlay)
}

// Lifecycle
onMounted(async () => {
  if (!localStorage.getItem('installDate')) {
    localStorage.setItem('installDate', new Date().toISOString())
  }

  // Load entries from localStorage
  const savedEntries = localStorage.getItem('journal-entries')
  if (savedEntries) {
    entries.value = JSON.parse(savedEntries)
  }

  // Load backup settings
  const savedBackupSettings = localStorage.getItem('backupSettings')
  if (savedBackupSettings) {
    backupSettings.value = { ...backupSettings.value, ...JSON.parse(savedBackupSettings) }
  }

  // Check if password is set
  if (userPassword.value) {
    needsPasswordOnStartup.value = true
  }

  // Simulate loading delay
  setTimeout(() => {
    isLoading.value = false
  }, 2000)
})

onUnmounted(() => {
  // Keep music playing but clean up listeners to prevent memory leaks
  if (currentAudio.value) {
    removeAudioListeners()
    // Don't pause or destroy audio - let it continue playing across navigation
    console.log('[v0] Component unmounted, music continues playing')
  }
})
</script>
