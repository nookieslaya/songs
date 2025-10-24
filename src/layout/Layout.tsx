type LayoutProps = {
  children?: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen font-lato">
      <header className="mx-auto max-w-5xl px-4 pt-8">
        <div className="card px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Find your favorite Song or Album
          </h1>
          <span className="hidden sm:inline text-sm muted">
            Search. Play. Read.
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-2 sm:px-4 py-6">
        <div className="card p-1 sm:p-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
