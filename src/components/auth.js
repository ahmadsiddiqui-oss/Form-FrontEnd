import { jwtDecode } from "jwt-decode";

export function getUserRole() {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  const decoded = jwtDecode(token);
  return decoded.role;
}

export function getUserPermissions() {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log(user);
  if (!user) return null;
  return user.permissions || [];
}
