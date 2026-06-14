</header>

      {visibleCategories.length > 0 && (
        <div className={`scrollbar-none sticky top-0 z-30 flex gap-2 overflow-x-auto bg-[#f3efe4] px-4 py-3 mx-auto max-w-md ${searchQuery.trim() ? "opacity-40" : ""}`}>
          {visibleCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSearchQuery("");
                scrollToCategory(c.id);
              }}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                activeCategory === c.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-muted-foreground"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <main className="mx-auto max-w-md px-4 py-4">