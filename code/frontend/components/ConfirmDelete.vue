<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">

      <!-- STEP 1: ยืนยันเงื่อนไข -->
      <div v-if="step === 1">
        <h3 class="text-center font-semibold text-lg">
          ยืนยันการลบบัญชีผู้ใช้
        </h3>

        <p class="text-gray-700 my-4 shadow-sm rounded-lg p-4 bg-gray-200">
          กรุณาอ่านเงื่อนไขก่อนดำเนินการลบบัญชี
        </p>

        <div class="flex items-center mb-4">
          <input type="checkbox" v-model="acceptTerms" class="mr-2" />
          <span>ยอมรับข้อกำหนดและเงื่อนไข</span>
        </div>

        <div class="flex justify-center space-x-4">
          <button
            class="border px-4 py-2 rounded-md"
            @click="closeModal"
          >
            ยกเลิก
          </button>

          <button
            class="bg-red-600 text-white px-4 py-2 rounded-md
                   disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!acceptTerms"
            @click="goToEmailStep"
          >
            ยืนยันการลบ
          </button>
        </div>
      </div>

      <!-- STEP 2: กรอกอีเมลยืนยัน -->
      <div v-else-if="step === 2">
        <h3 class="text-center font-semibold text-lg">
          กรุณากรอกอีเมลเพื่อยืนยัน
        </h3>

        <input
          type="email"
          v-model="email"
          placeholder="กรอกอีเมลของคุณ"
          class="w-full border px-3 py-2 rounded-md my-4"
        />

        <div class="flex justify-center space-x-4">
          <button
            class="border px-4 py-2 rounded-md"
            @click="step = 1"
          >
            ย้อนกลับ
          </button>

          <button
            class="bg-red-600 text-white px-4 py-2 rounded-md
                   disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!isValidEmail"
            @click="confirmDelete"
          >
            ยืนยันลบบัญชี
          </button>
        </div>
      </div>

      <!-- STEP 3: ลบบัญชีสำเร็จ -->
      <div v-else-if="step === 3" class="text-center">
        <div class="py-6">
          <CheckCircleIcon class="w-32 h-32 text-green-600 mx-auto mb-4 items-center-safe" />
          <h2 class="text-2xl font-bold text-blue-800 mb-4">
            ลบบัญชีสำเร็จแล้ว
          </h2>

          <p class="text-gray-600 mb-6">
            บัญชีของคุณถูกลบเรียบร้อยแล้ว
          </p>

          <button
            class="bg-blue-600 text-white px-6 py-3 rounded-md
                   hover:bg-blue-700 transition"
            @click="finishDelete"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref , computed } from 'vue'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'


const props = defineProps({
  isVisible: Boolean
})

const emit = defineEmits(['close', 'confirm'])

const step = ref(1)
const acceptTerms = ref(false)
const email = ref('')

const closeModal = () => {
  step.value = 1
  acceptTerms.value = false
  email.value = ''
  emit('close')
}

const goToEmailStep = () => {
  if (!acceptTerms.value) return
  step.value = 2
}

const confirmDelete = () => {
  console.log("ลบบัญชีด้วยอีเมล:", email.value)

 

  step.value = 3
}

const finishDelete = () => {
  closeModal()
}


const Email = ref('')

const isValidEmail = computed(() => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email.value)
})


</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: white;
  padding: 40px;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  animation: fadeInScale 0.2s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
