export interface SidebarLink {
  label: string;
  href: string;
  active?: boolean;
}

export interface SidebarProps {
  links: SidebarLink[];
}

export function Sidebar({ links }: SidebarProps) {
  return (
    <nav data-testid="sidebar" className="sidebar">
      <div className="sidebar__label">Menu</div>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          data-testid={`sidebar-link-${link.label.toLowerCase()}`}
          className={`nav-link${link.active ? ' nav-link--active' : ''}`}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
