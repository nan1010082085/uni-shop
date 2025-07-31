<template>
  <nav-bar title="编辑资料" />
  <div class="edit-wrap">编辑资料</div>
</template>
<script setup lang="ts">
import NavBar from '@/components/NavBar/index.vue'
import { useRoute } from '@/router'
import { onMounted } from 'vue'

const route = useRoute()

const init = () => {
  const id = route.query.id as string
  console.log('user info  id', id)
}

onMounted(init)
</script>

<style lang="scss" scoped></style>
