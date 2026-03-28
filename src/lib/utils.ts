import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 역할 라벨
export const roleLabels: Record<string, string> = {
  pending: "승인대기",
  approved: "승인완료",
  member: "정회원",
  instructor: "강사",
  admin: "관리자",
};

// 역할 배지 색상
export const roleBadgeColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  member: "bg-green-100 text-green-800",
  instructor: "bg-purple-100 text-purple-800",
  admin: "bg-red-100 text-red-800",
};
