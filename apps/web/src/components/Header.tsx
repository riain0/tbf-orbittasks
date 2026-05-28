import { Avatar } from './Avatar';

export interface HeaderProps {
  userName?: string;
  onSignOut?: () => void;
}

export function Header({ userName, onSignOut }: HeaderProps) {
  return (
    <header data-testid="header" className="topbar">
      <div className="topbar__brand">
        <span className="brand-dot" aria-hidden="true" />
        OrbitTasks
      </div>
      {userName && (
        <div className="topbar__user">
          <Avatar name={userName} size={30} />
          <span>{userName}</span>
          {onSignOut && (
            <button onClick={onSignOut} data-testid="signout-button" className="btn btn--ghost">
              Sign out
            </button>
          )}
        </div>
      )}
    </header>
  );
}
