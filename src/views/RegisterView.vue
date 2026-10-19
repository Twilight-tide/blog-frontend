<template>
  <div class="auth">
    <div class="auth-card">
      <div class="brand">
        <span class="brand-dot"></span>
        <h1 class="brand-title">创建账号</h1>
        <p class="brand-sub">注册后即可参与评论</p>
      </div>

      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        @submit.prevent="handleRegister"
        class="form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名（3-20 位，字母/数字/下划线）"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码（至少 8 位）"
            size="large"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="再次输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleRegister"
          />
        </el-form-item>

        <el-form-item prop="nickname">
          <el-input
            v-model="form.nickname"
            placeholder="昵称（选填）"
            size="large"
            prefix-icon="UserFilled"
          />
        </el-form-item>

        <el-form-item>
          <button
            class="submit-btn"
            type="button"
            :disabled="loading"
            @click="handleRegister"
          >
            {{ loading ? "注册中…" : "注 册" }}
          </button>
        </el-form-item>
      </el-form>

      <div class="switch">
        <span>已有账号？</span>
        <a @click="goLogin">去登录</a>
      </div>
      <a class="back-home" @click="goHome">← 返回首页</a>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { register, login } from "../api/user";
import { useAuthStore } from "../store/auth";

const router = useRouter();
const auth = useAuthStore();
const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  username: "",
  password: "",
  confirmPassword: "",
  nickname: "",
});

const validateConfirm = (rule, value, callback) => {
  if (!value) {
    callback(new Error("请再次输入密码"));
  } else if (value !== form.password) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const rules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "用户名需 3-20 个字符", trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: "只能包含字母、数字和下划线",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 8, max: 64, message: "密码需 8-64 个字符", trigger: "blur" },
  ],
  confirmPassword: [{ validator: validateConfirm, trigger: "blur" }],
  nickname: [{ max: 50, message: "昵称不能超过 50 个字符", trigger: "blur" }],
};

const handleRegister = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;
    try {
      // 1. 注册
      await register({
        username: form.username.trim(),
        password: form.password,
        nickname: form.nickname.trim() || undefined,
      });

      // 2. 自动登录，让用户注册完就能评论
      try {
        const res = await login({
          username: form.username.trim(),
          password: form.password,
        });
        auth.setSession(res);
        ElMessage.success("注册成功，已自动登录");
        router.push("/");
      } catch (loginError) {
        ElMessage.success("注册成功，请登录");
        router.push("/login");
      }
    } catch (error) {
      ElMessage.error(error.message || "注册失败，请稍后重试");
    } finally {
      loading.value = false;
    }
  });
};

const goLogin = () => {
  router.push("/login");
};

const goHome = () => {
  router.push("/");
};
</script>

<style scoped>
.auth {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 390px;
  padding: 44px 38px 32px;
  border-radius: var(--radius);
  background: var(--bg-soft);
  border: 1px solid var(--border);
  box-shadow: var(--card-shadow-hover);
  animation: card-in 0.9s var(--ease) both;
}

.brand {
  text-align: center;
  margin-bottom: 30px;
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
  font-size: 1.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  line-height: 1.25;
  color: var(--text-strong);
}

.brand-sub {
  margin-top: 10px;
  font-size: 0.74rem;
  letter-spacing: 0.18em;
  color: var(--text-faint);
}

.form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.form :deep(.el-input__wrapper) {
  background: var(--bg);
  border: 1px solid var(--border);
  box-shadow: none;
  border-radius: var(--radius-sm);
  padding: 2px 14px;
  transition: border-color 0.3s var(--ease);
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

.submit-btn {
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

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  opacity: 0.92;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.switch {
  margin-top: 22px;
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
  margin-top: 18px;
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
