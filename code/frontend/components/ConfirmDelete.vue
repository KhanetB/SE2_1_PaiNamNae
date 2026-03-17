<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <!-- STEP 1: ยืนยันเงื่อนไข -->
      <div v-if="step === 1">
        <h3 class="text-center font-semibold text-lg text-red-600">
          ยืนยันการลบบัญชีผู้ใช้
        </h3>

        <div
          ref="chatContainer"
          class="my-4 h-64 overflow-y-auto rounded-xl border border-gray-300 bg-white p-6 shadow-sm scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
        >
          <!-- Main Title -->
          <h2 class="text-2xl md:text-xl font-bold mb-4">
            ข้อกำหนดและเงื่อนไขการใช้สิทธิขอถอนตัว ลบข้อมูลส่วนบุคคล
            และขอรับสำเนาข้อมูล
          </h2>

          <p class="font-semibold mb-6">
            ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
          </p>

          <p class="mb-8">
            เพื่อให้เป็นไปตามบทบัญญัติแห่งพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล
            พ.ศ. 2562 ผู้ใช้บริการ (ซึ่งต่อไปนี้จะเรียกว่า
            <span class="font-semibold">"เจ้าของข้อมูลส่วนบุคคล"</span>)
            มีสิทธิในการขอเข้าถึง รับสำเนา
            และขอให้ระงับหรือลบทำลายข้อมูลส่วนบุคคลของตน
            โดยการใช้สิทธิดังกล่าวให้เป็นไปตามเงื่อนไขและรายละเอียดที่ระบุไว้ดังต่อไปนี้:
          </p>

          <!-- Section 1 -->
          <h3 class="text-xl font-semibold mt-10 mb-4">
            1. ขอบเขตการจัดส่งและรับสำเนาข้อมูลส่วนบุคคล
          </h3>

          <p class="mb-6">
            ก่อนการดำเนินการลบบัญชีผู้ใช้ บริษัทฯ/เว็บไซต์
            จะทำการประมวลผลเพื่อจัดส่งสำเนาข้อมูลส่วนบุคคล
            ในรูปแบบที่สามารถอ่านหรือใช้งานได้โดยทั่วไปด้วยเครื่องมือหรืออุปกรณ์ที่ทำงานได้โดยอัตโนมัติ
            (Machine Readable Format) โดยครอบคลุมรายการข้อมูลดังนี้:
          </p>

          <ul class="list-disc pl-8 space-y-4 mb-8">
            <li>
              <span class="font-semibold">
                (1) ข้อมูลอัตลักษณ์และการพิสูจน์ยืนยันตัวตน (Identity &
                Verification Data):
              </span>
              ชื่อผู้ใช้ (Username), ที่อยู่อีเมล, ชื่อ-นามสกุล, เพศ,
              หมายเลขโทรศัพท์ติดต่อ, ภาพถ่ายประจำตัว,
              ข้อมูลตามบัตรประจำตัวประชาชน, ภาพถ่ายใบหน้าเพื่อการตรวจสอบ
              (Selfie) รวมถึงข้อมูลใบอนุญาตขับขี่
              (ในกรณีผู้ใช้สถานะผู้ให้บริการขับขี่)
            </li>

            <li>
              <span class="font-semibold">
                (2) ข้อมูลรายละเอียดทรัพย์สิน (Registered Assets):
              </span>
              รายละเอียดเชิงเทคนิคและลักษณะทางกายภาพของยานพาหนะ ได้แก่ รุ่น,
              ประเภท, สี, หมายเลขทะเบียนรถ, จำนวนที่นั่ง
              และอุปกรณ์ส่วนควบหรือสิ่งอำนวยความสะดวก
            </li>

            <li>
              <span class="font-semibold">
                (3) ข้อมูลประวัติการทำธุรกรรมและการใช้งาน (Transaction &
                Activity History):
              </span>
              รายละเอียดการสร้างเส้นทาง, ประวัติการสำรองที่นั่ง,
              วันเวลาที่เกิดรายการ, สถานะธุรกรรม
              รวมถึงบันทึกเหตุผลแห่งการปฏิเสธหรือยกเลิกรายการ (ถ้ามี)
            </li>
          </ul>

          <!-- Section 2 -->
          <h3 class="text-xl font-semibold mt-10 mb-4">
            2. ช่องทางการจัดส่งข้อมูลและความจำกัดความรับผิด
          </h3>

          <p class="mb-6">
            เจ้าของข้อมูลส่วนบุคคลตกลงให้สัญญากับเว็บไซต์ว่า
            อีเมลที่ระบุเพื่อรับข้อมูลนั้นเป็นอีเมลที่เจ้าของข้อมูลมีสิทธิครอบครองและใช้สอยโดยชอบด้วยกฎหมายแต่เพียงผู้เดียว
          </p>

          <ul class="list-disc pl-8 space-y-4 mb-8">
            <li>
              <span class="font-semibold">การโอนย้ายข้อมูล:</span>
              เว็บไซต์จะจัดส่งข้อมูลไปยังที่อยู่อีเมลที่ผู้ใช้ระบุในขั้นตอนการยื่นคำร้อง
            </li>

            <li>
              <span class="font-semibold">ความจำกัดความรับผิด:</span>
              เว็บไซต์ขอปฏิเสธความรับผิดชอบในบรรดาความเสียหาย ความสูญหาย
              หรือการเข้าถึงข้อมูลโดยมิชอบ (Unauthorized Access)
              อันเกิดจากการระบุที่อยู่อีเมลผิดพลาด
              หรือความบกพร่องในระบบรักษาความปลอดภัยของสื่ออิเล็กทรอนิกส์ส่วนบุคคลของผู้ใช้เอง
            </li>
          </ul>

          <!-- Section 3 -->
          <h3 class="text-xl font-semibold mt-10 mb-4">
            3. เงื่อนไขและผลแห่งการลบบัญชีผู้ใช้ (Data Erasure & Anonymization)
          </h3>

          <p class="mb-6">
            เมื่อผู้ใช้แสดงเจตนาลบบัญชีและยืนยันคำขอ
            ให้ถือว่าความตกลงนี้มีผลผูกพันดังนี้:
          </p>

          <ul class="list-disc pl-8 space-y-4 mb-8">
            <li>
              <span class="font-semibold">การระงับสิทธิใช้งาน:</span>
              บัญชีผู้ใช้จะถูกระงับการเข้าถึง (Deactivated)
              และยุติการให้บริการในทันที
            </li>
            <li>
              <span class="font-semibold">กระบวนการทำลายข้อมูล:</span>
              ข้อมูลส่วนบุคคลจะถูกดำเนินการทำให้ไม่สามารถระบุตัวบุคคลได้
              (Anonymization) หรือลบทำลายตามมาตรฐานทางเทคนิค
              ภายในระยะเวลาไม่เกิน 90 (เก้าสิบ) วัน
            </li>
            <li>
              <span class="font-semibold">ข้อยกเว้นการลบข้อมูล:</span>
              เว็บไซต์ขอสงวนสิทธิในการเก็บรักษาข้อมูลบางส่วนไว้เท่าที่จำเป็น
              เพื่อประโยชน์ในการพิสูจน์สิทธิ หรือปฏิบัติตามกฎหมายที่เกี่ยวข้อง
            </li>
            <li>
              <span class="font-semibold">ผลสิ้นสุดถาวร:</span>
              การลบบัญชีเป็นการดำเนินการที่ไม่อาจกลับคืนสู่สภาพเดิมได้
              (Irreversible)
            </li>
          </ul>

          <!-- Section 4 -->
          <h3 class="text-xl font-semibold mt-10 mb-4">
            4. คำรับรองและข้อตกลงของเจ้าของข้อมูล
          </h3>

          <p class="mb-6">
            ข้าพเจ้าในฐานะเจ้าของข้อมูลส่วนบุคคล ขอให้คำรับรองต่อเว็บไซต์ว่า:
          </p>

          <ol class="list-decimal pl-8 space-y-4">
            <li>
              ข้าพเจ้าเป็นเจ้าของบัญชีผู้ใช้และเป็นเจ้าของข้อมูลส่วนบุคคลที่แท้จริงตามกฎหมาย
            </li>
            <li>
              ข้าพเจ้าได้อ่านและเข้าใจในรายละเอียด ผลกระทบ
              และความเสี่ยงทางกฎหมายจากการลบบัญชีและข้อมูลส่วนบุคคลเป็นอย่างดีแล้ว
            </li>
            <li>
              ข้าพเจ้าให้ความยินยอมโดยชัดแจ้งให้เว็บไซต์ประมวลผลและจัดส่งข้อมูลไปยังที่อยู่อีเมลที่ระบุไว้
            </li>
          </ol>
        </div>
        <div class="flex items-center mb-4">
          <input type="checkbox" v-model="acceptTerms" class="mr-2" />
          <span>ยอมรับข้อกำหนดและเงื่อนไข</span>
        </div>

        <div class="flex justify-center space-x-4">
          <button class="border px-4 py-2 rounded-md" @click="closeModal">
            ยกเลิก
          </button>

          <button
            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!acceptTerms"
            @click="goToPasswordStep"
          >
            ยืนยันการลบ
          </button>
        </div>
      </div>

      <!-- STEP 2: กรอกรหัสผ่านยืนยันตัวตน -->
      <div v-else-if="step === 2">
        <h3 class="text-center font-semibold text-lg">
          กรุณากรอกรหัสผ่านเพื่อยืนยันตัวตนก่อนลบบัญชี
        </h3>
        <p class="text-red-600 text-center text-sm mb-4">
          กรุณาระบุรหัสผ่านของคุณเพื่อยืนยันตัวตนก่อนดำเนินการลบบัญชีผู้ใช้
        </p>
        <input
          type="password"
          v-model="password"
          placeholder="กรอกรหัสผ่านของคุณ"
          class="w-full border px-3 py-2 rounded-md my-4"
        />

        <div class="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <p class="text-sm font-medium text-gray-700 mb-2">
            OTP และข้อมูลจะถูกส่งไปที่:
          </p>
          <p class="text-sm font-semibold text-blue-600 break-all">
            {{ loadedEmail || "กำลังโหลด..." }}
          </p>
          <p class="text-xs text-gray-600 mt-2">
            โปรดตรวจสอบให้แน่ใจว่าอีเมลนี้ถูกต้อง
          </p>
        </div>
        <div class="bg-yellow-50 border border-yellow-300 rounded-md p-4 mb-6">
          <p class="text-sm text-gray-800">
            <span class="font-semibold">หมายเหตุ:</span>
            ข้อมูลส่วนบุคคลที่จัดส่งจะอยู่ในรูปแบบไฟล์
            <span class="font-semibold">ZIP</span>
            และมีการตั้งรหัสผ่านเพื่อความปลอดภัย โดยรหัสผ่านคือ
            <span class="font-semibold text-red-600"
              >เลขบัตรประจำตัวประชาชน 13 หลัก</span
            >
            ของท่าน
          </p>
        </div>

        <div class="flex justify-center space-x-4 mt-4">
          <button
            class="border px-4 py-2 rounded-md"
            @click="step = 1"
            :disabled="isLoading"
          >
            ย้อนกลับ
          </button>

          <button
            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!isValidPassword || isLoading"
            @click="verifyPassword"
          >
            <span v-if="!isLoading">ส่ง OTP</span>
            <span v-else class="flex items-center gap-2"
              ><svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="white"
                  d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"
                  class="spinner_P7sC"
                />
              </svg>
              กำลังดำเนินการ...</span
            >
          </button>
        </div>
      </div>
      <!--STEP 3:การส่ง OTP ไปยังเมล-->

      <div v-else-if="step === 3" class="text-center">
        <div
          class="w-25 h-25 flex items-center justify-center bg-blue-500 rounded-full mx-auto mb-4"
        >
          <i class="fa-solid fa-envelope text-6xl text-white"></i>
        </div>

        <h3 class="text-lg font-semibold">กำลังส่ง OTP ไปยัง Email ของคุณ</h3>

        <p class="text-gray-500 mb-4">กรุณารอสักครู่</p>

        <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p class="text-sm text-gray-700">
            OTP จะถูกส่งไปที่:
            <span class="font-semibold text-blue-600">{{ email }}</span>
          </p>
        </div>
      </div>

      <!-- STEP 4: OTP -->
      <div v-else-if="step === 4" class="text-center">
        <h3 class="text-lg font-semibold mb-4">กรุณากรอกหมายเลข OTP</h3>

        <!-- Email Confirmation -->
        <div class="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
          <p class="text-sm text-gray-700">
            OTP ได้ถูกส่งไปที่:
            <span class="font-semibold text-blue-600">{{ email }}</span>
          </p>
          <p class="text-xs text-gray-600 mt-1">กรุณาตรวจสอบอีเมลของคุณ</p>
        </div>

        <div class="flex justify-center gap-2 my-4">
          <input
            v-for="(digit, index) in otp"
            :key="index"
            v-model="otp[index]"
            maxlength="1"
            type="text"
            inputmode="numeric"
            class="w-12 h-12 border text-center text-xl rounded"
            @input="handleOTPInput(index, $event)"
            @keydown="handleOTPKeydown(index, $event)"
          />
        </div>

        <p class="text-red-500 text-sm">
          กรุณากรอกภายใน
          <span class="font-bold"> {{ otpMinutes }}:{{ otpSeconds }} </span>
        </p>

        <p v-if="otpError" class="text-red-500 text-sm mt-2">
          {{ otpError }}
        </p>

        <div class="flex justify-center gap-4 mt-4">
          <button class="border px-4 py-2 rounded" @click="cancelDelete">
            ยกเลิก
          </button>

          <button
            class="border px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            @click="resendOTP"
            :disabled="otpTimer > 0"
          >
            ส่งใหม่
          </button>

          <button
            class="bg-red-500 text-white px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            @click="verifyOTP"
            :disabled="otp.join('').length !== 6 || isLoading"
          >
            <span v-if="!isLoading">ยืนยัน</span>
            <span v-else class="flex items-center gap-2"
              ><svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="white"
                  d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"
                  class="spinner_P7sC"
                />
              </svg>
              กำลังตรวจสอบ...</span
            >
          </button>
        </div>
      </div>

      <!-- STEP 6: ลบบัญชีสำเร็จ -->
      <div v-else-if="step === 6" class="text-center">
        <div class="py-6">
          <CheckCircleIcon
            class="w-32 h-32 text-green-600 mx-auto mb-4 items-center-safe"
          />
          <h2 class="text-2xl font-bold text-blue-800 mb-4">
            ลบบัญชีสำเร็จแล้ว
          </h2>

          <p class="text-gray-600 mb-6">บัญชีของคุณถูกลบเรียบร้อยแล้ว</p>
          <p class="text-gray-600 mb-2">
            ระบบจะนำคุณออกจากระบบอัตโนมัติใน
            <span class="font-bold text-red-500">
              {{ countDown }}
            </span>
            วินาที
          </p>

          <button
            class="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
            @click="finishDelete"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>

      <!-- STEP 7 ถ้ายังมีพันธะอยู่ ถ้าจะใช้ตรงคอมเม้นอันนี้ก่อนค่อยใช้อันก่อนหน้า-->
      <div v-else-if="step === 7" class="text-center">
        <div class="py-6">
          <ExclamationCircleIcon class="w-32 h-32 text-red-600 mx-auto mb-4" />
          <h2 class="text-2xl font-bold text-red-600 mb-4">
            ไม่สามารถลบบัญชีได้
          </h2>

          <p class="text-gray-600 mb-6">
            {{ errorMessage }}
          </p>

          <button
            class="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition"
            @click="closeModal"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { CheckCircleIcon } from "@heroicons/vue/24/solid";
