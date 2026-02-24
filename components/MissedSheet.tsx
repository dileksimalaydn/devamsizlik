"use client";

export default function MissedSheet({
  open,
  courseName,
  blocks,
  onPick,
  onClose,
}: {
  open: boolean;
  courseName: string;
  blocks: number;
  onPick: (hours: number) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-3">
      <div className="w-full max-w-md rounded-3xl bg-white p-4 shadow-xl">
        <div className="text-center">
          <div className="text-base font-bold text-slate-900">Kaç saat gelmedin?</div>
          <div className="mt-1 text-xs text-slate-500">
            <span className="font-semibold">{courseName}</span> için seç.
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            onClick={() => onPick(1)}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            1 saat
          </button>
          <button
            onClick={() => onPick(2)}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            2 saat
          </button>
          <button
            onClick={() => onPick(blocks)}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Tamamı
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-3 w-full rounded-2xl bg-slate-100 px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
        >
          İptal
        </button>
      </div>
    </div>
  );
}