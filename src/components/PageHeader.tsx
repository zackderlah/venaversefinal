import FrameRule from './FrameRule';

interface PageHeaderProps {
  title: React.ReactNode;
  /** Muted second line of the headline. */
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

/** Page intro in the shell style: two-tone headline, then a full-bleed rule. */
export default function PageHeader({ title, subtitle, description, actions }: PageHeaderProps) {
  return (
    <>
      <header className="pb-10 md:pb-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h1 className="max-w-3xl text-[2rem] font-bold leading-[1.08] tracking-[-0.035em] lowercase md:text-[2.75rem]">
            <span className="text-vv-fg">{title}</span>
            {subtitle && (
              <>
                <br />
                <span className="text-vv-faint">{subtitle}</span>
              </>
            )}
          </h1>
          {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </div>
        {description && (
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-vv-muted lowercase">{description}</p>
        )}
      </header>
      <FrameRule className="-mx-5 mb-10 md:-mx-8 md:mb-12" />
    </>
  );
}
