<template>
  <div class="help-page">
    <!-- Back button -->
   
    <div class="plugin-header">
      <div class="back-container">
          <button class="btn-back" @click="goBack">
          🡨 Kembali
          </button>
      </div>  
      
      <div class="header-text">
              <h4 class="h4 bold" style="text-align: center;">Hello, how can we help?</h4>
              <p class="body" style="text-align: center;">Welcome to Help Desk! We're here to assist you with any questions or issues you may have.</p>
              
            </div>
            <div class="header-illustration">
              <img src="../ui/assets/img-illustration-helping.svg" alt="Illustration" />
            </div>

      </div>

    <!-- (Optional) Header atas -->
    

    <!-- Cards + border -->
    <div class="cards-wrapper">
      <div class="help-cards">
        <div
          v-for="section in sections"
          :key="section.key"
          :class="['help-card', { active: currentSection === section.key }]"
          @click="currentSection = section.key"
        >
          <img class="card-icon" :src="section.icon" alt="" />
          <div class="card-text">
            <h3 class="body bold" style="justify-content: left;">{{ section.title }}</h3>
            <p class="body-small text-light-dark" style="justify-content: left;">{{ section.desc }}</p>
          </div>
          
        </div>
      </div>
    </div>

    <!-- Konten dinamis (hanya area ini yg scrollable) -->
    <div class="help-content">
      <keep-alive>
        <component :is="sectionsMap[currentSection]" />
      </keep-alive>
    </div>
  </div>
</template>

<script>
import IntroSection    from './HelpFigmaFileKey.vue'
import UsageSection    from './HelpChecker.vue'
import AdvancedSection from './HelpLibraryComponent.vue'

// sesuaikan path icon dengan asset-mu
import figmaIcon       from '../ui/assets/img-illustration-help.png'
import checkerIcon     from '../ui/assets/img-illustration-help.png'
import insertIcon      from '../ui/assets/img-illustration-help.png'

export default {
  name: 'HelpTutorial',
  components: { IntroSection, UsageSection, AdvancedSection },
  data() {
    return {
      sections: [
        { key: 'intro',    title: 'Figma File Key',    desc: 'Cara menemukan figma file key',          icon: figmaIcon },
        { key: 'usage',    title: 'Component Checker',  desc: 'Cara Menggunakan Component Checker',     icon: checkerIcon },
        { key: 'advanced', title: 'Insert Component',   desc: 'Cara Insert Design System Component',    icon: insertIcon }
      ],
      currentSection: 'intro',
      sectionsMap: {
        intro:    'IntroSection',
        usage:    'UsageSection',
        advanced: 'AdvancedSection'
      }
    }
  },
  methods: {
    goBack() {
      if (this.$router && this.$router.back) this.$router.back()
      else window.history.back()
    }
  }
}
</script>

<style scoped>
.help-page {
  display: flex;
  flex-direction: column;
  height: 100vh;             /* Penuh tinggi viewport/panel */
}

/* Back button & header */
.back-container {
  width: 207px;
  height: 96px;
}

.btn-back {
  background: none;
  border: none;
  color: #08A94C;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  /* margin: 1rem 0 0 1rem; */
}



.plugin-header {
  display: flex;
  justify-content: space-between;
  background: #F5F8FA;
  padding: 24px 16px;
  padding-right: 16px;
  height: 136px;
}

.header-text {
  width: 306px;
  height: 72px;
  padding: 12px 0px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header-illustration {
  display: flex;
  width: 207px;
  align-items: center;
  justify-content: center;
}

.header-illustration img {
  max-width: 200px;
  height: auto;
}

/* Wrapper kartu + border bawah */
.cards-wrapper {
  padding: 16px;          /* ruang bawah untuk border */
  /* border-bottom: 1px solid #e0e0e0; */
}
.help-cards {
  display: flex;
  gap: 1rem;
  overflow-x: auto;              /* bisa digeser horizontal */
  padding-bottom: .5rem;
  margin: 0 -1rem;               /* supaya kartu mulai dari tepi */
  padding: 0 1rem;
}
.help-card {
  display: flex;
  flex: 1 1 0;
  flex-direction: row;
  height: 84px;
  gap: 8px;
  min-width: 200px;
  background: #fff;
  border: 1px solid #E8ECF5;
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: border-color .2s, background-color .2s;
}
.help-card .card-icon {
  width: 52px;
  height: 52px;
  margin-bottom: .5rem;
}
.help-card .card-title {
  margin: .5rem 0 .25rem;
  color: #2c3e50;
  font-size: 1.05rem;
}
.help-card .card-desc {
  margin: 0;
  color: #777;
  font-size: .9rem;
}
.help-card.active {
  border-color: #08A94C;
  background-color: #D5FADD;
}
.help-card.active .card-title {
  color: #386b32;
}

.card-text {
  text-align: left;
  display: flex;
  justify-content: left;
  flex-direction: column;
  gap: 4px;
}

/* Konten bawah yang hanya area ini scrollable */
.help-content {
  flex: 1;                       /* isi semua sisa ruang */
  overflow-y: auto;
  padding: 48px;
  background: #fff;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}
</style>
