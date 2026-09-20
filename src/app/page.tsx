export default function Home() {
  return (
    <main className="grid min-h-svh place-items-center bg-background px-6 text-foreground">
      <section className="w-full max-w-4xl">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-teal-600">
          Playground
        </p>
        <h1 className="max-w-3xl text-6xl font-bold leading-[0.95] sm:text-8xl">
          Fresh font, blank canvas.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          Next.js and Tailwind are ready. The starter page is intentionally
          quiet so you can start shaping the playground from here.
        </p>
      </section>
    </main>
  );
}
