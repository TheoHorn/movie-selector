// in same file or separate component
import { useAppState } from '../state/useAppState';

function HistoryList({ userId }: { userId: string }) {
  const { history } = useAppState();
  const filtered = history.filter(h => h.selectedOwnerId === userId);
  return (
    <div className="space-y-1 text-sm">
      {filtered.length > 0 ? (
        filtered.slice(0, 10).map(h => (
          <div key={h.id}>{new Date(h.timestamp).toLocaleDateString()} — {h.movieTitle}</div>
        ))
      ) : (
        <div className="italic text-neutral-500">No wins yet</div>
      )}
    </div>
  );
}
export default HistoryList;