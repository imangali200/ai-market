<template>
    <div class="auth-page">
        <button @click="$router.back()" class="back-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5m7-7-7 7 7 7" />
            </svg>
        </button>

        <div class="auth-content">
            <div class="auth-header">
                <h1 class="auth-title">AI Market</h1>
                <p class="auth-subtitle">Зарегистрируйтесь, отслеживайте товары и публикуйте посты.</p>
            </div>

            <form @submit.prevent="postRegister" class="auth-form">
                <input ref="phoneInput" type="text" placeholder="Номер телефона" class="auth-input" />

                <select v-model="selectBranch" class="auth-input auth-select">
                    <option value="">Выберите склад</option>
                    <option v-for="branch in branches" :key="branch.id" :value="branch.branchName">
                        {{ branch.branchName }}
                    </option>
                </select>

                <div class="input-row">
                    <input v-model="codeUser" type="text" placeholder="Код (Ai-000)" class="auth-input"
                        @input="ensureAiPrefix" />
                    <input v-model="name" type="text" placeholder="Имя" class="auth-input" />
                </div>

                <input v-model="surname" type="text" placeholder="Фамилия" class="auth-input" />

                <input v-model="password" type="password" placeholder="Пароль" class="auth-input"
                    :class="{ error: errorMessage }" />

                <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

                <button type="submit" class="auth-submit" :disabled="isLoading">
                    {{ isLoading ? '...' : 'Зарегистрироваться' }}
                </button>
            </form>

            <div class="auth-divider">
                <span>или</span>
            </div>

            <RouterLink to="/auth/login" class="login-btn">
                Войти
            </RouterLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import IMask from "imask";

definePageMeta({
    layout: "auth",
});

export interface Branch {
    branchName: string;
    id: number;
}

const { $axios } = useNuxtApp();

const phoneNumber = ref<string>("");
const selectBranch = ref<string>("");
const codeUser = ref<string>("Ai-");
const name = ref<string>("");
const surname = ref<string>("");
const password = ref<string>("");
const errorMessage = ref<string>("");
const isLoading = ref<boolean>(false);
const branches = ref<Branch[]>([]);

function ensureAiPrefix() {
    if (!codeUser.value.startsWith("Ai-")) {
        codeUser.value = "Ai-" + codeUser.value.replace(/^Ai-?/i, "");
    }
}

async function getBranches() {
    try {
        const res = await $axios.get("branch");
        branches.value = res.data;
    } catch (error) {
        console.error("Failed to load branches:", error);
    }
}

async function postRegister() {
    if (!phoneNumber.value || !codeUser.value || !name.value || !surname.value || !selectBranch.value || !password.value) {
        errorMessage.value = "Заполните все поля";
        return;
    }

    isLoading.value = true;
    errorMessage.value = "";

    // Remove all non-digit characters to get the clean number
    const cleanPhone = phoneNumber.value.replace(/\D/g, "");

    if (cleanPhone.length !== 11) {
        errorMessage.value = "Введите полный номер телефона (11 цифр)";
        isLoading.value = false;
        return;
    }

    try {
        const response = await $axios.post("auth/register", {
            phoneNumber: cleanPhone,
            code: codeUser.value,
            name: name.value,
            surname: surname.value,
            branch: selectBranch.value,
            password: password.value,
        });

        if (response.data.accessToken) {
            const token = useCookie("token");
            const refreshToken = useCookie("refreshToken");
            token.value = response.data.accessToken;
            refreshToken.value = response.data.refreshToken;
            return navigateTo("/user/me");
        }
    } catch (error) {
        errorMessage.value = "Ошибка при регистрации";
    } finally {
        isLoading.value = false;
    }
}

const phoneInput = ref<HTMLInputElement | null>(null);

onMounted(() => {
    if (phoneInput.value) {
        const mask = IMask(phoneInput.value, {
            mask: "8 (000) 000-00-00",
            lazy: false,
            prepare: (str) => {
                if (str === "+") return "";
                return str;
            }
        });

        mask.on("accept", () => {
            phoneNumber.value = mask.value;
        });
    }
    getBranches();
});
</script>

<style scoped>
.auth-page {
    min-height: 100vh;
    background: #000;
    display: flex;
    flex-direction: column;
    padding: 16px;
}

.back-btn {
    position: absolute;
    top: 16px;
    left: 16px;
    width: 44px;
    height: 44px;
    background: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

.back-btn:hover {
    background: #111;
}

.auth-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 400px;
    margin: 0 auto;
    width: 100%;
    padding: 40px 0;
}

.auth-header {
    text-align: center;
    margin-bottom: 32px;
}

.auth-title {
    font-size: 32px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 16px;
}

.auth-subtitle {
    font-size: 16px;
    color: #666;
    line-height: 1.5;
    margin: 0;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.input-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.auth-input {
    width: 100%;
    height: 52px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 12px;
    padding: 0 16px;
    font-size: 16px;
    color: #fff;
    outline: none;
    transition: all 0.2s;
    box-sizing: border-box;
}

.auth-input::placeholder {
    color: #666;
}

.auth-input:focus {
    border-color: #fff;
    background: #111;
}

.auth-input.error {
    border-color: #ef4444;
}

.auth-select {
    appearance: none;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23666' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
    padding-right: 40px;
}

.auth-select option {
    background: #1a1a1a;
    color: #fff;
}

.error-text {
    font-size: 14px;
    color: #ef4444;
    margin: 4px 0 0;
    text-align: center;
}

.auth-submit {
    height: 52px;
    background: #fff;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    color: #000;
    cursor: pointer;
    margin-top: 8px;
    transition: all 0.2s;
}

.auth-submit:hover {
    background: #e5e5e5;
}

.auth-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.auth-divider {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 24px 0;
}

.auth-divider::before,
.auth-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #333;
}

.auth-divider span {
    font-size: 14px;
    color: #666;
}

.login-btn {
    display: block;
    height: 52px;
    background: transparent;
    border: 1px solid #333;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    text-decoration: none;
    line-height: 50px;
    text-align: center;
    transition: all 0.2s;
}

.login-btn:hover {
    background: #111;
    border-color: #444;
}

@media (max-width: 480px) {
    .input-row {
        grid-template-columns: 1fr;
    }
}
</style>
