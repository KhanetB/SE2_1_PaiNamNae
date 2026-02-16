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
                        <span class="font-semibold"
                            >"เจ้าของข้อมูลส่วนบุคคล"</span
                        >) มีสิทธิในการขอเข้าถึง รับสำเนา
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
                                (1) ข้อมูลอัตลักษณ์และการพิสูจน์ยืนยันตัวตน
                                (Identity & Verification Data):
                            </span>
                            ชื่อผู้ใช้ (Username), ที่อยู่อีเมล, ชื่อ-นามสกุล,
                            เพศ, หมายเลขโทรศัพท์ติดต่อ, ภาพถ่ายประจำตัว,
                            ข้อมูลตามบัตรประจำตัวประชาชน,
                            ภาพถ่ายใบหน้าเพื่อการตรวจสอบ (Selfie)
                            รวมถึงข้อมูลใบอนุญาตขับขี่
                            (ในกรณีผู้ใช้สถานะผู้ให้บริการขับขี่)
                        </li>

                        <li>
                            <span class="font-semibold">
                                (2) ข้อมูลรายละเอียดทรัพย์สิน (Registered
                                Assets):
                            </span>
                            รายละเอียดเชิงเทคนิคและลักษณะทางกายภาพของยานพาหนะ
                            ได้แก่ รุ่น, ประเภท, สี, หมายเลขทะเบียนรถ,
                            จำนวนที่นั่ง และอุปกรณ์ส่วนควบหรือสิ่งอำนวยความสะดวก
                        </li>

                        <li>
                            <span class="font-semibold">
                                (3) ข้อมูลประวัติการทำธุรกรรมและการใช้งาน
                                (Transaction & Activity History):
                            </span>
                            รายละเอียดการสร้างเส้นทาง, ประวัติการสำรองที่นั่ง,
                            วันเวลาที่เกิดรายการ, สถานะธุรกรรม
                            รวมถึงบันทึกเหตุผลแห่งการปฏิเสธหรือยกเลิกรายการ
                            (ถ้ามี)
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
                            <span class="font-semibold"
                                >ความจำกัดความรับผิด:</span
                            >
                            เว็บไซต์ขอปฏิเสธความรับผิดชอบในบรรดาความเสียหาย
                            ความสูญหาย หรือการเข้าถึงข้อมูลโดยมิชอบ
                            (Unauthorized Access)
                            อันเกิดจากการระบุที่อยู่อีเมลผิดพลาด
                            หรือความบกพร่องในระบบรักษาความปลอดภัยของสื่ออิเล็กทรอนิกส์ส่วนบุคคลของผู้ใช้เอง
                        </li>
                    </ul>

                    <!-- Section 3 -->
                    <h3 class="text-xl font-semibold mt-10 mb-4">
                        3. เงื่อนไขและผลแห่งการลบบัญชีผู้ใช้ (Data Erasure &
                        Anonymization)
                    </h3>

                    <p class="mb-6">
                        เมื่อผู้ใช้แสดงเจตนาลบบัญชีและยืนยันคำขอ
                        ให้ถือว่าความตกลงนี้มีผลผูกพันดังนี้:
                    </p>

                    <ul class="list-disc pl-8 space-y-4 mb-8">
                        <li>
                            <span class="font-semibold"
                                >การระงับสิทธิใช้งาน:</span
                            >
                            บัญชีผู้ใช้จะถูกระงับการเข้าถึง (Deactivated)
                            และยุติการให้บริการในทันที
                        </li>
                        <li>
                            <span class="font-semibold"
                                >กระบวนการทำลายข้อมูล:</span
                            >
                            ข้อมูลส่วนบุคคลจะถูกดำเนินการทำให้ไม่สามารถระบุตัวบุคคลได้
                            (Anonymization) หรือลบทำลายตามมาตรฐานทางเทคนิค
                            ภายในระยะเวลาไม่เกิน 90 (เก้าสิบ) วัน
                        </li>
                        <li>
                            <span class="font-semibold"
                                >ข้อยกเว้นการลบข้อมูล:</span
                            >
                            เว็บไซต์ขอสงวนสิทธิในการเก็บรักษาข้อมูลบางส่วนไว้เท่าที่จำเป็น
                            เพื่อประโยชน์ในการพิสูจน์สิทธิ
                            หรือปฏิบัติตามกฎหมายที่เกี่ยวข้อง
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
                        ข้าพเจ้าในฐานะเจ้าของข้อมูลส่วนบุคคล
                        ขอให้คำรับรองต่อเว็บไซต์ว่า:
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
                    <button
                        class="border px-4 py-2 rounded-md"
                        @click="closeModal"
                    >
                        ยกเลิก
                    </button>

                    <button
                        class="bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
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
                <p class="text-red-600 text-center text-sm">
                    ข้อมูลจะถูกส่งไปยังอีเมลที่คุณระบุ กรุณาระบุอีเมลให้ถูกต้อง
                </p>
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
                        class="bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="!isValidEmail || isLoading"
                        @click="confirmDelete"
                    >
                        <span v-if="!isLoading">ยืนยันการลบัญชี</span>
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

            <!-- STEP 3: ลบบัญชีสำเร็จ -->
            <div v-else-if="step === 3" class="text-center">
                <div class="py-6">
                    <CheckCircleIcon
                        class="w-32 h-32 text-green-600 mx-auto mb-4 items-center-safe"
                    />
                    <h2 class="text-2xl font-bold text-blue-800 mb-4">
                        ลบบัญชีสำเร็จแล้ว
                    </h2>

                    <p class="text-gray-600 mb-6">
                        บัญชีของคุณถูกลบเรียบร้อยแล้ว
                    </p>

                    <button
                        class="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
                        @click="finishDelete"
                    >
                        เสร็จสิ้น
                    </button>
                </div>
            </div>

            <!-- STEP 4 ถ้้ายังมีพันธะอยู่ ถ้าจะใช้ตรงคอมเม้นอันนี้ก่อนค่อยใช้อันก่อนหน้า-->
            <div v-else-if="step === 4" class="text-center">
                <div class="py-6">
                    <ExclamationCircleIcon
                        class="w-32 h-32 text-red-600 mx-auto mb-4"
                    />
                    <h2 class="text-2xl font-bold text-red-600 mb-4">
                        ไม่สามารถลบบัญชีได้
                    </h2>

                    <p class="text-gray-600 mb-6">
                        คุณยังมีเส้นทางที่เป็นคนขับซึ่งยังไม่สิ้นสุด
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
import { ref, computed } from "vue";
import { CheckCircleIcon } from "@heroicons/vue/24/solid";
import { ExclamationCircleIcon } from "@heroicons/vue/24/solid";

