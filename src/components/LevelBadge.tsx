import React from 'react';
import Link from 'next/link';
import './LevelBadge.css';

const levelColors = [
  { min: 0, max: 4, color: 'bg-gray-400' },
  { min: 5, max: 9, color: 'bg-blue-500' },
  { min: 10, max: 14, color: 'bg-green-500' },
  { min: 15, max: 19, color: 'bg-yellow-400' },
  { min: 20, max: 24, color: 'bg-orange-500' },
  { min: 25, max: 29, color: 'bg-red-600' },
  { min: 30, max: 39, color: 'bg-purple-600' },
  { min: 40, max: 49, color: 'bg-pink-500' },
];

function getLevelColor(level: number) {
  if (level >= 50) return 'rainbow-badge animate-rainbow';
  for (const { min, max, color } of levelColors) {
    if (level >= min && level <= max) return color;
  }
  return 'bg-gray-400';
}

export default function LevelBadge({ level, href }: { level: number, href?: string }) {
  const colorClass = getLevelColor(level);
  const badge = (
    <span className={`level-badge ${colorClass}`} title={`Level ${level}`}>{level}</span>
  );
  const content = <span className="flex items-center gap-1"><span className="text-base font-bold">Lv.</span>{badge}</span>;
  return href ? <Link href={href}>{content}</Link> : content;
} 