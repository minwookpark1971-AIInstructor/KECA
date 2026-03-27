import { Plus, Edit2, Trash2, Building2, GripVertical } from "lucide-react";

const mockPartners = [
  { id: "p1", name: "서울시교육청", website: "https://www.sen.go.kr", sort_order: 1 },
  { id: "p2", name: "한국교육학술정보원", website: "https://www.keris.or.kr", sort_order: 2 },
  { id: "p3", name: "한국직업능력연구원", website: "https://www.krivet.re.kr", sort_order: 3 },
  { id: "p4", name: "한국교육과정평가원", website: "https://www.kice.re.kr", sort_order: 4 },
];

export default function AdminPartnersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">파트너 관리</h1>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
          <Plus size={16} /> 파트너 추가
        </button>
      </div>

      <div className="space-y-3">
        {mockPartners.map((partner) => (
          <div key={partner.id} className="bg-white border border-border-light rounded-xl p-4 flex items-center gap-4">
            <GripVertical size={16} className="text-text-muted/40 cursor-grab shrink-0" />
            <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-text-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-text">{partner.name}</h3>
              <p className="text-xs text-text-muted">{partner.website}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button className="p-1.5 text-text-muted hover:text-primary rounded"><Edit2 size={14} /></button>
              <button className="p-1.5 text-text-muted hover:text-error rounded"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
