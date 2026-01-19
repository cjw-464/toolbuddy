export default function Home() {
	return (
		<main className="min-h-screen bg-neutral-50 px-5 py-8">
			<header className="mb-8">
				<h1 className="text-3xl font-semibold text-neutral-900">Toolbuddy</h1>
				<p className="mt-2 text-neutral-600">
					Your toolbox, organized. Friendly sharing with people you trust.
				</p>
			</header>

			<section className="grid gap-4">
				<button className="w-full rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-black/5">
					<div className="text-sm text-neutral-500">Inventory</div>
					<div className="mt-1 text-xl font-medium text-neutral-900">My Tools</div>
					<div className="mt-2 text-neutral-600">Add, browse, and search your tools.</div>
				</button>

				<button className="w-full rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-black/5">
					<div className="text-sm text-neutral-500">Social</div>
					<div className="mt-1 text-xl font-medium text-neutral-900">Friends</div>
					<div className="mt-2 text-neutral-600">See what friends are willing to lend.</div>
				</button>

				<button className="w-full rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-black/5">
					<div className="text-sm text-neutral-500">Account</div>
					<div className="mt-1 text-xl font-medium text-neutral-900">Profile</div>
					<div className="mt-2 text-neutral-600">Avatar, location, and settings.</div>
				</button>
			</section>

			<nav className="fixed inset-x-0 bottom-0 border-t border-black/5 bg-white/90 backdrop-blur">
				<div className="mx-auto flex max-w-md items-center justify-around px-6 py-4">
					<span className="text-sm font-medium text-neutral-900">Home</span>
					<span className="text-sm text-neutral-500">My Tools</span>
					<span className="text-sm text-neutral-500">Friends</span>
					<span className="text-sm text-neutral-500">Profile</span>
				</div>
			</nav>

			<div className="h-24" />
		</main>
	);
}
