<template>
  <div class="login">
    <div class="login-card">
      <div class="brand">
        <span class="brand-dot"></span>
        <h1 class="brand-title gradient-text">晓升汐落</h1>
        <p class="brand-sub">技术博客 · 管理后台</p>
      </div>

      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        @submit.prevent="handleLogin"
        class="form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            size="large"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <button
            class="login-btn"
            type="button"
            :disabled="loading"
            @click="handleLogin"
          >
            {{ loading ? "登录中…" : "登 录" }}
          </button>
        </el-form-item>
      </el-form>

      <a class="back-home" @click="goHome">← 返回首页</a>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { login } from "../api/user";

const router = useRouter();
const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  username: "",
  password: "",
});

const rules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

const handleLogin = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;
    try {
      const res = await login(form);
      localStorage.setItem("token", res.token);
      localStorage.setItem("username", res.username);
      localStorage.setItem("nickname", res.nickname);

      ElMessage.success("登录成功");
      router.push("/admin");
    } catch (error) {
      ElMessage.error(error.message || "登录失败，请检查用户名和密码");
    } finally {
      loading.value = false;
    }
  });
};

const goHome = () => {
  router.push("/");
};
</script>

<style scoped>
.login {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.login-card {
  position: relative;
  width: 100%;
  max-width: 400px;
  padding: 48px 40px 36px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid var(--border);
  backdrop-filter: blur(28px) saturate(150%);
  -webkit-backdrop-filter: blur(28px) saturate(150%);
  box-shadow: 0 40px 100px -40px rgba(0, 0, 0, 0.9),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  animation: card-in 0.9s var(--ease) both;
}

.login-card::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: 25px;
  padding: 1px;
  background: linear-gradient(
    135deg,
    rgba(34, 211, 238, 0.5),
    transparent 40%,
    transparent 60%,
    rgba(167, 139, 250, 0.5)
  );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.brand {
  text-align: center;
  margin-bottom: 34px;
}

.brand-dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--gradient);
  box-shadow: 0 0 16px rgba(167, 139, 250, 0.9);
  margin-bottom: 16px;
}

.brand-title {
  font-size: 1.9rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  line-height: 1.2;
}

.brand-sub {
  margin-top: 10px;
  font-size: 0.78rem;
  letter-spacing: 0.24em;
  text-indent: 0.24em;
  color: var(--text-faint);
}

.form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.form :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  box-shadow: none;
  border-radius: 12px;
  padding: 2px 14px;
  transition: border-color 0.3s var(--ease), background 0.3s var(--ease);
}

.form :deep(.el-input__wrapper:hover) {
  border-color: var(--border-strong);
}

.form :deep(.el-input__wrapper.is-focus) {
  border-color: rgba(167, 139, 250, 0.7);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.12);
}

.form :deep(.el-input__inner) {
  color: var(--text);
  height: 44px;
}

.form :deep(.el-input__inner::placeholder) {
  color: var(--text-faint);
}

.form :deep(.el-form-item__error) {
  color: #fda4af;
  font-size: 0.76rem;
  padding-top: 6px;
}

.login-btn {
  width: 100%;
  height: 46px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: #0a0b12;
  background: var(--gradient);
  transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease),
    opacity 0.3s var(--ease);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 18px 44px -18px rgba(167, 139, 250, 0.9);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.back-home {
  display: block;
  margin-top: 26px;
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-faint);
  cursor: pointer;
  transition: color 0.3s var(--ease);
}

.back-home:hover {
  color: var(--text-dim);
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(26px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
