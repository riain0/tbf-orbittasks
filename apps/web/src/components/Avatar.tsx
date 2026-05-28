import { initialsOf } from '../lib/format';

export interface AvatarProps {
  name: string;
  size?: number;
}

export function Avatar({ name, size = 32 }: AvatarProps) {
  return (
    <div
      data-testid="avatar"
      title={name}
      className="avatar"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {initialsOf(name)}
    </div>
  );
}
