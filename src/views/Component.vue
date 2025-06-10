<template>
    <div class="plugin-wrapper">

        <!-- SIDEBAR KIRI -->
        <aside class="sidebar">
        <ul class="sidebar-icons">
            <li :class="{ 'is-active': $route.path === '/checker' }" @click="goToChecker()">
            <img src="../ui/assets/icon-checker-default.png" alt="Checker" />
            </li>
            <li :class="{ 'is-active': $route.path === '/component' }" @click="goToComponentPage()">
            <img src="../ui/assets/icon-component-active.png" alt="Component" />
            </li>
            <li :class="{ 'is-active': $route.path === '/help' }" @click="goToHelp()">
            <img src="../ui/assets/icon-help-default.png" alt="Help" />
            </li>
        </ul>
        <div class="sidebar-bottom">
            <button :class="{ 'is-active': $route.path === '/settings' }" @click="goToSettings()">
            <img src="../ui/assets/icon-settings-default.png" alt="Settings" />
            </button>
        </div>
        </aside>


        <div class="plugin-container">
          <div class="plugin-header">
            <div class="header-text">
              <h4 class="h4 bold">Design System Components</h4>
              <p class="h7 text-light-dark">Showcases all components available in the design system</p>
              <Button :disabled="!isModelReady" variant="primary" @click="onClickCheck">
                Check Components
              </Button>
            </div>
            <div class="header-illustration">
              <img src="../ui/assets/img-background-ds.png" alt="Illustration" />
            </div>
          </div>

        </div>


    </div>



</template>

<script>
import Button from "../ui/components/Button.vue";
import { useRouter } from 'vue-router'


export default{

    methods: {

    goToChecker(){
        this.$router.push('/checker');
    },

    goToHelp(){
      this.$router.push('/help');
    },

    goToSettings(){
      this.$router.push('/settings');

    },

    goToComponentPage() {
          this.$router.push('/component');

    },


    }
    


};
</script>

<style scoped>

/* WRAPPER */
.plugin-wrapper {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* SIDEBAR */
.sidebar {
  width: 64px;
  background: var(--clr-secondary);
  display: flex;
  box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.15);
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.sidebar-icons {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-icons li,
.sidebar-bottom button {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  background-color: var(--clr-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  padding: 0;
  transition: background-color 0.2s;
}

.sidebar img {
  width: 24px;
  height: 24px;
}

.sidebar-icons li.is-active,
.sidebar-bottom button.is-active {
  background-color: #08A94C;
}

/* MAIN CONTENT */
.plugin-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  gap: 16px;
}

/* HEADER */
.plugin-header {
  display: flex;
  justify-content: space-between;
  background: #F5F8FA;
  padding: 24px 16px;
  padding-right: 40px;
  height: 144px;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-illustration {
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-illustration img {
  max-width: 200px;
  height: auto;
}

</style>