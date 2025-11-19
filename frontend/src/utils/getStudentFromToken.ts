import { jwtDecode } from 'jwt-decode';

export function getStudentFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    if (decoded.type !== 'student') return null;

    return {
      studentId: decoded.sub,
      type: decoded.type
    };
  } catch (err) {
    return null;
  }
}