const { $api } = useNuxtApp();

const config = useRuntimeConfig();

const props = defineProps({
    isVisible: Boolean,
});

const emit = defineEmits(["close", "confirm"]);

const step = ref(1);
const acceptTerms = ref(false);
const email = ref("");

const isLoading = ref(false);

const closeModal = () => {
    step.value = 1;
    acceptTerms.value = false;
    email.value = "";
    emit("close");
};

const goToEmailStep = () => {
    if (!acceptTerms.value) return;
    step.value = 2;
};

const downloadMyData = async () => {
    const token =
        useCookie("token").value ||
        (process.client ? localStorage.getItem("token") : "");

    if (!token) {
        throw new Error("Unauthorized: token not found in download my data");
    }
    const response = await fetch(`${config.public.apiBase}export/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Download failed");
    }

    const blob = await response.blob();

    const contentDisposition = response.headers.get("content-disposition");
    let fileName = "my-data.json";

    if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match?.[-1]) {
            fileName = match[1];
        }
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

const sendBackupToEmail = async () => {
    const token =
        useCookie("token").value ||
        (process.client ? localStorage.getItem("token") : "");

    if (!token) {
        throw new Error(
            "Unauthorized: token not found in send backup to email",
        );
    }
    await $fetch(`/export/email`, {
        method: "POST",
        baseURL: config.public.apiBase,
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: {
            email: email.value,
        },
    });
};

// เปลี่ยนตรงนี้ในการทดสอบเงื่อยนไขพันธะ
const confirmDelete = async () => {
    const router = useRouter();
    try {
        isLoading.value = true;
        const token =
            useCookie("token").value ||
            (process.client ? localStorage.getItem("token") : "");

        if (!token) {
            throw new Error("Unauthorized");
        }
        // await Promise.all([downloadMyData(), sendBackupToEmail()]);

        const response = await $fetch(`/users/me`, {
            method: "DELETE",
            baseURL: config.public.apiBase,
            // query: { permanent: parmanent: "true" : "false "},
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("Delete success: ", response);
        await sendBackupToEmail();
        useCookie("token").value = null;
        useCookie("user").value = null;
        useCookie("session").value = null;

        if (process.client) {
            localStorage.removeItem("token");
        }

        step.value = 3;
    } catch (error) {
        console.error("Error deleting account: ", error);
        if (error?.data?.message) {
            console.error("Backend message: ", error.data.message);
        }

        step.value = 4;
    } finally {
        isLoading.value = false;
    }
};

const finishDelete = async () => {
    emit("confirm");
    const router = useRouter();
    await router.push("/");
    closeModal();
};

const Email = ref("");

const isValidEmail = computed(() => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email.value);
});
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
