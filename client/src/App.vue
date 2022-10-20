<template>
  <n-config-provider :theme="darkTheme">
    <n-global-style/>

    <n-loading-bar-provider>

      <template v-if="initialized">
        <template v-if="needsLogin">
          <div style="width: 100%; height: 100vh; display: flex; align-items: center; justify-content: center">
            <n-card style="max-width: 512px; margin: auto;">
              <p>
                You are not logged in
              </p>
              <n-button @click="login">
                Login with osu!
              </n-button>

              <p>
                <i>
                  Use chrome btw. Opera & edge seem to have lag issues
                </i>
              </p>
            </n-card>
          </div>
        </template>
        <template v-else>
          <router-view/>

        </template>
      </template>
      <template v-else>

      </template>

    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">

import {EditorConnector} from "@/editor/connector";
import {provide, ref} from "vue";
import {darkTheme} from 'naive-ui'
import axios from "axios";
import {apiUrl} from "@/api";

const connector = new EditorConnector()
const initialized = ref(false)

interface UserData {
  id: number
  displayName: string
  profileId: number
  avatarUrl: string
}

const user = ref<{ token: string, user: UserData }>()
const needsLogin = ref(false)

async function loadUser() {
  try {
    const response = await axios.get(apiUrl('/user/me '), {withCredentials: true})
    user.value = response.data
    await connector.connect(response.data.token)
    initialized.value = true
  } catch (e) {
    console.error(e)
    needsLogin.value = true
    initialized.value = true
  }
}

loadUser()

function login() {
  localStorage.setItem('auth-redirect', window.location.pathname)
  window.location.href = apiUrl('/auth/osu')
}

provide('connector', connector)

</script>

<style lang="scss">
#app {
  font-family: v-sans, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
