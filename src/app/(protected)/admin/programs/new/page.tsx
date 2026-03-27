"use client";

import { SubpageHero } from "@/components/layout/SubpageHero";
import { mockCategories } from "@/lib/mock-data";
import { Save, Upload, Plus, X } from "lucide-react";
import { useState } from "react";

export default function AdminProgramNewPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");

  return (
    <div>
      <h1 className="text-2xl font-bold text-text mb-6">교육프로그램 등록</h1>

      <form
        onSubmit={(e) => { e.preventDefault(); alert("목업: 프로그램 등록"); }}
        className="space-y-6 max-w-3xl"
      >
        {/* 기본 정보 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4">기본 정보</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">프로그램명</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="교육프로그램 제목" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">카테고리</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">선택하세요</option>
                  {mockCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">유형</label>
                <select className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="education">교육프로그램</option>
                  <option value="expert">전문가과정</option>
                  <option value="certification">자격증과정</option>
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">대상</label>
                <input type="text" placeholder="기업 임직원, 대학생 등" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">소요시간</label>
                <input type="text" placeholder="4시간, 2일(16시간)" className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">과정 설명</label>
              <textarea rows={4} placeholder="교육 과정에 대한 상세 설명" className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
            </div>
          </div>
        </div>

        {/* 이미지 업로드 */}
        <div className="bg-white border border-border-light rounded-xl p-6">
          <h2 className="text-sm font-bold text-text mb-4">이미지</h2>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
            <Upload size={32} className="mx-auto text-text-muted/40 mb-2" />
            <p className="text-sm text-text-sub">PNG, JPG 이미지를 드래그하거나 클릭하여 업로드</p>
            <p className="text-xs text-text-muted mt-1">최대 10MB, 여러 장 가능</p>
          </div>
        </div>

        {/* 저장 */}
        <div className="flex items-center gap-3">
          <button type="submit" className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
            <Save size={16} /> 등록
          </button>
          <button type="button" className="px-6 py-2.5 rounded-lg text-sm font-medium text-text-sub border border-border-light hover:bg-surface transition-colors">
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
