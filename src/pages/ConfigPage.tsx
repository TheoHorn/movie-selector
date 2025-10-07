import React, { useState } from 'react'
import { useAppState } from './../state/useAppState'

export default function ConfigPage(){
  const { movies, addMovie, removeMovie, users, updateUser, setUserWeight } = useAppState()
  const [title, setTitle] = useState('')
  const [poster, setPoster] = useState('')

  const add = () => {
    if (!title) return
    // default owner to first user for convenience
    addMovie({ title, poster: poster || 'https://via.placeholder.com/300x450?text=Poster', ownerId: users[0].id })
    setTitle(''); setPoster('')
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg p-4 rounded-2xl">
        <h3 className="font-semibold">Add Movie</h3>
        <div className="mt-3 grid md:grid-cols-3 gap-3">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="p-2 rounded bg-white/2 text-black" />
          <input value={poster} onChange={e=>setPoster(e.target.value)} placeholder="Poster URL" className="p-2 rounded bg-white/2 text-black" />
          <button onClick={add} className="px-3 py-2 rounded bg-green-600">Add</button>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg p-4 rounded-2xl">
        <h3 className="font-semibold">Users</h3>
        <div className="mt-3 space-y-3">
          {users.map(u=> (
            <div key={u.id} className="p-3 rounded bg-white/3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">{u.avatar}</div>
                <div className="flex-1">
                  <div className="font-medium">{u.name}</div>
                  <div className="text-sm">Coins: <input type="number" value={u.coins} onChange={(e)=>updateUser(u.id, { coins: Math.max(0, Number(e.target.value)) })} className="w-20 ml-2 p-1 rounded text-black" /></div>
                </div>
                <div>
                  <button onClick={()=>{
                    const name = prompt('Rename user', u.name)
                    if (name) updateUser(u.id, { name })
                  }} className="px-2 py-1 rounded border">Rename</button>
                </div>
              </div>

              <div className="mt-3 text-sm">Per-movie preference (1 = neutral, &gt;1 increases coin impact)</div>
              <div className="mt-2 grid grid-cols-1 gap-2 max-h-40 overflow-auto">
                {movies.map(m=> (
                  <div key={m.id} className="flex items-center gap-2">
                    <div className="w-36 truncate">{m.title}</div>
                    <input type="range" min={1} max={4} step={0.25} value={(u as any).weights?.[m.id] ?? 1} onChange={(e)=>setUserWeight(u.id, m.id, Number(e.target.value))} />
                    <div className="w-12">{((u as any).weights?.[m.id] ?? 1).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg p-4 rounded-2xl">
        <h3 className="font-semibold">Movies</h3>
        <div className="mt-3 grid md:grid-cols-3 gap-3">
          {movies.map(m=> (
            <div key={m.id} className="p-2 rounded bg-white/3 flex items-center gap-3">
              <img src={m.poster} alt={m.title} className="w-16 h-24 object-cover rounded" />
              <div className="flex-1">
                <div className="font-medium">{m.title}</div>
                <div className="text-sm">Owner: {m.ownerId}</div>
              </div>
              <div>
                <button onClick={()=>removeMovie(m.id)} className="px-2 py-1 rounded border">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}