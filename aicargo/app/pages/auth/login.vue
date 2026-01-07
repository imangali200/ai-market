<template>
    <div class="auth-page">
        <button @click="$router.push('/user')" class="back-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5m7-7-7 7 7 7" />
            </svg>
        </button>

        <div class="auth-content">
            <div class="auth-header">
                <h1 class="auth-title">AI Market</h1>
                <p class="auth-subtitle">Присоединяйтесь и отслеживайте свои товары, делитесь новостями.</p>
            </div>

            <form @submit.prevent="postLogin" class="auth-form">
                <div class="input-group">
                    <input v-model="phoneValue" ref="phoneInput" type="text" placeholder="Номер телефона"
                        class="auth-input" :class="{ error: errorPhoneNumber }" />
                </div>

                <div class="input-group">
                    <input v-model="passwordValue" :type="showPassword ? 'text' : 'password'" placeholder="Пароль"
                        class="auth-input" :class="{ error: errorMessage && !errorPhoneNumber }" />
                </div>

                <p v-if="errorMessage || errorPhoneNumber" class="error-text">{{ errorPhoneNumber || errorMessage }}</p>

                <button type="submit" class="auth-submit" :disabled="isLoading">
                    {{ isLoading ? '...' : 'Войти' }}
                </button>

            </form>

            <div class="auth-divider">
                <span>или</span>
            </div>

            <RouterLink to="/auth/register" class="register-btn">
                Регистрация
            </RouterLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import IMask from "imask";

definePageMeta({
    layout: "auth",
});

export interface myJwtPayload {
    role: string;
    sub: number;
    iat: number;
    exp: number;
}

const { $axios } = useNuxtApp();

const phoneInput = ref<HTMLInputElement | null>(null);
const phoneValue = ref<string>("");
const passwordValue = ref<string>("");
const errorMessage = ref<string>("");
const errorPhoneNumber = ref<string>("");
const showPassword = ref<boolean>(false);
const isLoading = ref<boolean>(false);

async function postLogin() {
    if (!phoneValue.value || !passwordValue.value) {
        errorMessage.value = "Заполните все поля";
        return;
    }

    isLoading.value = true;
    errorMessage.value = "";
    errorPhoneNumber.value = "";

    // Remove all non-digit characters to get the clean number
    const cleanPhone = phoneValue.value.replace(/\D/g, "");

    if (cleanPhone.length !== 11) {
        errorPhoneNumber.value = "Введите полный номер телефона (11 цифр)";
        isLoading.value = false;
        return;
    }

    try {
        const res = await $axios.post("auth/login", {
            phoneNumber: cleanPhone,
            password: passwordValue.value,
        });

        if (res.data.accessToken) {
            const token = useCookie("token");
            const refreshToken = useCookie("refreshToken");
            token.value = res.data.accessToken;
            refreshToken.value = res.data.refreshToken;
            return navigateTo("/");
        } else {
            if (res.data.response?.statusCode === 404) {
                errorPhoneNumber.value = "Неверный номер";
            } else if (res.data.response?.statusCode === 400) {
                errorMessage.value = "Неверный пароль";
            }
        }
    } catch (err: any) {
        errorMessage.value = "Ошибка при входе";
    } finally {
        isLoading.value = false;
    }
}

onMounted(() => {
    if (phoneInput.value) {
        IMask(phoneInput.value, {
            mask: "8 (000) 000-00-00",
            lazy: false,
            prepare: (str) => {
                if (str === "+") return "";
                return str;
            }
        });
    }
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
    margin-bottom: 40px;
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

.input-group {
    position: relative;
}

.auth-input {
    width: 100%;
    height: 56px;
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

.error-text {
    font-size: 14px;
    color: #ef4444;
    margin: 4px 0 0;
    text-align: center;
}

.auth-submit {
    height: 56px;
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

.register-btn {
    display: block;
    height: 56px;
    background: transparent;
    border: 1px solid #333;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    text-decoration: none;
    line-height: 54px;
    text-align: center;
    transition: all 0.2s;
}

.register-btn:hover {
    background: #111;
    border-color: #444;
}
</style>
