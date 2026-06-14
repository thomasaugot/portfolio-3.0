interface Props {
  tag: string
}

export function TechTag({ tag }: Props) {
  return (
    <span className="font-mono text-[13px] py-2 px-3 border border-border-2 bg-surface text-text cursor-default relative transition-[border-color,background] duration-200 hover:border-primary hover:bg-[color-mix(in_oklch,var(--color-primary)_12%,transparent)]">
      {tag}
    </span>
  )
}
