export default function AppShell({ children }) {
  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        {children}
      </div>
    </main>
  );
}

