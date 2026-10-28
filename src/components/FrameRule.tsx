/** Full-bleed divider with "+" marks where it crosses the frame rails. */
export default function FrameRule({ className = '' }: { className?: string }) {
  return (
    <div className={`vv-rule ${className}`} aria-hidden="true">
      <span className="vv-cross -left-[6px]" />
      <span className="vv-cross -right-[6px]" />
    </div>
  );
}