import { ExclamationCircleIcon } from "@heroicons/vue/24/solid";
import { useAuth } from "~/composables/useAuth";

import { useToast } from "~/composables/useToast";

const toast = useToast();

const { token, logout } = useAuth();
const { $api } = useNuxtApp();

const config = useRuntimeConfig();

const props = defineProps({
  isVisible: Boolean,
});

const emit = defineEmits(["close", "confirm"]);

const step = ref(1);
const acceptTerms = ref(false);
const email = ref("");
const loadedEmail = ref("");
const password = ref("");
const errorMessage = ref("");
const isLoading = ref(false);

const countDown = ref(5);
let intervalId = null;
const otp = ref(["", "", "", "", "", ""]);
const otpError = ref("");

const otpTimer = ref(300);
let otpInterval = null;

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
  if (otpInterval) {
    clearInterval(otpInterval);
  }
});

const goToPasswordStep = async () => {
  if (!acceptTerms.value) return;
  // เคลียร์ข้อมูลเก่าทั้งหมด
  errorMessage.value = "";
  otpError.value = "";
  otp.value = ["", "", "", "", "", ""];
  password.value = "";
  await fetchUserEmail();
  step.value = 2;
};

const verifyPassword = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = ""; // เคลียร์เมื่อเริ่มต้น

    const res = await $fetch("/auth/verify-user", {
      method: "POST",
      baseURL: config.public.apiBase,
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
      body: {
        password: password.value,
      },
    });

    // ✅ Step 1: ยืนยันรหัสผ่านสำเร็จ

    // ✅ Step 2: ตรวจสอบสถานะการลบ
    const deletionStatus = await $fetch("/users/check-deletion-status", {
      method: "GET",
      baseURL: config.public.apiBase,
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    // ถ้าไม่สามารถลบได้
    if (!deletionStatus?.canDelete) {
      errorMessage.value =
        deletionStatus?.message || "ไม่สามารถลบบัญชีได้ในขณะนี้";
      step.value = 7;
      return;
    }

    // ✅ Step 3: สถานะการลบ OK - ดึง email จาก user profile
    await fetchUserEmail();

    // ถ้ารหัสผ่านถูก + สามารถลบได้ ไปที่ step loading
    errorMessage.value = ""; // เคลียร์ก่อนไปยัง step ต่อไป
    step.value = 3;
    await sendOTP();
  } catch (error) {
    errorMessage.value = error?.data?.message || "รหัสผ่านไม่ถูกต้อง";
    step.value = 7;
  } finally {
    isLoading.value = false;
  }
};

