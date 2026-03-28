// 비밀번호 강도 검증
export function validatePassword(password: string): string | null {
  if (password.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
  if (!/[A-Za-z]/.test(password)) return "영문자를 1자 이상 포함해야 합니다.";
  if (!/[0-9]/.test(password)) return "숫자를 1자 이상 포함해야 합니다.";
  return null;
}

// 전화번호 형식 검증
export function validatePhone(phone: string): string | null {
  if (!phone) return null; // 선택 항목
  const cleaned = phone.replace(/[-\s]/g, "");
  if (!/^01[016789]\d{7,8}$/.test(cleaned)) {
    return "올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)";
  }
  return null;
}

// 전화번호 자동 포맷팅
export function formatPhone(value: string): string {
  const nums = value.replace(/\D/g, "").slice(0, 11);
  if (nums.length <= 3) return nums;
  if (nums.length <= 7) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
  return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7)}`;
}
