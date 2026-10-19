<template>
  <div class="login">
    <div class="login-card">
      <div class="brand">
        <span class="brand-dot"></span>
        <h1 class="brand-title">晓升汐落</h1>
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

      <div class="switch">
        <span>还没有账号？</span>
        <a @click="goRegister">立即注册</a>
      </div>

      <a class="back-home" @click="goHome">← 返回首页</a>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { login } from "../api/user";
import { useAuthStore } from "../store/auth";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
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
      auth.setSession(res);

      ElMessage.success("登录成功");

      const redirect = route.query.redirect;
      if (redirect) {
        router.push(redirect);
      } else if (auth.isAdmin) {
        router.push("/admin/dashboard");
      } else if (auth.canPublish) {
        router.push("/author");
      } else {
        router.push("/");
      }
    } catch (error) {
      ElMessage.error(error.message || "登录失败，请检查用户名和密码");
    } finally {
      loading.value = false;
    }
  });
};

const goRegister = () => {
  router.push("/register");
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
  width: 100%;
  max-width: 390px;
  padding: 46px 38px 34px;
  border-radius: var(--radius);
  background: var(--bg-soft);
  border: 1px solid var(--border);
  box-shadow: var(--card-shadow-hover);
  animation: card-in 0.9s var(--ease) both;
}

.brand {
  text-align: center;
  margin-bottom: 32px;
}

.brand-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  margin-bottom: 16px;
}

.brand-title {
  font-family: var(--font-serif);
  font-size: 1.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  line-height: 1.25;
  color: var(--accent);
}

.brand-sub {
  margin-top: 10px;
  font-size: 0.74rem;
  letter-spacing: 0.24em;
  text-indent: 0.24em;
  color: var(--text-faint);
}

.form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.form :deep(.el-input__wrapper) {
  background: var(--bg);
  border: 1px solid var(--border);
  box-shadow: none;
  border-radius: var(--radius-sm);
  padding: 2px 14px;
  transition: border-color 0.3s var(--ease), background 0.3s var(--ease);
}

.form :deep(.el-input__wrapper:hover) {
  border-color: var(--border-strong);
}

.form :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 12%, transparent);
}

.form :deep(.el-input__inner) {
  color: var(--text);
  height: 44px;
}

.form :deep(.el-input__inner::placeholder) {
  color: var(--text-faint);
}

.form :deep(.el-form-item__error) {
  color: #c4453d;
  font-size: 0.74rem;
  padding-top: 6px;
}

.login-btn {
  width: 100%;
  height: 46px;
  border-radius: var(--radius-sm);
  font-size: 0.94rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  color: var(--accent-ink);
  background: var(--accent);
  transition: transform 0.3s var(--ease), opacity 0.3s var(--ease);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  opacity: 0.92;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.switch {
  margin-top: 24px;
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-faint);
}

.switch a {
  margin-left: 5px;
  color: var(--accent);
  cursor: pointer;
}

.back-home {
  display: block;
  margin-top: 24px;
  text-align: center;
  font-size: 0.78rem;
  color: var(--text-faint);
  cursor: pointer;
  transition: color 0.3s var(--ease);
}

.back-home:hover {
  color: var(--accent);
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
