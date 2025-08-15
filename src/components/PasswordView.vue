<template>
  <div class="password-view">
    <div class="view-header">
      <button @click="$emit('goHome')" class="back-button">
        <ChevronLeft class="icon-large" />
      </button>
      <h2 class="view-title">Enter Password</h2>
      <div class="header-spacer"></div>
    </div>

    <div class="password-content">
      <div class="card">
        <div class="password-icon">
          <Lock v-if="passwordType === 'settings'" class="icon-large" />
          <BookOpen v-else class="icon-large" />
        </div>
        <h3 class="password-title">{{ passwordType === 'settings' ? 'Settings Protected' : 'Entry Protected' }}</h3>
        <p class="password-description">
          {{ passwordType === 'settings' ? 'Enter your password to access backup and settings.' : 'Enter your password to access your journal entries.' }}
        </p>

        <div class="password-form">
          <div class="password-input-wrapper">
            <input
                :value="localPassword"
                @input="updatePassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter password"
                class="input-field password-input"
                @keyup.enter="handleVerify"
                autofocus
            />
            <button @click="togglePasswordVisibility" class="password-toggle-btn" type="button">
              <Eye v-if="!showPassword" class="icon-size" />
              <EyeOff v-else class="icon-size" />
            </button>
          </div>
          <button @click="handleVerify" class="btn-primary full-width">
            <Lock v-if="passwordType === 'settings'" class="icon-size button-icon" />
            <BookOpen v-else class="icon-size button-icon" />
            {{ passwordType === 'settings' ? 'Unlock Settings' : 'Unlock Entries' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ChevronLeft, Lock, BookOpen, Eye, EyeOff } from 'lucide-vue-next'

const props = defineProps<{
  passwordInput: string
  currentView: string
}>()

const emit = defineEmits<{
  goHome: []
  verifyPassword: [type: string, password: string]
  'update:passwordInput': [value: string]
}>()

const localPassword = ref(props.passwordInput)
const showPassword = ref(false)

const passwordType = computed(() => {
  return props.currentView === 'password' ? 'settings' : 'entries'
})

watch(() => props.passwordInput, (newValue) => {
  localPassword.value = newValue
})

const updatePassword = (event: Event) => {
  const target = event.target as HTMLInputElement
  localPassword.value = target.value
  emit('update:passwordInput', target.value)
}

const handleVerify = () => {
  emit('verifyPassword', passwordType.value, localPassword.value)
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>
