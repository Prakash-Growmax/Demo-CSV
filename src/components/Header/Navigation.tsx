export function Navigation() {
  const navItems = ["Chat", "Contacts", "Settings"];

  return (
    <nav className="hidden md:flex items-center gap-6">
      {navItems.map((item) => (
        <button
          key={item}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          {item}
        </button>
      ))}
    </nav>
  );
}
