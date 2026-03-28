export default function Loading() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-text-muted">로딩 중...</p>
      </div>
    </section>
  );
}
