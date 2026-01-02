import { jwtDecode } from "jwt-decode";
import type { myJwtPayload } from "~/pages/auth/login.vue";

export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie("token").value;

  if (to.path === "/auth/login" && !token) return;

  if (!token) {
    return navigateTo("/auth/login");
  }

  
  const payload = jwtDecode<myJwtPayload>(token)
  
  if (payload.role === "admin" && !to.path.startsWith('/admin')) {
    return navigateTo("/admin");
  } else if (payload.role === "superAdmin" && !to.path.startsWith('/superAdmin')) {
    return navigateTo("/superAdmin");
  } else if(payload.role === "user" && !to.path.startsWith('/user')){
    return navigateTo("/user");
  }
});