const fetchUserEmail = async () => {
  try {
    const userProfile = await $fetch("/users/me", {
      method: "GET",
      baseURL: config.public.apiBase,
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (userProfile?.data?.email) {
      email.value = userProfile.data.email;
      loadedEmail.value = userProfile.data.email;
    } else {
      console.warn("⚠️ No email in profile response");
      loadedEmail.value = "ไม่พบอีเมลในโปรไฟล์";
    }
  } catch (error) {
    console.error("❌ Error fetching user email:", error);
    console.error("Error response:", error.data);
    loadedEmail.value = `ข้อผิดพลาด: ${error.data?.message || error.message}`;
  }
};

const sendOTP = async () => {
  try {
    errorMessage.value = ""; // เคลียร์ error
    await $fetch("/users/me/delete/request-otp", {
      method: "POST",
      baseURL: config.public.apiBase,
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
      body: {
        password: password.value,
      },
    });

    // เคลียร์ error ก่อนไปยัง step 4
    errorMessage.value = "";
    otpError.value = "";
    step.value = 4;
    startOTPTimer();
  } catch (error) {
    errorMessage.value = "ไม่สามารถส่ง OTP ได้";
    step.value = 7;
  }
};

const startOTPTimer = () => {
  otpTimer.value = 300;

  otpInterval = setInterval(() => {
    otpTimer.value--;

    if (otpTimer.value <= 0) {
      clearInterval(otpInterval);
    }
  }, 1000);
};

const otpMinutes = computed(() => {
  return String(Math.floor(otpTimer.value / 60)).padStart(2, "0");
});

const otpSeconds = computed(() => {
  return String(otpTimer.value % 60).padStart(2, "0");
});

const handleOTPInput = (index, event) => {
  const input = event.target;
  const value = input.value;

  // ถ้ากรอกเลข ให้ย้ายไปกำแพงถัดไป
  if (value && index < 5) {
    otp.value[index] = value.slice(-1); // เก็บแค่ตัวสุดท้าย
    input.nextElementSibling.focus();
  }
  // ถ้าลบ (backspace) และกำแพงปัจจุบันว่าง ให้ย้ายกลับไปกำแพงก่อนหน้า
  else if (!value && index > 0) {
    input.previousElementSibling.focus();
  }
};

const handleOTPKeydown = (index, event) => {
  // ถ้ากด Backspace และกำแพงปัจจุบันว่าง ให้ย้ายไปยัง box ก่อนหน้า
  if (event.key === "Backspace" && !otp.value[index] && index > 0) {
    otp.value[index - 1] = "";
    event.preventDefault();
    const inputs = document.querySelectorAll("input[maxlength='1']");
    if (inputs[index - 1]) {
      inputs[index - 1].focus();
    }
  }
};

const verifyOTP = async () => {
  const code = otp.value.join("");

  // ตรวจสอบว่า OTP ครบ 6 หลักหรือไม่
  if (code.length !== 6) {
    otpError.value = "กรุณากรอก OTP ให้ครบ 6 หลัก";
    return;
  }

  try {
    isLoading.value = true;
    otpError.value = ""; // เคลียร์ error เมื่อเริ่มต้น

    await $fetch("/users/me/delete/confirm", {
      method: "POST",
      baseURL: config.public.apiBase,
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
      body: {
        otp: code,
      },
    });

    // ✅ Success - เคลียร์ทั้งหมดก่อนเข้า Step 6
    clearInterval(otpInterval);
    otpError.value = "";
    errorMessage.value = "";
    password.value = "";
    otp.value = ["", "", "", "", "", ""];
    email.value = "";
    loadedEmail.value = "";
    acceptTerms.value = false;

    // ลบบัญชีสำเร็จแล้ว ไปยัง step 6 โดยตรง
    step.value = 6;

    // ✅ ทันทีที่ OTP verify สำเร็จ จะ logout และปิด modal
    startCountdown();

    // ✅ เพิ่มการ logout ทันทีเพื่อให้แน่ใจว่า session จะหมด
    // ถึงแม้ user ปิด modal หรือรีเฟรช
    setTimeout(async () => {
      try {
        await logout();
      } catch (error) {
        console.error("Logout error:", error);
        // Force redirect ถ้า logout ล้มเหลว
        window.location.href = "/login";
      }
    }, 5000); // รอ 5 วินาทีก่อน logout
  } catch (error) {
    otpError.value = error?.data?.message || "OTP ไม่ถูกต้อง";
  } finally {
    isLoading.value = false;
  }
};

const resendOTP = async () => {
  otp.value = ["", "", "", "", "", ""];
  otpError.value = "";
  await sendOTP();
};

const cancelDelete = () => {
  step.value = 1;
  otp.value = ["", "", "", "", "", ""];
  otpError.value = "";
  password.value = "";
  email.value = "";
  loadedEmail.value = "";
  acceptTerms.value = false;
  if (otpInterval) {
    clearInterval(otpInterval);
    otpInterval = null;
  }
  // รีเฟรชหน้าเพื่อเคลียร์ค่าทั้งหมด
  location.reload();
};

const isValidPassword = computed(() => {
  return password.value.length >= 8;
});

const closeModal = async () => {
  // ถ้า step = 6 (success) ต้อง logout ก่อนปิด modal
  if (step.value === 6) {
    await logout();
    window.location.href = "/login";
    return;
  }

  step.value = 1;
  acceptTerms.value = false;
  email.value = "";
  password.value = "";
  otp.value = ["", "", "", "", "", ""];
  otpError.value = "";
  errorMessage.value = "";
  if (intervalId) clearInterval(intervalId);
  if (otpInterval) clearInterval(otpInterval);
  emit("close");
};

const startCountdown = () => {
  countDown.value = 5;

  intervalId = setInterval(async () => {
    countDown.value--;
    if (countDown.value <= 0) {
      clearInterval(intervalId);
      intervalId = null;

      await logout();
      closeModal();
    }
  }, 1000);
};

const finishDelete = async () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  emit("confirm");
  await logout();
  closeModal();
};
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

.spinner_P7sC {
  transform-origin: center;
  animation: spinner_svv2 0.75s infinite linear;
}
@keyframes spinner_svv2 {
  100% {
    transform: rotate(360deg);
  }
}
</style>
