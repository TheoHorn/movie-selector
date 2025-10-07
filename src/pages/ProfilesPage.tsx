import React from 'react'
import { useAppState } from './../state/useAppState'

export default function ProfilesPage(){
  const { users, history } = useAppState()
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Profiles & Insights</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {users.map(u=> (
          <div key={u.id} className="p-4 rounded-2xl bg-white/5 backdrop-blur-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">{u.avatar}</div>
              <div>
                <div className="font-medium">{u.name}</div>
                <div className="text-sm">Coins: {u.coins}</div>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium">Recent Wins</h4>
              <div className="mt-2 space-y-1 text-sm">
                {history.filter(h=>h.selectedOwnerId===u.id).slice(0,6).map(h=> (
                  <div key={h.id}>{new Date(h.timestamp).toLocaleDateString()} — {h.movieTitle}</div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}