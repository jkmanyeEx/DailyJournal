<template>
  <div class="write-view" @touchstart="$emit('touchstart', $event)" @touchmove="$emit('touchmove', $event)" @touchend="$emit('touchend', $event)">
    <div class="view-header">
      <button @click="$emit('goHome')" class="back-button">
        <ChevronLeft class="icon-large" />
      </button>
      <h2 class="view-title">
        {{ isEditing ? 'Edit Entry' : 'New Entry' }}
      </h2>
      <div class="header-spacer"></div>
    </div>

    <div class="write-content">
      <div class="card">
        <input :value="localEntry.title" @input="updateTitle" placeholder="Entry title (optional)" class="input-field" />
      </div>

      <div class="card">
        <input :value="localEntry.musicUrl" @input="updateMusicUrl" placeholder="YouTube music link (optional)" class="input-field" />
        <div v-if="localEntry.musicUrl" class="music-preview">
          <Music class="icon-size" />
          <span class="music-text">Music will play when reading this entry</span>
        </div>
      </div>

      <div class="card">
        <textarea :value="localEntry.content" @input="updateContent" placeholder="What's on your mind today? Reflect on a moment that made you smile..." class="textarea-field"></textarea>
      </div>

      <div class="write-actions">
        <!-- Fixed save button to pass the current entry data -->
        <button @click="handleSave" class="btn-primary flex-grow">
          <Save class="icon-size button-icon" />
          Save Entry
        </button>
        <button v-if="isEditing" @click="handleDelete" class="btn-secondary">
          <Trash2 class="icon-size" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChevronLeft, Save, Trash2, Music } from 'lucide-vue-next'

interface JournalEntry {
  id?: string
  date?: string
  title?: string
  content?: string
  musicUrl?: string
  createdAt?: number
}

const props = defineProps<{
  currentEntry: JournalEntry
  isEditing: boolean
}>()

const emit = defineEmits<{
  goHome: []
  save: [entry: JournalEntry]
  delete: [id: string]
  touchstart: [event: TouchEvent]
  touchmove: [event: TouchEvent]
  touchend: [event: TouchEvent]
}>()

const localEntry = ref({ ...props.currentEntry })

watch(() => props.currentEntry, (newEntry) => {
  localEntry.value = { ...newEntry }
}, { deep: true })

const updateTitle = (event: Event) => {
  const target = event.target as HTMLInputElement
  localEntry.value.title = target.value
}

const updateMusicUrl = (event: Event) => {
  const target = event.target as HTMLInputElement
  localEntry.value.musicUrl = target.value
}

const updateContent = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  localEntry.value.content = target.value
}

const handleSave = () => {
  emit('save', { ...localEntry.value })
}

const handleDelete = () => {
  if (localEntry.value.id) {
    emit('delete', localEntry.value.id)
  }
}
</script>
