import { useEffect, useState } from 'react';
import { Gift, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Panel } from './ui';
import { useGame } from './store';
import { RequestStatus, useRequest } from './Rewards';
import { DAILY_QUESTS, canClaimDailyQuest } from './daily-quests';
import { readDailyQuests, claimDailyQuest } from './daily-quest-services';
import { DiscoveryArt } from './Professions';
import { SCROLLS } from './scrolls';

export function DailyQuests({ onClose, onGather }: { onClose: () => void; onGather: () => void }) {
  const { heroId } = useGame();
  const request = useRequest();
  const [board, setBoard] = useState<Awaited<ReturnType<typeof readDailyQuests>> | null>(null);
  const [receipt, setReceipt] = useState('');
  const load = async () => { if (heroId) setBoard(await readDailyQuests(heroId)); };
  useEffect(() => { void request.run(load); }, [heroId]);
  return <Panel title="Daily Quest Board" onClose={onClose} wide>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">{board ? `${board.quests.filter(q => q.claimed).length}/6 claimed · Resets ${new Date(board.resetAt).toLocaleString()}` : 'Loading commissions…'}</p>
      <div className="flex gap-2"><Button variant="outline" onClick={onGather}>Profession Lodge</Button><Button variant="ghost" size="icon" aria-label="Refresh daily quests" disabled={request.busy} onClick={() => void request.run(load)}><RefreshCw /></Button></div>
    </div>
    <RequestStatus {...request} />
    {receipt && <p role="status" className="mb-3 text-r1">{receipt}</p>}
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {board?.quests.map(quest => <article key={quest.id} className="slot flex flex-col gap-3 p-4">
        <div className="flex items-center gap-3"><DiscoveryArt profession={quest.id} rarity={0} className="h-12 w-12 shrink-0" /><h3 className="font-display text-lg text-gold">{DAILY_QUESTS.find(q => q.id === quest.id)?.name}</h3></div>
        <p className="text-sm text-muted-foreground">Complete one {quest.id === 'treasure' ? 'treasure hunting' : quest.id} journey today.</p>
        <p className="text-sm">{Math.min(quest.progress, quest.target)}/{quest.target} journeys · 1 {SCROLLS[quest.scroll].name}</p>
        <Button disabled={request.busy || !canClaimDailyQuest(quest)} onClick={() => void request.run(async () => {
          await claimDailyQuest(quest.id); setReceipt(`${SCROLLS[quest.scroll].name} added to your inventory`); await load();
        })}>{quest.claimed ? <Check /> : <Gift />}{quest.claimed ? 'Claimed today' : 'Claim reward'}</Button>
      </article>)}
    </div>
  </Panel>;
}