import { jwtDecode } from 'jwt-decode';

export default class User {
    static getUser() {
        const token = localStorage.getItem("token");
        if (!token) return null;
        try {
            const decoded = jwtDecode(token);
            return decoded.userData; // Backend-dən gələn istifadəçi datası
        } catch (e) {
            return null;
        }
    }

    static getRole() {
        const user = this.getUser();
        return user?.role; // 'superadmin', 'admin' və ya 'operator'
    }

    static isSuperAdmin() { return this.getRole() === 'superadmin'; }
    static isAdmin() { return this.getRole() === 'admin' || this.isSuperAdmin(); }
}