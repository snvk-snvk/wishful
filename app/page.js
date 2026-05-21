export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-12">
      <main className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-zinc-100 px-8 py-10 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Wishful</h1>
          <p className="mt-1 text-zinc-500 text-sm">Generate the right message for every occasion.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700" htmlFor="occasion">
            Occasion
          </label>
          <select
            id="occasion"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
          >
            <option value="">Select an occasion</option>
            <option value="birthday">Birthday</option>
            <option value="anniversary">Anniversary</option>
            <option value="housewarming">Housewarming</option>
            <option value="wedding">Wedding</option>
            <option value="new-baby">New Baby</option>
            <option value="get-well-soon">Get-Well-Soon</option>
            <option value="condolence">Condolence</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700" htmlFor="tone">
            Tone
          </label>
          <select
            id="tone"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
          >
            <option value="">Select a tone</option>
            <option value="warm">Warm / Heartfelt</option>
            <option value="funny">Funny</option>
            <option value="formal">Formal</option>
            <option value="poetic">Poetic</option>
            <option value="casual">Casual</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700" htmlFor="language">
            Language
          </label>
          <select
            id="language"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
          >
            <option value="">Select a language</option>
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
            <option value="marathi">Marathi</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-700" htmlFor="details">
            Personal details <span className="text-zinc-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="details"
            rows={3}
            placeholder="e.g. recipient's name, your relationship, a memory."
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 shadow-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 resize-none"
          />
        </div>

        <button
          type="button"
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 active:bg-zinc-800 transition-colors"
        >
          Generate
        </button>

        <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-6 text-center min-h-[96px] flex items-center justify-center">
          <p className="text-sm text-zinc-400 italic">Your message will appear here.</p>
        </div>
      </main>
    </div>
  );
}
