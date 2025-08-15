<template>
  <div class="view-entry" @touchstart="$emit('touchstart', $event)" @touchmove="$emit('touchmove', $event)" @touchend="$emit('touchend', $event)">
    <div class="view-header">
      <button @click="$emit('goHome')" class="back-button">
        <ChevronLeft class="icon-large" />
      </button>
      <h2 class="view-title">Entry</h2>
      <button @click="$emit('edit')" class="edit-button">
        <Edit3 class="icon-size" />
      </button>
    </div>

    <div v-if="selectedEntry" class="entry-display">
      <div v-if="selectedEntry.musicUrl" class="card music-player-card">
        <!-- Removed all music control buttons and kept only album cover display -->
        <div class="music-album-cover" v-if="props.albumCover">
          <img :src="props.albumCover" :alt="musicTitle || 'Album Cover'" class="album-cover-image" />
        </div>
        <div class="music-info">
          <Music class="icon-size" />
          <div class="music-details">
            <span class="music-label">{{ musicTitle || 'Background Music' }}</span>
            <span v-if="musicArtist" class="music-artist">{{ musicArtist }}</span>
          </div>
        </div>
        <iframe
            v-if="isYouTubeUrl(selectedEntry.musicUrl)"
            ref="musicPlayer"
            :src="getYouTubeEmbedUrl(selectedEntry.musicUrl)"
            frameborder="0"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowfullscreen
            class="music-iframe youtube-player"
            @load="handleMusicLoad"
        ></iframe>
        <audio
            v-else
            ref="audioPlayer"
            :src="selectedEntry.musicUrl"
            controls
            loop
            class="audio-player"
        ></audio>
      </div>

      <div class="card">
        <div class="entry-header">
          <span class="entry-date">{{ formatDate(selectedEntry.date) }}</span>
        </div>
        <h3 v-if="selectedEntry.title" class="display-title">{{ selectedEntry.title }}</h3>
        <p class="display-content">{{ selectedEntry.content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ChevronLeft, Edit3, Music, Play, Pause, Square } from 'lucide-vue-next'

interface JournalEntry {
  id: string
  date: string
  title?: string
  content: string
  musicUrl?: string
  createdAt: number
}

const props = defineProps<{
  selectedEntry: JournalEntry | null
  isPlaying: boolean
  albumCover?: string
}>()

const emit = defineEmits<{
  goHome: []
  edit: []
  touchstart: [event: TouchEvent]
  touchmove: [event: TouchEvent]
  touchend: [event: TouchEvent]
}>()

const musicTitle = ref('')
const musicArtist = ref('')
const musicPlayer = ref<HTMLIFrameElement>()
const audioPlayer = ref<HTMLAudioElement>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const isYouTubeUrl = (url: string) => {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return ''

  let videoId = ''

  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1]?.split('&')[0]
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0]
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('embed/')[1]?.split('?')[0]
  }

  if (!videoId) return ''

  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&loop=1&playlist=${videoId}&controls=1&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3`
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
        musicArtist.value = parts[0].trim()
        musicTitle.value = parts[1].trim()
      } else if (title.includes(' by ')) {
        const parts = title.split(' by ')
        musicTitle.value = parts[0].trim()
        musicArtist.value = parts[1].trim()
      } else {
        musicTitle.value = title
        musicArtist.value = data.author_name || ''
      }
    }
  } catch (error) {
    console.error('Failed to fetch music metadata:', error)
    musicTitle.value = 'Background Music'
    musicArtist.value = ''
  }
}

const handleMusicLoad = () => {
  // Music will autoplay through iframe/audio element
}

watch(() => props.selectedEntry?.musicUrl, (newUrl) => {
  if (newUrl) {
    if (isYouTubeUrl(newUrl)) {
      fetchMusicMetadata(newUrl)
    } else {
      musicTitle.value = 'Audio File'
      musicArtist.value = ''
    }
  } else {
    musicTitle.value = ''
    musicArtist.value = ''
  }
}, { immediate: true })

onMounted(() => {
  if (props.selectedEntry?.musicUrl) {
    if (isYouTubeUrl(props.selectedEntry.musicUrl)) {
      fetchMusicMetadata(props.selectedEntry.musicUrl)
    }
  }
})
</script>
