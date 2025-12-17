import {jwtDecode} from "jwt-decode";

export function getUserRole() {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  const decoded = jwtDecode(token);
  return decoded.role;
}
