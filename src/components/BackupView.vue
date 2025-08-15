<template>
  <div class="backup-view" @touchstart="$emit('touchstart', $event)" @touchmove="$emit('touchmove', $event)" @touchend="$emit('touchend', $event)">
    <div class="view-header">
      <button @click="$emit('goHome')" class="back-button">
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
            <span class="status-value">{{ totalEntries }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Last Backup:</span>
            <span class="status-value">{{ lastBackupDate }}</span>
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
          <button @click="$emit('exportData')" class="btn-primary full-width">
            <Download class="icon-size button-icon" />
            Export All Entries
          </button>
          <div class="file-input-wrapper">
            <input ref="fileInput" type="file" accept=".json" @change="$emit('importData', $event)" class="file-input" />
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
            <input :checked="localBackupSettings.reminders" @change="updateBackupReminders" type="checkbox" class="toggle-checkbox" />
          </label>
          <label class="setting-item">
            <span class="setting-label">Push Notifications</span>
            <input :checked="localBackupSettings.pushNotifications" @change="updateBackupPushNotifications" type="checkbox" class="toggle-checkbox" />
          </label>
          <div v-if="localBackupSettings.reminders" class="sub-settings">
            <label class="setting-item sub-setting">
              <span class="setting-label">Remind every:</span>
              <select :value="localBackupSettings.reminderDays" @change="updateReminderDays" class="setting-select">
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
            <input :checked="localWritingSettings.enabled" @change="updateWritingEnabled" type="checkbox" class="toggle-checkbox" />
          </label>
          <label class="setting-item">
            <span class="setting-label">Push Notifications</span>
            <input :checked="localWritingSettings.pushNotifications" @change="updateWritingPushNotifications" type="checkbox" class="toggle-checkbox" />
          </label>
          <div v-if="localWritingSettings.enabled" class="sub-settings">
            <label class="setting-item sub-setting">
              <span class="setting-label">Reminder time:</span>
              <input :value="localWritingSettings.time" @change="updateWritingTime" type="time" class="setting-time-input" />
            </label>
          </div>
        </div>
      </div>

      <!-- Data Recovery -->
      <div class="card">
        <h3 class="card-section-title">Data Recovery</h3>
        <div class="action-buttons">
          <button @click="$emit('validateData')" class="btn-secondary full-width">
            <Shield class="icon-size button-icon" />
            Validate Data Integrity
          </button>
          <button @click="$emit('recoverFromIndexedDB')" class="btn-secondary full-width">
            <RefreshCw class="icon-size button-icon" />
            Recover from Backup Storage
          </button>
        </div>
      </div>

      <!-- Password Configuration -->
      <div class="card">
        <h3 class="card-section-title">Password Protection</h3>
        <div class="settings-section">
          <div class="setting-item">
            <div class="password-input-wrapper">
              <input
                  :value="localUserPassword"
                  @input="updateUserPassword"
                  :type="showSettingsPassword ? 'text' : 'password'"
                  placeholder="Leave empty for no password"
                  class="input-field"
              />
              <button @click="toggleSettingsPasswordVisibility" class="password-toggle-btn" type="button">
                <Eye v-if="!showSettingsPassword" class="icon-size" />
                <EyeOff v-else class="icon-size" />
              </button>
            </div>
            <!-- emit savePassword event when button is clicked -->
            <button @click="handleSavePassword" class="btn-secondary">
              Save Password
            </button>
          </div>
          <p class="setting-description">
            Set a password to protect your settings and entries. Leave empty to disable password protection.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChevronLeft, Download, Upload, Shield, RefreshCw, Eye, EyeOff } from 'lucide-vue-next'

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

const props = defineProps<{
  backupSettings: BackupSettings
  writingReminderSettings: WritingReminderSettings
  userPassword: string
  totalEntries: number
  lastBackupDate: string | null
  storageSize: string
}>()

const emit = defineEmits<{
  goHome: []
  exportData: []
  importData: [event: Event]
  validateData: []
  recoverFromIndexedDB: []
  savePassword: []
  handlePushNotificationToggle: []
  handleWritingPushNotificationToggle: []
  saveWritingReminderSettings: []
  updateBackupSettings: [settings: BackupSettings]
  updateWritingSettings: [settings: WritingReminderSettings]
  updateUserPassword: [password: string]
  touchstart: [event: TouchEvent]
  touchmove: [event: TouchEvent]
  touchend: [event: TouchEvent]
}>()

const localBackupSettings = ref({ ...props.backupSettings })
const localWritingSettings = ref({ ...props.writingReminderSettings })
const localUserPassword = ref(props.userPassword)
const showSettingsPassword = ref(false)

watch(() => props.backupSettings, (newSettings) => {
  localBackupSettings.value = { ...newSettings }
}, { deep: true })

watch(() => props.writingReminderSettings, (newSettings) => {
  localWritingSettings.value = { ...newSettings }
}, { deep: true })

watch(() => props.userPassword, (newPassword) => {
  localUserPassword.value = newPassword
})

const updateBackupReminders = (event: Event) => {
  const target = event.target as HTMLInputElement
  localBackupSettings.value.reminders = target.checked
  emit('updateBackupSettings', { ...localBackupSettings.value })
}

const updateBackupPushNotifications = (event: Event) => {
  const target = event.target as HTMLInputElement
  localBackupSettings.value.pushNotifications = target.checked
  emit('updateBackupSettings', { ...localBackupSettings.value })
  emit('handlePushNotificationToggle')
}

const updateReminderDays = (event: Event) => {
  const target = event.target as HTMLSelectElement
  localBackupSettings.value.reminderDays = parseInt(target.value)
  emit('updateBackupSettings', { ...localBackupSettings.value })
}

const updateWritingEnabled = (event: Event) => {
  const target = event.target as HTMLInputElement
  localWritingSettings.value.enabled = target.checked
  emit('updateWritingSettings', { ...localWritingSettings.value })
  emit('saveWritingReminderSettings')
}

const updateWritingPushNotifications = (event: Event) => {
  const target = event.target as HTMLInputElement
  localWritingSettings.value.pushNotifications = target.checked
  emit('updateWritingSettings', { ...localWritingSettings.value })
  emit('handleWritingPushNotificationToggle')
}

const updateWritingTime = (event: Event) => {
  const target = event.target as HTMLInputElement
  localWritingSettings.value.time = target.value
  emit('updateWritingSettings', { ...localWritingSettings.value })
  emit('saveWritingReminderSettings')
}

const updateUserPassword = (event: Event) => {
  const target = event.target as HTMLInputElement
  localUserPassword.value = target.value
  emit('updateUserPassword', target.value)
}

const handleSavePassword = () => {
  emit('savePassword')
}

const toggleSettingsPasswordVisibility = () => {
  showSettingsPassword.value = !showSettingsPassword.value
}
</script>
